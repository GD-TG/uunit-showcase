from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.models.project import ProjectMilestone, ProjectSubmission, ProjectReview, AwardWinner
from app.models.team import ProjectTeam, TeamMember
from app.models.case import CaseProject
from app.models.user import User, StudentProfile
from app.models.notification import Notification
from app.schemas.project import (
    MilestoneCreate, MilestoneUpdate, MilestoneResponse,
    SubmissionCreate, SubmissionResponse,
    ReviewCreate, ReviewResponse,
    AwardWinnerCreate
)
from app.api.deps import get_current_user, require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/projects", tags=["Сопровождение и оценка проектов"])

# --- Контрольные точки (Milestones) ---
@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    milestone_in: MilestoneUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    m = await db.get(ProjectMilestone, milestone_id)
    if not m:
        raise HTTPException(status_code=404, detail="Контрольная точка не найдена")

    old_status = m.status
    if milestone_in.title:
        m.title = milestone_in.title
    if milestone_in.description:
        m.description = milestone_in.description
    if milestone_in.due_date:
        m.due_date = milestone_in.due_date
    if milestone_in.status:
        m.status = milestone_in.status
    if milestone_in.reviewer_comment:
        m.reviewer_comment = milestone_in.reviewer_comment

    await db.commit()
    await db.refresh(m)

    await log_audit_event(
        db=db,
        action_type="MILESTONE_UPDATED",
        entity_type="milestone",
        entity_id=str(m.id),
        user_id=current_user.id,
        user_email=current_user.email,
        old_values={"status": old_status},
        new_values={"status": m.status, "comment": m.reviewer_comment},
        ip_address=request.client.host if request.client else "unknown"
    )

    return MilestoneResponse(
        id=m.id,
        order_index=m.order_index,
        title=m.title,
        description=m.description,
        due_date=m.due_date,
        status=m.status,
        reviewer_comment=m.reviewer_comment
    )

# --- Сдача результатов (Submissions) ---
@router.post("/submissions", response_model=SubmissionResponse)
async def create_submission(
    sub_in: SubmissionCreate,
    request: Request,
    current_user: User = Depends(require_roles(["STUDENT", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    team = await db.get(ProjectTeam, sub_in.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    submission = ProjectSubmission(
        team_id=sub_in.team_id,
        milestone_id=sub_in.milestone_id,
        is_final=sub_in.is_final,
        solution_description=sub_in.solution_description,
        repository_url=sub_in.repository_url,
        demo_url=sub_in.demo_url,
        presentation_url=sub_in.presentation_url,
        video_url=sub_in.video_url,
        screenshots=sub_in.screenshots or [],
        documentation_url=sub_in.documentation_url,
        extra_materials=sub_in.extra_materials or {},
        status="SUBMITTED"
    )
    db.add(submission)

    # Update milestone status if attached
    if sub_in.milestone_id:
        m = await db.get(ProjectMilestone, sub_in.milestone_id)
        if m:
            m.status = "SUBMITTED"

    # If it is final, update team and case status
    if sub_in.is_final:
        team.status = "SUBMITTED"
        case = await db.get(CaseProject, team.case_id)
        if case:
            case.status = "REVIEWING"

    await db.commit()
    await db.refresh(submission)

    await log_audit_event(
        db=db,
        action_type="SUBMISSION_CREATED",
        entity_type="submission",
        entity_id=str(submission.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"is_final": submission.is_final, "team_id": team.id},
        ip_address=request.client.host if request.client else "unknown"
    )

    return SubmissionResponse(
        id=submission.id,
        team_id=submission.team_id,
        team_name=team.name,
        milestone_id=submission.milestone_id,
        is_final=submission.is_final,
        solution_description=submission.solution_description,
        repository_url=submission.repository_url,
        demo_url=submission.demo_url,
        presentation_url=submission.presentation_url,
        video_url=submission.video_url,
        screenshots=submission.screenshots or [],
        documentation_url=submission.documentation_url,
        status=submission.status,
        submitted_at=submission.submitted_at,
        reviews=[]
    )

@router.get("/team/{team_id}/submissions", response_model=List[SubmissionResponse])
async def get_team_submissions(
    team_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ProjectSubmission)
        .options(
            selectinload(ProjectSubmission.team),
            selectinload(ProjectSubmission.reviews).selectinload(ProjectReview.reviewer)
        )
        .where(ProjectSubmission.team_id == team_id)
        .order_by(ProjectSubmission.submitted_at.desc())
    )
    result = await db.execute(query)
    subs = result.scalars().all()

    response = []
    for s in subs:
        reviews_resp = [
            ReviewResponse(
                id=r.id,
                submission_id=r.submission_id,
                reviewer_id=r.reviewer_id,
                reviewer_name=f"{r.reviewer.first_name} {r.reviewer.last_name}" if r.reviewer else "Эксперт",
                score_completeness=r.score_completeness,
                score_implementation_quality=r.score_implementation_quality,
                score_code_quality=r.score_code_quality,
                score_architecture=r.score_architecture,
                score_spec_compliance=r.score_spec_compliance,
                score_usability=r.score_usability,
                score_originality=r.score_originality,
                score_documentation=r.score_documentation,
                score_deadline_adherence=r.score_deadline_adherence,
                score_teamwork=r.score_teamwork,
                total_score=r.total_score,
                company_feedback=r.company_feedback,
                created_at=r.created_at
            )
            for r in (s.reviews or [])
        ]
        response.append(SubmissionResponse(
            id=s.id,
            team_id=s.team_id,
            team_name=s.team.name if s.team else None,
            milestone_id=s.milestone_id,
            is_final=s.is_final,
            solution_description=s.solution_description,
            repository_url=s.repository_url,
            demo_url=s.demo_url,
            presentation_url=s.presentation_url,
            video_url=s.video_url,
            screenshots=s.screenshots or [],
            documentation_url=s.documentation_url,
            status=s.status,
            submitted_at=s.submitted_at,
            reviews=reviews_resp
        ))
    return response

# --- Оценка компании по 10 критериям (Reviews) ---
@router.post("/reviews", response_model=ReviewResponse)
async def create_review(
    rev_in: ReviewCreate,
    request: Request,
    current_user: User = Depends(require_roles(["COMPANY", "ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    submission = await db.get(ProjectSubmission, rev_in.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Решение не найдено")

    review = ProjectReview(
        submission_id=rev_in.submission_id,
        reviewer_id=current_user.id,
        score_completeness=rev_in.score_completeness,
        score_implementation_quality=rev_in.score_implementation_quality,
        score_code_quality=rev_in.score_code_quality,
        score_architecture=rev_in.score_architecture,
        score_spec_compliance=rev_in.score_spec_compliance,
        score_usability=rev_in.score_usability,
        score_originality=rev_in.score_originality,
        score_documentation=rev_in.score_documentation,
        score_deadline_adherence=rev_in.score_deadline_adherence,
        score_teamwork=rev_in.score_teamwork,
        total_score=rev_in.total_score,
        company_feedback=rev_in.company_feedback
    )
    db.add(review)

    submission.status = "ACCEPTED"
    
    # Update team status
    team = await db.get(ProjectTeam, submission.team_id)
    if team and submission.is_final:
        team.status = "COMPLETED"
        case = await db.get(CaseProject, team.case_id)
        if case:
            case.status = "COMPLETED"

        # Update rating and completed projects for all members
        members_res = await db.execute(
            select(TeamMember).where(TeamMember.team_id == team.id)
        )
        for m in members_res.scalars().all():
            st_prof_res = await db.execute(
                select(StudentProfile).where(StudentProfile.user_id == m.user_id)
            )
            st_prof = st_prof_res.scalars().first()
            if st_prof:
                st_prof.completed_projects_count += 1
                st_prof.rating = float(st_prof.rating or 0) + (rev_in.total_score * 0.5)

    await db.commit()
    await db.refresh(review)

    await log_audit_event(
        db=db,
        action_type="SCORE_SUBMITTED",
        entity_type="submission",
        entity_id=str(submission.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"total_score": review.total_score, "feedback": review.company_feedback},
        ip_address=request.client.host if request.client else "unknown"
    )

    return ReviewResponse(
        id=review.id,
        submission_id=review.submission_id,
        reviewer_id=review.reviewer_id,
        reviewer_name=f"{current_user.first_name} {current_user.last_name}",
        score_completeness=review.score_completeness,
        score_implementation_quality=review.score_implementation_quality,
        score_code_quality=review.score_code_quality,
        score_architecture=review.score_architecture,
        score_spec_compliance=review.score_spec_compliance,
        score_usability=review.score_usability,
        score_originality=review.score_originality,
        score_documentation=review.score_documentation,
        score_deadline_adherence=review.score_deadline_adherence,
        score_teamwork=review.score_teamwork,
        total_score=review.total_score,
        company_feedback=review.company_feedback,
        created_at=review.created_at
    )

# --- Присуждение призовых мест (Award Winners) ---
@router.post("/awards")
async def declare_winner(
    award_in: AwardWinnerCreate,
    request: Request,
    current_user: User = Depends(require_roles(["COMPANY", "ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    award = AwardWinner(
        case_id=award_in.case_id,
        team_id=award_in.team_id,
        place=award_in.place,
        nomination_name=award_in.nomination_name,
        reward_detail=award_in.reward_detail
    )
    db.add(award)

    # Award bonus rating to team members
    members_res = await db.execute(
        select(TeamMember).where(TeamMember.team_id == award_in.team_id)
    )
    for m in members_res.scalars().all():
        st_prof_res = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == m.user_id)
        )
        st_prof = st_prof_res.scalars().first()
        if st_prof:
            st_prof.rating = float(st_prof.rating or 0) + 30.0

    await db.commit()

    await log_audit_event(
        db=db,
        action_type="WINNER_DECLARED",
        entity_type="award",
        entity_id=str(award.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"case_id": award_in.case_id, "place": award_in.place},
        ip_address=request.client.host if request.client else "unknown"
    )

    return {"status": "success", "message": f"Победитель определен: {award_in.place}"}

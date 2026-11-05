from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, desc
from typing import List, Optional

from app.db.session import get_db
from app.models.showcase import StudentShowcaseProject
from app.models.user import User, StudentProfile
from app.schemas.showcase import StudentShowcaseCreate, StudentShowcaseResponse
from app.api.deps import get_current_user, require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/showcase", tags=["Витрина студенческих проектов"])

@router.get("", response_model=List[StudentShowcaseResponse])
async def get_showcase_projects(
    db: AsyncSession = Depends(get_db),
    project_type: Optional[str] = None,
    direction: Optional[str] = None,
    tag: Optional[str] = None,  # seeking_team, open_for_job, etc.
    search: Optional[str] = None
):
    query = (
        select(StudentShowcaseProject)
        .options(selectinload(StudentShowcaseProject.author).selectinload(User.student_profile))
        .where(StudentShowcaseProject.moderation_status == "APPROVED")
    )

    if project_type and project_type != "ALL":
        query = query.where(StudentShowcaseProject.project_type == project_type)
    if direction and direction != "ALL":
        query = query.where(StudentShowcaseProject.direction == direction)
    if tag == "seeking_team":
        query = query.where(StudentShowcaseProject.seeking_team == True)
    elif tag == "seeking_partner":
        query = query.where(StudentShowcaseProject.seeking_partner == True)
    elif tag == "open_for_job":
        query = query.where(StudentShowcaseProject.open_for_job == True)
    elif tag == "open_for_internship":
        query = query.where(StudentShowcaseProject.open_for_internship == True)
    elif tag == "seeking_investor":
        query = query.where(StudentShowcaseProject.seeking_investor == True)

    if search:
        search_filter = or_(
            StudentShowcaseProject.title.ilike(f"%{search}%"),
            StudentShowcaseProject.short_description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)

    query = query.order_by(desc(StudentShowcaseProject.created_at))
    result = await db.execute(query)
    projects = result.scalars().all()

    response = []
    for p in projects:
        author = p.author
        prof = author.student_profile if author else None
        response.append(StudentShowcaseResponse(
            id=p.id,
            author_id=p.author_id,
            author_name=f"{author.first_name} {author.last_name}" if author else "Студент",
            author_faculty=prof.faculty if prof else None,
            author_course=prof.course if prof else None,
            title=p.title,
            cover_image_url=p.cover_image_url,
            project_type=p.project_type,
            short_description=p.short_description,
            detailed_description=p.detailed_description,
            problem_solved=p.problem_solved,
            technologies=p.technologies or [],
            direction=p.direction,
            github_url=p.github_url,
            gitlab_url=p.gitlab_url,
            live_demo_url=p.live_demo_url,
            presentation_url=p.presentation_url,
            video_url=p.video_url,
            screenshots=p.screenshots or [],
            seeking_partner=p.seeking_partner,
            seeking_team=p.seeking_team,
            seeking_mentor=p.seeking_mentor,
            seeking_investor=p.seeking_investor,
            open_for_internship=p.open_for_internship,
            open_for_job=p.open_for_job,
            moderation_status=p.moderation_status,
            likes_count=p.likes_count,
            created_at=p.created_at
        ))
    return response

@router.post("", response_model=StudentShowcaseResponse)
async def create_showcase_project(
    p_in: StudentShowcaseCreate,
    request: Request,
    current_user: User = Depends(require_roles(["STUDENT", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    project = StudentShowcaseProject(
        author_id=current_user.id,
        title=p_in.title,
        cover_image_url=p_in.cover_image_url or "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
        project_type=p_in.project_type,
        short_description=p_in.short_description,
        detailed_description=p_in.detailed_description,
        problem_solved=p_in.problem_solved,
        technologies=p_in.technologies,
        direction=p_in.direction,
        github_url=p_in.github_url,
        gitlab_url=p_in.gitlab_url,
        live_demo_url=p_in.live_demo_url,
        presentation_url=p_in.presentation_url,
        video_url=p_in.video_url,
        screenshots=p_in.screenshots or [],
        seeking_partner=p_in.seeking_partner,
        seeking_team=p_in.seeking_team,
        seeking_mentor=p_in.seeking_mentor,
        seeking_investor=p_in.seeking_investor,
        open_for_internship=p_in.open_for_internship,
        open_for_job=p_in.open_for_job,
        moderation_status="APPROVED"
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    await log_audit_event(
        db=db,
        action_type="STUDENT_PROJECT_CREATED",
        entity_type="showcase",
        entity_id=str(project.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"title": project.title, "type": project.project_type},
        ip_address=request.client.host if request.client else "unknown"
    )

    prof = current_user.student_profile
    return StudentShowcaseResponse(
        id=project.id,
        author_id=project.author_id,
        author_name=f"{current_user.first_name} {current_user.last_name}",
        author_faculty=prof.faculty if prof else None,
        author_course=prof.course if prof else None,
        title=project.title,
        cover_image_url=project.cover_image_url,
        project_type=project.project_type,
        short_description=project.short_description,
        detailed_description=project.detailed_description,
        problem_solved=project.problem_solved,
        technologies=project.technologies or [],
        direction=project.direction,
        github_url=project.github_url,
        gitlab_url=project.gitlab_url,
        live_demo_url=project.live_demo_url,
        presentation_url=project.presentation_url,
        video_url=project.video_url,
        screenshots=project.screenshots or [],
        seeking_partner=project.seeking_partner,
        seeking_team=project.seeking_team,
        seeking_mentor=project.seeking_mentor,
        seeking_investor=project.seeking_investor,
        open_for_internship=project.open_for_internship,
        open_for_job=project.open_for_job,
        moderation_status=project.moderation_status,
        likes_count=project.likes_count,
        created_at=project.created_at
    )

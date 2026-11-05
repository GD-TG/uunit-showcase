from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, or_
from typing import List, Optional

from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.team import TeamMember, ProjectTeam
from app.models.project import ProjectReview, ProjectSubmission, AwardWinner
from app.models.case import CaseProject
from app.models.showcase import StudentShowcaseProject
from app.api.deps import get_current_user

router = APIRouter(prefix="/talents", tags=["Поиск талантов и Портфолио"])

@router.get("/students")
async def search_students(
    db: AsyncSession = Depends(get_db),
    faculty: Optional[str] = None,
    course: Optional[int] = None,
    competency: Optional[str] = None,
    search: Optional[str] = None
):
    query = (
        select(User)
        .options(selectinload(User.student_profile))
        .where(User.role == "STUDENT")
        .where(User.is_active == True)
    )

    result = await db.execute(query)
    users = result.scalars().all()

    filtered = []
    for u in users:
        p = u.student_profile
        if not p:
            continue
        if faculty and faculty != "ALL" and faculty.lower() not in p.faculty.lower():
            continue
        if course and p.course != course:
            continue
        if competency and competency != "ALL":
            comps = [c.lower() for c in (p.competencies or []) + (p.technologies or [])]
            if not any(competency.lower() in c for c in comps):
                continue
        if search:
            full_text = f"{u.first_name} {u.last_name} {p.faculty} {p.field_of_study} {' '.join(p.technologies or [])}".lower()
            if search.lower() not in full_text:
                continue

        filtered.append({
            "id": u.id,
            "name": f"{u.first_name} {u.last_name}",
            "avatar_url": u.avatar_url,
            "faculty": p.faculty,
            "field_of_study": p.field_of_study,
            "course": p.course,
            "academic_group": p.academic_group,
            "bio": p.bio,
            "technologies": p.technologies or [],
            "competencies": p.competencies or [],
            "completed_projects_count": p.completed_projects_count,
            "rating": float(p.rating or 0),
            "github_url": p.github_url,
            "portfolio_url": p.portfolio_url
        })

    filtered.sort(key=lambda x: x["rating"], reverse=True)
    return filtered

@router.get("/portfolio/{user_id}")
async def get_student_portfolio(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    user_res = await db.execute(
        select(User)
        .options(selectinload(User.student_profile))
        .where(User.id == user_id)
    )
    user = user_res.scalars().first()
    if not user or user.role != "STUDENT":
        raise HTTPException(status_code=404, detail="Студент не найден")

    prof = user.student_profile

    # Fetch completed corporate cases
    teams_query = (
        select(ProjectTeam)
        .options(
            selectinload(ProjectTeam.case).selectinload(CaseProject.company),
            selectinload(ProjectTeam.submissions).selectinload(ProjectSubmission.reviews),
            selectinload(ProjectTeam.members)
        )
        .join(TeamMember)
        .where(TeamMember.user_id == user_id)
    )
    teams_res = await db.execute(teams_query)
    teams = teams_res.scalars().all()

    confirmed_cases = []
    for t in teams:
        case = t.case
        reviews = []
        for s in t.submissions:
            for r in s.reviews:
                reviews.append({
                    "total_score": r.total_score,
                    "company_feedback": r.company_feedback,
                    "reviewer_id": r.reviewer_id
                })

        # Check if won any award
        award_res = await db.execute(
            select(AwardWinner).where(AwardWinner.team_id == t.id)
        )
        award = award_res.scalars().first()

        confirmed_cases.append({
            "case_id": case.id,
            "case_title": case.title,
            "company_name": case.company.short_name if case.company else "Партнер УУНиТ",
            "company_logo": case.company.logo_url if case.company else None,
            "direction": case.direction,
            "category": case.category,
            "team_name": t.name,
            "status": t.status,
            "is_confirmed_by_company": True,
            "award": {
                "place": award.place,
                "nomination": award.nomination_name,
                "reward_detail": award.reward_detail
            } if award else None,
            "reviews": reviews
        })

    # Fetch pet projects / showcase
    showcase_res = await db.execute(
        select(StudentShowcaseProject)
        .where(StudentShowcaseProject.author_id == user_id)
        .order_by(StudentShowcaseProject.created_at.desc())
    )
    showcase_projects = showcase_res.scalars().all()

    return {
        "student": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "patronymic": user.patronymic,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "faculty": prof.faculty if prof else "УУНиТ",
            "field_of_study": prof.field_of_study if prof else "",
            "study_program": prof.study_program if prof else "",
            "course": prof.course if prof else 1,
            "academic_group": prof.academic_group if prof else "",
            "bio": prof.bio if prof else "",
            "professional_interests": prof.professional_interests if prof else [],
            "competencies": prof.competencies if prof else [],
            "technologies": prof.technologies if prof else [],
            "github_url": prof.github_url if prof else None,
            "gitlab_url": prof.gitlab_url if prof else None,
            "portfolio_url": prof.portfolio_url if prof else None,
            "rating": float(prof.rating or 0) if prof else 0.0,
            "completed_projects_count": prof.completed_projects_count if prof else 0
        },
        "confirmed_company_cases": confirmed_cases,
        "showcase_projects": [
            {
                "id": sp.id,
                "title": sp.title,
                "project_type": sp.project_type,
                "short_description": sp.short_description,
                "direction": sp.direction,
                "technologies": sp.technologies,
                "github_url": sp.github_url,
                "live_demo_url": sp.live_demo_url,
                "created_at": sp.created_at
            }
            for sp in showcase_projects
        ]
    }

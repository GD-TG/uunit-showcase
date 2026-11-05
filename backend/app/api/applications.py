from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.models.application import CaseApplication
from app.models.case import CaseProject
from app.models.user import User, StudentProfile
from app.models.notification import Notification
from app.schemas.application import CaseApplicationCreate, CaseApplicationStatusUpdate, CaseApplicationResponse
from app.api.deps import get_current_user, require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/applications", tags=["Заявки на проекты"])

@router.post("", response_model=CaseApplicationResponse)
async def submit_application(
    app_in: CaseApplicationCreate,
    request: Request,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    case = await db.get(CaseProject, app_in.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    # Check if already applied
    existing = await db.execute(
        select(CaseApplication).where(
            CaseApplication.case_id == app_in.case_id,
            CaseApplication.student_id == current_user.id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Вы уже подали заявку на этот кейс")

    # Get student profile defaults if fields are empty
    prof = current_user.student_profile
    resume = app_in.resume_url or (prof.portfolio_url if prof else None)
    github = app_in.github_url or (prof.github_url if prof else None)

    application = CaseApplication(
        case_id=app_in.case_id,
        student_id=current_user.id,
        cover_letter=app_in.cover_letter,
        resume_url=resume,
        portfolio_url=app_in.portfolio_url or (prof.portfolio_url if prof else None),
        github_url=github,
        prior_experience=app_in.prior_experience,
        status="PENDING"
    )
    db.add(application)
    await db.flush()

    # Create notification for company representative
    # Find company reps
    # Log audit
    await log_audit_event(
        db=db,
        action_type="APPLICATION_SUBMITTED",
        entity_type="application",
        entity_id=str(application.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"case_id": case.id, "case_title": case.title},
        ip_address=request.client.host if request.client else "unknown"
    )

    await db.commit()
    await db.refresh(application)

    return CaseApplicationResponse(
        id=application.id,
        case_id=application.case_id,
        case_title=case.title,
        student_id=current_user.id,
        student_name=f"{current_user.first_name} {current_user.last_name}",
        student_faculty=prof.faculty if prof else None,
        student_course=prof.course if prof else None,
        cover_letter=application.cover_letter,
        resume_url=application.resume_url,
        portfolio_url=application.portfolio_url,
        github_url=application.github_url,
        prior_experience=application.prior_experience,
        status=application.status,
        company_feedback=application.company_feedback,
        created_at=application.created_at
    )

@router.get("/case/{case_id}", response_model=List[CaseApplicationResponse])
async def get_case_applications(
    case_id: int,
    current_user: User = Depends(require_roles(["COMPANY", "ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CaseApplication)
        .options(
            selectinload(CaseApplication.case),
            selectinload(CaseApplication.student).selectinload(User.student_profile)
        )
        .where(CaseApplication.case_id == case_id)
        .order_by(CaseApplication.created_at.desc())
    )
    result = await db.execute(query)
    apps = result.scalars().all()

    response = []
    for a in apps:
        prof = a.student.student_profile if a.student else None
        response.append(CaseApplicationResponse(
            id=a.id,
            case_id=a.case_id,
            case_title=a.case.title if a.case else None,
            student_id=a.student_id,
            student_name=f"{a.student.first_name} {a.student.last_name}" if a.student else "Студент",
            student_faculty=prof.faculty if prof else None,
            student_course=prof.course if prof else None,
            cover_letter=a.cover_letter,
            resume_url=a.resume_url,
            portfolio_url=a.portfolio_url,
            github_url=a.github_url,
            prior_experience=a.prior_experience,
            status=a.status,
            company_feedback=a.company_feedback,
            created_at=a.created_at
        ))
    return response

@router.get("/my", response_model=List[CaseApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CaseApplication)
        .options(selectinload(CaseApplication.case))
        .where(CaseApplication.student_id == current_user.id)
        .order_by(CaseApplication.created_at.desc())
    )
    result = await db.execute(query)
    apps = result.scalars().all()

    prof = current_user.student_profile
    return [
        CaseApplicationResponse(
            id=a.id,
            case_id=a.case_id,
            case_title=a.case.title if a.case else "Кейс",
            student_id=current_user.id,
            student_name=f"{current_user.first_name} {current_user.last_name}",
            student_faculty=prof.faculty if prof else None,
            student_course=prof.course if prof else None,
            cover_letter=a.cover_letter,
            resume_url=a.resume_url,
            portfolio_url=a.portfolio_url,
            github_url=a.github_url,
            prior_experience=a.prior_experience,
            status=a.status,
            company_feedback=a.company_feedback,
            created_at=a.created_at
        )
        for a in apps
    ]

@router.patch("/{app_id}/status", response_model=CaseApplicationResponse)
async def update_application_status(
    app_id: int,
    status_update: CaseApplicationStatusUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["COMPANY", "ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CaseApplication)
        .options(
            selectinload(CaseApplication.case),
            selectinload(CaseApplication.student).selectinload(User.student_profile)
        )
        .where(CaseApplication.id == app_id)
    )
    result = await db.execute(query)
    app_obj = result.scalars().first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    old_status = app_obj.status
    app_obj.status = status_update.status
    if status_update.company_feedback:
        app_obj.company_feedback = status_update.company_feedback

    # Send in-app notification to student
    notif = Notification(
        user_id=app_obj.student_id,
        type="APPLICATION_STATUS",
        title=f"Статус вашей заявки изменен: {app_obj.status}",
        message=f"Компания обновила статус вашей заявки на проект '{app_obj.case.title}' на '{app_obj.status}'. {app_obj.company_feedback or ''}",
        link=f"/cases/{app_obj.case_id}"
    )
    db.add(notif)

    # Log audit
    await log_audit_event(
        db=db,
        action_type="APPLICATION_STATUS_UPDATED",
        entity_type="application",
        entity_id=str(app_obj.id),
        user_id=current_user.id,
        user_email=current_user.email,
        old_values={"status": old_status},
        new_values={"status": app_obj.status, "feedback": app_obj.company_feedback},
        ip_address=request.client.host if request.client else "unknown"
    )

    await db.commit()
    await db.refresh(app_obj)

    prof = app_obj.student.student_profile if app_obj.student else None
    return CaseApplicationResponse(
        id=app_obj.id,
        case_id=app_obj.case_id,
        case_title=app_obj.case.title if app_obj.case else None,
        student_id=app_obj.student_id,
        student_name=f"{app_obj.student.first_name} {app_obj.student.last_name}" if app_obj.student else None,
        student_faculty=prof.faculty if prof else None,
        student_course=prof.course if prof else None,
        cover_letter=app_obj.cover_letter,
        resume_url=app_obj.resume_url,
        portfolio_url=app_obj.portfolio_url,
        github_url=app_obj.github_url,
        prior_experience=app_obj.prior_experience,
        status=app_obj.status,
        company_feedback=app_obj.company_feedback,
        created_at=app_obj.created_at
    )

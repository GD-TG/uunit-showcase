from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, and_, desc
from typing import List, Optional
from datetime import date, datetime

from app.db.session import get_db
from app.models.case import CaseProject, CaseNDAAgreement, FavoriteCase
from app.models.project import ProjectMilestone
from app.models.user import Company
from app.models.user import User
from app.schemas.case import CaseProjectCreate, CaseProjectUpdate, CaseProjectResponse, MilestoneResponse
from app.api.deps import get_current_user, require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/cases", tags=["Витрина кейсов"])

@router.get("", response_model=List[CaseProjectResponse])
async def get_cases(
    db: AsyncSession = Depends(get_db),
    direction: Optional[str] = None,
    difficulty: Optional[str] = None,
    participation_format: Optional[str] = None,
    work_format: Optional[str] = None,
    category: Optional[str] = None,
    company_id: Optional[int] = None,
    has_payment: Optional[bool] = None,
    has_internship: Optional[bool] = None,
    course: Optional[int] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    only_moderated: bool = True
):
    query = select(CaseProject).options(
        selectinload(CaseProject.company),
        selectinload(CaseProject.milestones),
        selectinload(CaseProject.applications)
    )

    if only_moderated:
        query = query.where(CaseProject.moderation_status == "APPROVED")

    if status:
        query = query.where(CaseProject.status == status)
    if direction and direction != "ALL":
        query = query.where(CaseProject.direction == direction)
    if difficulty and difficulty != "ALL":
        query = query.where(CaseProject.difficulty == difficulty)
    if participation_format and participation_format != "ALL":
        query = query.where(CaseProject.participation_format == participation_format)
    if work_format and work_format != "ALL":
        query = query.where(CaseProject.work_format == work_format)
    if category and category != "ALL":
        query = query.where(CaseProject.category == category)
    if company_id:
        query = query.where(CaseProject.company_id == company_id)
    if has_payment is not None:
        query = query.where(CaseProject.has_payment == has_payment)
    if has_internship is not None:
        query = query.where(CaseProject.has_internship == has_internship)
    if search:
        search_filter = or_(
            CaseProject.title.ilike(f"%{search}%"),
            CaseProject.short_description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)

    query = query.order_by(desc(CaseProject.created_at))
    result = await db.execute(query)
    cases = result.scalars().all()

    response = []
    for c in cases:
        if course:
            courses_list = c.target_courses or []
            if courses_list and course not in courses_list:
                continue

        response.append(CaseProjectResponse(
            id=c.id,
            title=c.title,
            company_id=c.company_id,
            company_name=c.company.short_name if c.company else "Компания",
            company_logo=c.company.logo_url if c.company else None,
            short_description=c.short_description,
            full_specification=c.full_specification if not c.is_confidential else "Для доступа к полному ТЗ требуется подписание соглашения о конфиденциальности (NDA).",
            direction=c.direction,
            difficulty=c.difficulty,
            participation_format=c.participation_format,
            work_format=c.work_format,
            max_participants=c.max_participants,
            required_competencies=c.required_competencies or [],
            recommended_technologies=c.recommended_technologies or [],
            target_courses=c.target_courses or [],
            deadline_date=c.deadline_date,
            application_deadline=c.application_deadline,
            expected_result=c.expected_result,
            evaluation_criteria_desc=c.evaluation_criteria_desc,
            selection_type=c.selection_type,
            category=c.category,
            reward_description=c.reward_description,
            has_payment=c.has_payment,
            payment_amount=float(c.payment_amount) if c.payment_amount else None,
            prize_fund=float(c.prize_fund) if c.prize_fund else None,
            payment_status=c.payment_status,
            has_internship=c.has_internship,
            ip_rights_terms=c.ip_rights_terms,
            is_confidential=c.is_confidential,
            status=c.status,
            moderation_status=c.moderation_status,
            moderation_comment=c.moderation_comment,
            created_at=c.created_at,
            updated_at=c.updated_at,
            applications_count=len(c.applications) if c.applications else 0,
            milestones=[MilestoneResponse(
                id=m.id,
                order_index=m.order_index,
                title=m.title,
                description=m.description,
                due_date=m.due_date,
                status=m.status,
                reviewer_comment=m.reviewer_comment
            ) for m in (c.milestones or [])]
        ))
    return response

@router.get("/{case_id}", response_model=CaseProjectResponse)
async def get_case_detail(
    case_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(CaseProject).options(
        selectinload(CaseProject.company),
        selectinload(CaseProject.milestones),
        selectinload(CaseProject.applications)
    ).where(CaseProject.id == case_id)
    result = await db.execute(query)
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    return CaseProjectResponse(
        id=c.id,
        title=c.title,
        company_id=c.company_id,
        company_name=c.company.short_name if c.company else "Компания",
        company_logo=c.company.logo_url if c.company else None,
        short_description=c.short_description,
        full_specification=c.full_specification,
        direction=c.direction,
        difficulty=c.difficulty,
        participation_format=c.participation_format,
        work_format=c.work_format,
        max_participants=c.max_participants,
        required_competencies=c.required_competencies or [],
        recommended_technologies=c.recommended_technologies or [],
        target_courses=c.target_courses or [],
        deadline_date=c.deadline_date,
        application_deadline=c.application_deadline,
        expected_result=c.expected_result,
        evaluation_criteria_desc=c.evaluation_criteria_desc,
        selection_type=c.selection_type,
        category=c.category,
        reward_description=c.reward_description,
        has_payment=c.has_payment,
        payment_amount=float(c.payment_amount) if c.payment_amount else None,
        prize_fund=float(c.prize_fund) if c.prize_fund else None,
        payment_status=c.payment_status,
        has_internship=c.has_internship,
        ip_rights_terms=c.ip_rights_terms,
        is_confidential=c.is_confidential,
        status=c.status,
        moderation_status=c.moderation_status,
        moderation_comment=c.moderation_comment,
        created_at=c.created_at,
        updated_at=c.updated_at,
        applications_count=len(c.applications) if c.applications else 0,
        milestones=[MilestoneResponse(
            id=m.id,
            order_index=m.order_index,
            title=m.title,
            description=m.description,
            due_date=m.due_date,
            status=m.status,
            reviewer_comment=m.reviewer_comment
        ) for m in (c.milestones or [])]
    )

@router.post("", response_model=CaseProjectResponse)
async def create_case(
    case_in: CaseProjectCreate,
    request: Request,
    current_user: User = Depends(require_roles(["COMPANY", "ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    company_id = None
    if current_user.role == "COMPANY":
        if not current_user.company_representative:
            raise HTTPException(status_code=400, detail="У представителя нет привязанной компании")
        company = current_user.company_representative.company
        if not company.is_moderated:
            raise HTTPException(status_code=403, detail="Компания ожидает проверки модератором УУНиТ")
        company_id = company.id
    else:
        # Default or first company for staff/admin
        comp_res = await db.execute(select(Company))
        first_comp = comp_res.scalars().first()
        company_id = first_comp.id if first_comp else 1

    case = CaseProject(
        title=case_in.title,
        company_id=company_id,
        short_description=case_in.short_description,
        full_specification=case_in.full_specification,
        direction=case_in.direction,
        difficulty=case_in.difficulty,
        participation_format=case_in.participation_format,
        work_format=case_in.work_format,
        max_participants=case_in.max_participants,
        required_competencies=case_in.required_competencies,
        recommended_technologies=case_in.recommended_technologies,
        target_courses=case_in.target_courses,
        deadline_date=case_in.deadline_date,
        application_deadline=case_in.application_deadline,
        expected_result=case_in.expected_result,
        evaluation_criteria_desc=case_in.evaluation_criteria_desc,
        selection_type=case_in.selection_type,
        category=case_in.category,
        reward_description=case_in.reward_description,
        has_payment=case_in.has_payment,
        payment_amount=case_in.payment_amount,
        prize_fund=case_in.prize_fund,
        payment_status=case_in.payment_status,
        has_internship=case_in.has_internship,
        ip_rights_terms=case_in.ip_rights_terms,
        is_confidential=case_in.is_confidential,
        status="ACTIVE",
        moderation_status="APPROVED" if current_user.role in ["ADMIN", "STAFF"] else "PENDING_REVIEW"
    )
    db.add(case)
    await db.flush()

    # Create default standard milestones (п. 5.10 ТЗ)
    milestone_titles = [
        "Анализ задачи и требований",
        "Проектирование архитектуры",
        "Создание прототипа",
        "Разработка MVP",
        "Тестирование и отладка",
        "Финальная версия",
        "Защита проекта"
    ]
    for idx, title in enumerate(milestone_titles, 1):
        m = ProjectMilestone(
            case_id=case.id,
            order_index=idx,
            title=title,
            description=f"Этап {idx}: {title}",
            status="PENDING"
        )
        db.add(m)

    await db.commit()
    await db.refresh(case)

    # Log audit
    await log_audit_event(
        db=db,
        action_type="CASE_CREATED",
        entity_type="case",
        entity_id=str(case.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"title": case.title, "category": case.category},
        ip_address=request.client.host if request.client else "unknown"
    )

    return await get_case_detail(case.id, db)

@router.post("/{case_id}/nda-sign")
async def sign_nda(
    case_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    case = await db.get(CaseProject, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    existing = await db.execute(
        select(CaseNDAAgreement).where(
            CaseNDAAgreement.case_id == case_id,
            CaseNDAAgreement.user_id == current_user.id
        )
    )
    if not existing.scalars().first():
        nda = CaseNDAAgreement(
            case_id=case_id,
            user_id=current_user.id,
            ip_address=request.client.host if request.client else "unknown"
        )
        db.add(nda)
        await db.commit()

    return {"status": "success", "message": "Соглашение о конфиденциальности подписано"}

@router.post("/{case_id}/moderate")
async def moderate_case(
    case_id: int,
    status: str,  # APPROVED, REJECTED, NEEDS_REVISION, HIDDEN
    comment: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    case = await db.get(CaseProject, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    old_status = case.moderation_status
    case.moderation_status = status
    case.moderation_comment = comment
    if status == "APPROVED":
        case.status = "ACTIVE"
    elif status in ["REJECTED", "HIDDEN"]:
        case.status = "ARCHIVED"

    await db.commit()

    await log_audit_event(
        db=db,
        action_type="CASE_MODERATED",
        entity_type="case",
        entity_id=str(case.id),
        user_id=current_user.id,
        user_email=current_user.email,
        old_values={"moderation_status": old_status},
        new_values={"moderation_status": status, "comment": comment}
    )

    return {"status": "success", "message": f"Статус модерации кейса изменен на {status}"}

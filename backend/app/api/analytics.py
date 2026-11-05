from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import Optional, List, Dict, Any

from app.db.session import get_db
from app.models.user import Company
from app.models.case import CaseProject
from app.models.user import User, StudentProfile
from app.models.application import CaseApplication
from app.models.project import AwardWinner, ProjectSubmission
from app.services.export_service import export_to_csv, export_to_excel, export_to_pdf

router = APIRouter(prefix="/analytics", tags=["Аналитика и отчёты"])

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    faculty: Optional[str] = None
):
    # 1. Компании
    companies_res = await db.execute(select(Company))
    companies = companies_res.scalars().all()
    total_companies = len(companies)
    active_companies = len([c for c in companies if c.is_moderated])

    # 2. Проекты
    cases_res = await db.execute(select(CaseProject))
    cases = cases_res.scalars().all()
    total_cases = len(cases)
    cases_active = len([c for c in cases if c.status == "ACTIVE"])
    cases_in_progress = len([c for c in cases if c.status == "IN_PROGRESS"])
    cases_completed = len([c for c in cases if c.status == "COMPLETED"])

    # 3. Студенты
    students_res = await db.execute(
        select(StudentProfile)
    )
    students = students_res.scalars().all()
    total_students = len(students)
    active_students = len([s for s in students if s.completed_projects_count > 0])

    # 4. Призовой фонд
    total_prize_fund = sum([float(c.prize_fund or 0) for c in cases if c.prize_fund])
    total_paid_fund = sum([float(c.payment_amount or 0) for c in cases if c.payment_amount])

    # 5. Распределение по направлениям
    direction_counts: Dict[str, int] = {}
    for c in cases:
        direction_counts[c.direction] = direction_counts.get(c.direction, 0) + 1

    direction_stats = [{"name": k, "count": v} for k, v in direction_counts.items()]

    # 6. Распределение по категориям
    category_counts = {
        "EDUCATIONAL": len([c for c in cases if c.category == "EDUCATIONAL"]),
        "CONTEST": len([c for c in cases if c.category == "CONTEST"]),
        "PAID": len([c for c in cases if c.category == "PAID"]),
        "OTHER_REWARD": len([c for c in cases if c.category == "OTHER_REWARD"])
    }

    # 7. Топ компании
    top_companies = [
        {
            "name": c.short_name,
            "cases_count": len([cs for cs in cases if cs.company_id == c.id]),
            "completed_count": c.completed_projects_count
        }
        for c in sorted(companies, key=lambda x: x.completed_projects_count, reverse=True)[:5]
    ]

    return {
        "overview": {
            "total_companies": total_companies,
            "active_companies": active_companies,
            "total_cases": total_cases,
            "cases_active": cases_active,
            "cases_in_progress": cases_in_progress,
            "cases_completed": cases_completed,
            "total_students": total_students,
            "active_students": active_students,
            "total_prize_fund": total_prize_fund + total_paid_fund
        },
        "directions": direction_stats,
        "categories": category_counts,
        "top_companies": top_companies
    }

@router.get("/export")
async def export_analytics(
    format: str = Query("excel", regex="^(excel|csv|pdf)$"),
    report_type: str = Query("cases", regex="^(cases|students|companies)$"),
    db: AsyncSession = Depends(get_db)
):
    if report_type == "cases":
        title = "Отчёт по ИТ-кейсам и проектам УУНиТ"
        headers = ["ID", "Название проекта", "Компания", "Направление", "Сложность", "Категория", "Призовой фонд", "Статус", "Дата создания"]
        cases_res = await db.execute(select(CaseProject).options(selectinload(CaseProject.company)))
        cases = cases_res.scalars().all()
        rows = [
            [
                c.id,
                c.title,
                c.company.short_name if c.company else "",
                c.direction,
                c.difficulty,
                c.category,
                f"{float(c.prize_fund or c.payment_amount or 0):,.0f} ₽",
                c.status,
                c.created_at.strftime("%d.%m.%Y")
            ]
            for c in cases
        ]
    elif report_type == "students":
        title = "Отчёт по проектной активности студентов УУНиТ"
        headers = ["ID", "ФИО Студента", "Институт/Факультет", "Направление", "Курс", "Группа", "Завершено проектов", "Рейтинг"]
        st_res = await db.execute(select(User).options(selectinload(User.student_profile)).where(User.role == "STUDENT"))
        users = st_res.scalars().all()
        rows = []
        for u in users:
            p = u.student_profile
            rows.append([
                u.id,
                f"{u.last_name} {u.first_name}",
                p.faculty if p else "",
                p.field_of_study if p else "",
                p.course if p else "",
                p.academic_group if p else "",
                p.completed_projects_count if p else 0,
                float(p.rating or 0) if p else 0.0
            ])
    else:
        title = "Отчёт по компаниям-партнёрам УУНиТ"
        headers = ["ID", "Компания", "Отрасль", "Сайт", "Email", "Завершено проектов", "Статус модерации"]
        comp_res = await db.execute(select(Company))
        companies = comp_res.scalars().all()
        rows = [
            [
                c.id,
                c.full_name,
                c.industry or "",
                c.website or "",
                c.contact_email or "",
                c.completed_projects_count,
                "Проверена" if c.is_moderated else "На проверке"
            ]
            for c in companies
        ]

    if format == "csv":
        file_data = export_to_csv(headers, rows)
        return Response(
            content=file_data.getvalue(),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.csv"}
        )
    elif format == "pdf":
        file_data = export_to_pdf(title, headers, rows)
        return Response(
            content=file_data.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.pdf"}
        )
    else:
        file_data = export_to_excel(title, headers, rows)
        return Response(
            content=file_data.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.xlsx"}
        )

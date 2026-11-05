from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.db.session import get_db
from app.models.user import Company
from app.schemas.user import CompanySchema
from app.models.user import User
from app.api.deps import require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/companies", tags=["Компании-партнёры"])

@router.get("", response_model=List[CompanySchema])
async def get_companies(
    db: AsyncSession = Depends(get_db),
    only_moderated: bool = True
):
    query = select(Company)
    if only_moderated:
        query = query.where(Company.is_moderated == True)
    result = await db.execute(query)
    companies = result.scalars().all()
    return companies

@router.get("/{company_id}", response_model=CompanySchema)
async def get_company_detail(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    return company

@router.post("/{company_id}/moderate")
async def moderate_company(
    company_id: int,
    approve: bool,
    request: Request,
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")

    old_status = company.is_moderated
    company.is_moderated = approve
    await db.commit()

    await log_audit_event(
        db=db,
        action_type="COMPANY_MODERATED",
        entity_type="company",
        entity_id=str(company.id),
        user_id=current_user.id,
        user_email=current_user.email,
        old_values={"is_moderated": old_status},
        new_values={"is_moderated": approve},
        ip_address=request.client.host if request.client else "unknown"
    )

    return {"status": "success", "is_moderated": company.is_moderated}

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List, Optional

from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.api.deps import require_roles

router = APIRouter(prefix="/audit", tags=["Аудит и безопасность"])

@router.get("")
async def get_audit_logs(
    limit: int = 50,
    action_type: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)
    if action_type:
        query = query.where(AuditLog.action_type == action_type)
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs

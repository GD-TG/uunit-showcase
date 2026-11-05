from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List

from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Уведомления"])

@router.get("")
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(20)
    )
    result = await db.execute(query)
    notifs = result.scalars().all()
    return notifs

@router.post("/read-all")
async def mark_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    result = await db.execute(query)
    for n in result.scalars().all():
        n.is_read = True
    await db.commit()
    return {"status": "success"}

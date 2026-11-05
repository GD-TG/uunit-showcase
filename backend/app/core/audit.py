from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.models.audit import AuditLog

async def log_audit_event(
    db: AsyncSession,
    action_type: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address
        )
        db.add(audit_entry)
        await db.commit()
    except Exception as e:
        # Don't fail the primary transaction if audit logging fails
        print(f"[AUDIT LOG ERROR]: {e}")

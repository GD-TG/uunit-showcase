from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from datetime import datetime
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    # LOGIN, CASE_CREATED, CASE_UPDATED, CASE_DELETED, STATUS_CHANGED, APPLICATION_APPROVED, 
    # APPLICATION_REJECTED, SCORE_SUBMITTED, WINNER_DECLARED, REWARD_UPDATED, USER_BLOCKED
    action_type = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)  # case, application, submission, company, user
    entity_id = Column(String(100), nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

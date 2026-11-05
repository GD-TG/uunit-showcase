from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # NEW_CASE_MATCH, APPLICATION_STATUS, TEAM_INVITE, COMPANY_INVITE, NEW_COMMENT, 
    # DEADLINE_APPROACHING, REVISION_REQUIRED, RESULT_ACCEPTED, PRIZE_AWARDED, FEEDBACK_RECEIVED
    type = Column(String(50), default="SYSTEM")
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

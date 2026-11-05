from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CaseApplication(Base):
    __tablename__ = "case_applications"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    prior_experience = Column(Text, nullable=True)
    
    # PENDING, APPROVED, REJECTED, INTERVIEW_INVITED, MORE_INFO_REQUESTED
    status = Column(String(50), default="PENDING")
    company_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("CaseProject", back_populates="applications")
    student = relationship("User", back_populates="applications", foreign_keys=[student_id])

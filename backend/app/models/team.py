from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class ProjectTeam(Base):
    __tablename__ = "project_teams"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    team_lead_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Куратор / наставник
    
    # FORMING, ACTIVE, SUBMITTED, COMPLETED, ARCHIVED
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("CaseProject", back_populates="teams")
    team_lead = relationship("User", foreign_keys=[team_lead_id])
    mentor = relationship("User", foreign_keys=[mentor_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    submissions = relationship("ProjectSubmission", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("project_teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # TEAM_LEAD, BACKEND, FRONTEND, MOBILE, DATA_SCIENTIST, ML_ENGINEER, DEVOPS, QA, DESIGNER, ANALYST, PM, OTHER
    role = Column(String(50), default="BACKEND")
    competencies = Column(JSON, default=list)
    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("ProjectTeam", back_populates="members")
    user = relationship("User")

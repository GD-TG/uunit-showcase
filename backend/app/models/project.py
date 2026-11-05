from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    # PENDING, IN_PROGRESS, SUBMITTED, NEEDS_REVISION, ACCEPTED
    status = Column(String(50), default="PENDING")
    reviewer_comment = Column(Text, nullable=True)

    case = relationship("CaseProject", back_populates="milestones")
    submissions = relationship("ProjectSubmission", back_populates="milestone")

class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("project_teams.id", ondelete="CASCADE"), nullable=False)
    milestone_id = Column(Integer, ForeignKey("project_milestones.id", ondelete="SET NULL"), nullable=True)
    is_final = Column(Boolean, default=False)
    solution_description = Column(Text, nullable=False)
    repository_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    presentation_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    screenshots = Column(JSON, default=list)
    documentation_url = Column(String(500), nullable=True)
    extra_materials = Column(JSON, default=dict)
    # SUBMITTED, IN_REVIEW, NEEDS_REVISION, ACCEPTED
    status = Column(String(50), default="SUBMITTED")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("ProjectTeam", back_populates="submissions")
    milestone = relationship("ProjectMilestone", back_populates="submissions")
    reviews = relationship("ProjectReview", back_populates="submission", cascade="all, delete-orphan")

class ProjectReview(Base):
    __tablename__ = "project_reviews"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("project_submissions.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 10 критериев оценки (п. 5.12 ТЗ)
    score_completeness = Column(Integer, default=10)           # Полнота решения
    score_implementation_quality = Column(Integer, default=10) # Качество реализации
    score_code_quality = Column(Integer, default=10)           # Качество программного кода
    score_architecture = Column(Integer, default=10)           # Архитектура
    score_spec_compliance = Column(Integer, default=10)        # Соответствие ТЗ
    score_usability = Column(Integer, default=10)              # Удобство использования (UX/UI)
    score_originality = Column(Integer, default=10)            # Оригинальность
    score_documentation = Column(Integer, default=10)          # Качество документации
    score_deadline_adherence = Column(Integer, default=10)     # Соблюдение сроков
    score_teamwork = Column(Integer, default=10)               # Командная работа
    
    total_score = Column(Integer, default=100)
    company_feedback = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ProjectSubmission", back_populates="reviews")
    reviewer = relationship("User")

class AwardWinner(Base):
    __tablename__ = "award_winners"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(Integer, ForeignKey("project_teams.id", ondelete="CASCADE"), nullable=False)
    # 1ST_PLACE, 2ND_PLACE, 3RD_PLACE, NOMINATION_WINNER
    place = Column(String(50), default="1ST_PLACE")
    nomination_name = Column(String(200), nullable=True)
    reward_detail = Column(String(255), nullable=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("CaseProject", back_populates="award_winners")
    team = relationship("ProjectTeam")

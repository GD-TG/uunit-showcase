from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CaseProject(Base):
    __tablename__ = "case_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    short_description = Column(Text, nullable=False)
    full_specification = Column(Text, nullable=False)
    direction = Column(String(100), nullable=False)  # Backend, Frontend, AI, Mobile, etc.
    difficulty = Column(String(50), nullable=False)  # Базовый, Средний, Продвинутый
    participation_format = Column(String(50), nullable=False)  # Индивидуальный, Командный, Смешанный
    work_format = Column(String(50), nullable=False)  # Дистанционный, Очный, Смешанный
    max_participants = Column(Integer, default=5)
    required_competencies = Column(JSON, default=list)
    recommended_technologies = Column(JSON, default=list)
    target_courses = Column(JSON, default=list)  # [1, 2, 3, 4, 5, 6]
    deadline_date = Column(Date, nullable=True)
    application_deadline = Column(Date, nullable=True)
    expected_result = Column(Text, nullable=True)
    evaluation_criteria_desc = Column(Text, nullable=True)
    selection_type = Column(String(50), default="COMPETITIVE")  # OPEN, COMPETITIVE, TEST_TASK, INVITE_ONLY
    
    # Классификация (п. 5.4 ТЗ)
    category = Column(String(50), nullable=False)  # EDUCATIONAL, CONTEST, PAID, OTHER_REWARD
    reward_description = Column(Text, nullable=True)
    has_payment = Column(Boolean, default=False)
    payment_amount = Column(Numeric(12, 2), nullable=True)
    prize_fund = Column(Numeric(12, 2), nullable=True)
    payment_status = Column(String(50), default="NOT_PROVIDED")  # NOT_PROVIDED, PENDING, CONFIRMED, PAID
    has_internship = Column(Boolean, default=False)

    # РИД и конфиденциальность (п. 5.24, 5.25 ТЗ)
    ip_rights_terms = Column(String(50), default="AUTHOR_RETAINED")
    is_confidential = Column(Boolean, default=False)  # Requires NDA signature

    # Модерация и статус (п. 5.9, 5.23 ТЗ)
    # Жизненный цикл кейса: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ACTIVE, IN_PROGRESS, REVIEWING, COMPLETED, ARCHIVED
    status = Column(String(50), default="ACTIVE")
    moderation_status = Column(String(50), default="APPROVED")  # PENDING_REVIEW, APPROVED, REJECTED, NEEDS_REVISION
    moderation_comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="cases")
    applications = relationship("CaseApplication", back_populates="case", cascade="all, delete-orphan")
    teams = relationship("ProjectTeam", back_populates="case", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="case", cascade="all, delete-orphan")
    award_winners = relationship("AwardWinner", back_populates="case", cascade="all, delete-orphan")

class CaseNDAAgreement(Base):
    __tablename__ = "case_nda_agreements"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    signed_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50), nullable=True)

class FavoriteCase(Base):
    __tablename__ = "favorite_cases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(Integer, ForeignKey("case_projects.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

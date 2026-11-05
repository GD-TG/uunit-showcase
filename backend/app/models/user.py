from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # ADMIN, STAFF, COMPANY, STUDENT, MENTOR
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    patronymic = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    company_representative = relationship("CompanyRepresentative", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("CaseApplication", back_populates="student", foreign_keys="CaseApplication.student_id")
    showcase_projects = relationship("StudentShowcaseProject", back_populates="author", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String(255), default="УУНиТ")
    faculty = Column(String(255), nullable=False)  # Институт / Факультет
    field_of_study = Column(String(255), nullable=False)  # Направление подготовки
    study_program = Column(String(255), nullable=False)  # Образовательная программа
    course = Column(Integer, nullable=False)  # 1-6
    academic_group = Column(String(50), nullable=False)  # Учебная группа
    bio = Column(Text, nullable=True)
    professional_interests = Column(JSON, default=list)
    competencies = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    github_url = Column(String(500), nullable=True)
    gitlab_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    completed_projects_count = Column(Integer, default=0)
    rating = Column(Numeric(6, 2), default=0.0)

    user = relationship("User", back_populates="student_profile")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=False)
    logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    industry = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    directions = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    is_moderated = Column(Boolean, default=False)
    completed_projects_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    representatives = relationship("CompanyRepresentative", back_populates="company", cascade="all, delete-orphan")
    cases = relationship("CaseProject", back_populates="company", cascade="all, delete-orphan")

class CompanyRepresentative(Base):
    __tablename__ = "company_representatives"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    position = Column(String(150), nullable=True)

    user = relationship("User", back_populates="company_representative")
    company = relationship("Company", back_populates="representatives")

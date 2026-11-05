from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class StudentShowcaseProject(Base):
    __tablename__ = "student_showcase_projects"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    cover_image_url = Column(String(500), nullable=True)
    # COURSEWORK, DIPLOMA_VKR, HACKATHON, PET_PROJECT, STARTUP, RESEARCH_NIR, OPEN_SOURCE, ACADEMIC
    project_type = Column(String(50), default="PET_PROJECT")
    short_description = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=True)
    problem_solved = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    direction = Column(String(100), default="Fullstack")
    github_url = Column(String(500), nullable=True)
    gitlab_url = Column(String(500), nullable=True)
    live_demo_url = Column(String(500), nullable=True)
    presentation_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    screenshots = Column(JSON, default=list)

    # 6 отметок (п. 5.15 ТЗ)
    seeking_partner = Column(Boolean, default=False)      # Ищу компанию / партнёра
    seeking_team = Column(Boolean, default=False)         # Ищу команду
    seeking_mentor = Column(Boolean, default=False)       # Ищу наставника
    seeking_investor = Column(Boolean, default=False)     # Ищу инвестора
    open_for_internship = Column(Boolean, default=False)  # Открыт к предложениям о стажировке
    open_for_job = Column(Boolean, default=False)         # Открыт к предложениям о работе

    # PENDING, APPROVED, REJECTED
    moderation_status = Column(String(50), default="APPROVED")
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", back_populates="showcase_projects")

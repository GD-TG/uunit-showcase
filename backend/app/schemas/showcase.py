from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class StudentShowcaseCreate(BaseModel):
    title: str
    cover_image_url: Optional[str] = None
    project_type: str = "PET_PROJECT"
    short_description: str
    detailed_description: Optional[str] = None
    problem_solved: Optional[str] = None
    technologies: List[str] = []
    direction: str = "Fullstack"
    github_url: Optional[str] = None
    gitlab_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    presentation_url: Optional[str] = None
    video_url: Optional[str] = None
    screenshots: List[str] = []

    # 6 отметок
    seeking_partner: bool = False
    seeking_team: bool = False
    seeking_mentor: bool = False
    seeking_investor: bool = False
    open_for_internship: bool = False
    open_for_job: bool = False

class StudentShowcaseResponse(StudentShowcaseCreate):
    id: int
    author_id: int
    author_name: Optional[str] = None
    author_faculty: Optional[str] = None
    author_course: Optional[int] = None
    moderation_status: str
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True

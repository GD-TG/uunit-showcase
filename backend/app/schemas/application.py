from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class CaseApplicationCreate(BaseModel):
    case_id: int
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    prior_experience: Optional[str] = None

class CaseApplicationStatusUpdate(BaseModel):
    status: str  # PENDING, APPROVED, REJECTED, INTERVIEW_INVITED, MORE_INFO_REQUESTED
    company_feedback: Optional[str] = None

class CaseApplicationResponse(BaseModel):
    id: int
    case_id: int
    case_title: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    student_faculty: Optional[str] = None
    student_course: Optional[int] = None
    cover_letter: Optional[str]
    resume_url: Optional[str]
    portfolio_url: Optional[str]
    github_url: Optional[str]
    prior_experience: Optional[str]
    status: str
    company_feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

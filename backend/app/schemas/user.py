from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    patronymic: Optional[str] = None
    role: str  # ADMIN, STAFF, COMPANY, STUDENT, MENTOR
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    # Optional Student Profile fields for registration
    university: Optional[str] = "УУНиТ"
    faculty: Optional[str] = None
    field_of_study: Optional[str] = None
    study_program: Optional[str] = None
    course: Optional[int] = None
    academic_group: Optional[str] = None
    bio: Optional[str] = None
    professional_interests: Optional[List[str]] = []
    competencies: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    github_url: Optional[str] = None
    gitlab_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Optional Company fields for registration
    company_full_name: Optional[str] = None
    company_short_name: Optional[str] = None
    company_industry: Optional[str] = None
    company_website: Optional[str] = None
    company_position: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

class StudentProfileSchema(BaseModel):
    id: int
    university: str
    faculty: str
    field_of_study: str
    study_program: str
    course: int
    academic_group: str
    bio: Optional[str]
    professional_interests: List[str]
    competencies: List[str]
    technologies: List[str]
    github_url: Optional[str]
    gitlab_url: Optional[str]
    portfolio_url: Optional[str]
    completed_projects_count: int
    rating: float

    class Config:
        from_attributes = True

class CompanySchema(BaseModel):
    id: int
    full_name: str
    short_name: str
    logo_url: Optional[str]
    description: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    directions: List[str]
    technologies: List[str]
    is_moderated: bool
    completed_projects_count: int

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    first_name: str
    last_name: str
    patronymic: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime
    student_profile: Optional[StudentProfileSchema] = None
    company: Optional[CompanySchema] = None

    class Config:
        from_attributes = True

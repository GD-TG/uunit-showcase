from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class CaseProjectBase(BaseModel):
    title: str
    short_description: str
    full_specification: str
    direction: str
    difficulty: str
    participation_format: str
    work_format: str
    max_participants: int = 5
    required_competencies: List[str] = []
    recommended_technologies: List[str] = []
    target_courses: List[int] = []
    deadline_date: Optional[date] = None
    application_deadline: Optional[date] = None
    expected_result: Optional[str] = None
    evaluation_criteria_desc: Optional[str] = None
    selection_type: str = "COMPETITIVE"
    
    # 4 типа кейсов (п. 5.4 ТЗ)
    category: str = "EDUCATIONAL"  # EDUCATIONAL, CONTEST, PAID, OTHER_REWARD
    reward_description: Optional[str] = None
    has_payment: bool = False
    payment_amount: Optional[float] = None
    prize_fund: Optional[float] = None
    payment_status: str = "NOT_PROVIDED"
    has_internship: bool = False

    # РИД и конфиденциальность (п. 5.24, 5.25 ТЗ)
    ip_rights_terms: str = "AUTHOR_RETAINED"
    is_confidential: bool = False

class CaseProjectCreate(CaseProjectBase):
    pass

class CaseProjectUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_specification: Optional[str] = None
    direction: Optional[str] = None
    difficulty: Optional[str] = None
    participation_format: Optional[str] = None
    work_format: Optional[str] = None
    max_participants: Optional[int] = None
    required_competencies: Optional[List[str]] = None
    recommended_technologies: Optional[List[str]] = None
    target_courses: Optional[List[int]] = None
    deadline_date: Optional[date] = None
    application_deadline: Optional[date] = None
    expected_result: Optional[str] = None
    evaluation_criteria_desc: Optional[str] = None
    selection_type: Optional[str] = None
    category: Optional[str] = None
    reward_description: Optional[str] = None
    has_payment: Optional[bool] = None
    payment_amount: Optional[float] = None
    prize_fund: Optional[float] = None
    payment_status: Optional[str] = None
    has_internship: Optional[bool] = None
    ip_rights_terms: Optional[str] = None
    is_confidential: Optional[bool] = None
    status: Optional[str] = None
    moderation_status: Optional[str] = None
    moderation_comment: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: int
    order_index: int
    title: str
    description: Optional[str]
    due_date: Optional[date]
    status: str
    reviewer_comment: Optional[str]

    class Config:
        from_attributes = True

class CaseProjectResponse(CaseProjectBase):
    id: int
    company_id: int
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    status: str
    moderation_status: str
    moderation_comment: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_favorite: Optional[bool] = False
    is_nda_signed: Optional[bool] = False
    milestones: List[MilestoneResponse] = []
    applications_count: Optional[int] = 0

    class Config:
        from_attributes = True

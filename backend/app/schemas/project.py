from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class MilestoneCreate(BaseModel):
    case_id: int
    order_index: int
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    reviewer_comment: Optional[str] = None

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

class SubmissionCreate(BaseModel):
    team_id: int
    milestone_id: Optional[int] = None
    is_final: bool = False
    solution_description: str
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    presentation_url: Optional[str] = None
    video_url: Optional[str] = None
    screenshots: List[str] = []
    documentation_url: Optional[str] = None
    extra_materials: Dict[str, Any] = {}

class ReviewCreate(BaseModel):
    submission_id: int
    score_completeness: int = 10
    score_implementation_quality: int = 10
    score_code_quality: int = 10
    score_architecture: int = 10
    score_spec_compliance: int = 10
    score_usability: int = 10
    score_originality: int = 10
    score_documentation: int = 10
    score_deadline_adherence: int = 10
    score_teamwork: int = 10
    total_score: int = 100
    company_feedback: str

class AwardWinnerCreate(BaseModel):
    case_id: int
    team_id: int
    place: str = "1ST_PLACE"
    nomination_name: Optional[str] = None
    reward_detail: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_id: int
    reviewer_name: Optional[str] = None
    score_completeness: int
    score_implementation_quality: int
    score_code_quality: int
    score_architecture: int
    score_spec_compliance: int
    score_usability: int
    score_originality: int
    score_documentation: int
    score_deadline_adherence: int
    score_teamwork: int
    total_score: int
    company_feedback: str
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: int
    team_id: int
    team_name: Optional[str] = None
    milestone_id: Optional[int]
    is_final: bool
    solution_description: str
    repository_url: Optional[str]
    demo_url: Optional[str]
    presentation_url: Optional[str]
    video_url: Optional[str]
    screenshots: List[str]
    documentation_url: Optional[str]
    status: str
    submitted_at: datetime
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True

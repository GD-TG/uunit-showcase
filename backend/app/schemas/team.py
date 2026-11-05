from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class TeamMemberCreate(BaseModel):
    user_id: int
    role: str = "BACKEND"
    competencies: List[str] = []

class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    role: str
    competencies: List[str] = []
    joined_at: datetime

    class Config:
        from_attributes = True

class ProjectTeamCreate(BaseModel):
    case_id: int
    name: str
    members: List[TeamMemberCreate] = []

class ProjectTeamResponse(BaseModel):
    id: int
    case_id: int
    case_title: Optional[str] = None
    name: str
    team_lead_id: int
    team_lead_name: Optional[str] = None
    mentor_id: Optional[int] = None
    mentor_name: Optional[str] = None
    status: str
    created_at: datetime
    members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True

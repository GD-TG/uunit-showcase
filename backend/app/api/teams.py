from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.models.team import ProjectTeam, TeamMember
from app.models.case import CaseProject
from app.models.user import User
from app.schemas.team import ProjectTeamCreate, ProjectTeamResponse, TeamMemberCreate, TeamMemberResponse
from app.api.deps import get_current_user, require_roles
from app.core.audit import log_audit_event

router = APIRouter(prefix="/teams", tags=["Проектные команды"])

@router.post("", response_model=ProjectTeamResponse)
async def create_team(
    team_in: ProjectTeamCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    case = await db.get(CaseProject, team_in.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    team = ProjectTeam(
        case_id=team_in.case_id,
        name=team_in.name,
        team_lead_id=current_user.id,
        status="ACTIVE"
    )
    db.add(team)
    await db.flush()

    # Add team lead as a member
    lead_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="TEAM_LEAD",
        competencies=["Архитектура", "Управление проектом"]
    )
    db.add(lead_member)

    # Add additional members
    for m in team_in.members:
        if m.user_id != current_user.id:
            member = TeamMember(
                team_id=team.id,
                user_id=m.user_id,
                role=m.role,
                competencies=m.competencies
            )
            db.add(member)

    # If case had no teams before, set case status to IN_PROGRESS
    case.status = "IN_PROGRESS"

    await db.commit()
    await db.refresh(team)

    await log_audit_event(
        db=db,
        action_type="TEAM_CREATED",
        entity_type="team",
        entity_id=str(team.id),
        user_id=current_user.id,
        user_email=current_user.email,
        new_values={"name": team.name, "case_id": case.id},
        ip_address=request.client.host if request.client else "unknown"
    )

    return await get_team_by_id(team.id, db)

@router.get("/case/{case_id}", response_model=List[ProjectTeamResponse])
async def get_case_teams(
    case_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ProjectTeam)
        .options(
            selectinload(ProjectTeam.case),
            selectinload(ProjectTeam.team_lead),
            selectinload(ProjectTeam.mentor),
            selectinload(ProjectTeam.members).selectinload(TeamMember.user)
        )
        .where(ProjectTeam.case_id == case_id)
    )
    result = await db.execute(query)
    teams = result.scalars().all()

    response = []
    for t in teams:
        members_resp = [
            TeamMemberResponse(
                id=m.id,
                user_id=m.user_id,
                user_name=f"{m.user.first_name} {m.user.last_name}" if m.user else "Участник",
                role=m.role,
                competencies=m.competencies or [],
                joined_at=m.joined_at
            )
            for m in (t.members or [])
        ]
        response.append(ProjectTeamResponse(
            id=t.id,
            case_id=t.case_id,
            case_title=t.case.title if t.case else None,
            name=t.name,
            team_lead_id=t.team_lead_id,
            team_lead_name=f"{t.team_lead.first_name} {t.team_lead.last_name}" if t.team_lead else "Тимлид",
            mentor_id=t.mentor_id,
            mentor_name=f"{t.mentor.first_name} {t.mentor.last_name}" if t.mentor else None,
            status=t.status,
            created_at=t.created_at,
            members=members_resp
        ))
    return response

@router.get("/{team_id}", response_model=ProjectTeamResponse)
async def get_team_by_id(
    team_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ProjectTeam)
        .options(
            selectinload(ProjectTeam.case),
            selectinload(ProjectTeam.team_lead),
            selectinload(ProjectTeam.mentor),
            selectinload(ProjectTeam.members).selectinload(TeamMember.user)
        )
        .where(ProjectTeam.id == team_id)
    )
    result = await db.execute(query)
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    members_resp = [
        TeamMemberResponse(
            id=m.id,
            user_id=m.user_id,
            user_name=f"{m.user.first_name} {m.user.last_name}" if m.user else "Участник",
            role=m.role,
            competencies=m.competencies or [],
            joined_at=m.joined_at
        )
        for m in (t.members or [])
    ]
    return ProjectTeamResponse(
        id=t.id,
        case_id=t.case_id,
        case_title=t.case.title if t.case else None,
        name=t.name,
        team_lead_id=t.team_lead_id,
        team_lead_name=f"{t.team_lead.first_name} {t.team_lead.last_name}" if t.team_lead else "Тимлид",
        mentor_id=t.mentor_id,
        mentor_name=f"{t.mentor.first_name} {t.mentor.last_name}" if t.mentor else None,
        status=t.status,
        created_at=t.created_at,
        members=members_resp
    )

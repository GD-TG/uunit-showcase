from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Any

from app.db.session import get_db
from app.models.user import User, StudentProfile, Company, CompanyRepresentative
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.audit import log_audit_event
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Аутентификация"])

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже зарегистрирован"
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.upper(),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        patronymic=user_in.patronymic,
        phone=user_in.phone,
        avatar_url=user_in.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.email}"
    )
    db.add(user)
    await db.flush()

    # Create role-specific profiles
    if user.role == "STUDENT":
        profile = StudentProfile(
            user_id=user.id,
            university=user_in.university or "УУНиТ",
            faculty=user_in.faculty or "Институт информатики, математики и робототехники (ИИМР)",
            field_of_study=user_in.field_of_study or "09.03.04 Программная инженерия",
            study_program=user_in.study_program or "Разработка программно-информационных систем",
            course=user_in.course or 3,
            academic_group=user_in.academic_group or "ПИ-301",
            bio=user_in.bio,
            professional_interests=user_in.professional_interests or ["Backend", "AI/ML"],
            competencies=user_in.competencies or ["Python", "FastAPI", "PostgreSQL"],
            technologies=user_in.technologies or ["Python", "Docker", "Git"],
            github_url=user_in.github_url,
            gitlab_url=user_in.gitlab_url,
            portfolio_url=user_in.portfolio_url
        )
        db.add(profile)
    elif user.role == "COMPANY":
        company = Company(
            full_name=user_in.company_full_name or "ООО Новые Технологии",
            short_name=user_in.company_short_name or "Новые Технологии",
            industry=user_in.company_industry or "IT / Финтех",
            website=user_in.company_website or "https://tech.uunit.ru",
            contact_email=user.email,
            contact_phone=user.phone,
            is_moderated=False  # Required moderation by UUNiT staff (п. 5.3 ТЗ)
        )
        db.add(company)
        await db.flush()

        rep = CompanyRepresentative(
            user_id=user.id,
            company_id=company.id,
            position=user_in.company_position or "HR-директор"
        )
        db.add(rep)

    await db.commit()
    await db.refresh(user)

    # Log audit
    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        db=db,
        action_type="REGISTER",
        entity_type="user",
        entity_id=str(user.id),
        user_id=user.id,
        user_email=user.email,
        new_values={"role": user.role, "email": user.email},
        ip_address=client_ip
    )

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "avatar_url": user.avatar_url
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.student_profile),
            selectinload(User.company_representative).selectinload(CompanyRepresentative.company)
        )
        .where(User.email == credentials.email)
    )
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный email или пароль"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учетная запись заблокирована администратором"
        )

    # Log audit
    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        db=db,
        action_type="LOGIN",
        entity_type="user",
        entity_id=str(user.id),
        user_id=user.id,
        user_email=user.email,
        ip_address=client_ip
    )

    access_token = create_access_token(user.id)
    company_data = None
    if user.company_representative and user.company_representative.company:
        c = user.company_representative.company
        company_data = {
            "id": c.id,
            "full_name": c.full_name,
            "short_name": c.short_name,
            "logo_url": c.logo_url,
            "is_moderated": c.is_moderated
        }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "avatar_url": user.avatar_url,
            "company": company_data
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

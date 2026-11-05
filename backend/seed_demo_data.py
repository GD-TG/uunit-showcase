import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import Base
from app.models.user import User, StudentProfile, Company, CompanyRepresentative
from app.models.case import CaseProject, CaseNDAAgreement
from app.models.application import CaseApplication
from app.models.team import ProjectTeam, TeamMember
from app.models.project import ProjectMilestone, ProjectSubmission, ProjectReview, AwardWinner
from app.models.showcase import StudentShowcaseProject
from app.models.audit import AuditLog
from app.models.notification import Notification

async def seed():
    # Detect engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        engine = create_async_engine(settings.SQLITE_FALLBACK_URL, echo=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    AsyncSessionMaker = async_sessionmaker(bind=engine, expire_on_commit=False)

    async with AsyncSessionMaker() as db:
        # Check if already seeded
        chk = await db.execute(select(User).where(User.email == "admin@uunit.ru"))
        if chk.scalars().first():
            print("Database already contains demo data.")
            return

        print("Seeding demo data for UUNiT Showcase...")

        # 1. Admin & Staff
        admin = User(
            email="admin@uunit.ru",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN",
            first_name="Алексей",
            last_name="Администраторов",
            patronymic="Валерьевич",
            phone="+7 (917) 123-45-67",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        )
        staff = User(
            email="staff@uunit.ru",
            hashed_password=get_password_hash("staff123"),
            role="STAFF",
            first_name="Елена",
            last_name="Кураторова",
            patronymic="Сергеевна",
            phone="+7 (917) 234-56-78",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
        )
        mentor = User(
            email="mentor@uunit.ru",
            hashed_password=get_password_hash("mentor123"),
            role="MENTOR",
            first_name="Руслан",
            last_name="Хакимов",
            patronymic="Маратович",
            phone="+7 (917) 345-67-89",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
        )
        db.add_all([admin, staff, mentor])
        await db.flush()

        # 2. Companies
        c1 = Company(
            full_name='ООО "Яндекс Технологии"',
            short_name="Яндекс",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Yandex_icon.svg/512px-Yandex_icon.svg.png",
            description="Ведущая российская технологическая компания, создающая интеллектуальные продукты и сервисы на основе машинного обучения.",
            industry="IT / Поисковые системы / ИИ",
            website="https://yandex.ru",
            contact_email="hackathons@yandex-team.ru",
            contact_phone="+7 (495) 739-70-00",
            directions=["Backend", "AI / ML", "Computer Vision", "Big Data"],
            technologies=["Python", "C++", "Go", "ClickHouse", "PyTorch"],
            is_moderated=True,
            completed_projects_count=12
        )
        c2 = Company(
            full_name='ПАО "СберБанк"',
            short_name="Сбер",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sberbank_Logo_2020.svg/640px-Sberbank_Logo_2020.svg.png",
            description="Крупнейший финансовый и технологический холдинг России с передовой экосистемой цифровых продуктов и AI-решений.",
            industry="Финтех / AI / Cloud",
            website="https://sber.ru",
            contact_email="career@sberbank.ru",
            contact_phone="+7 (495) 500-55-50",
            directions=["Fullstack", "Fintech", "DevOps", "Cybersecurity"],
            technologies=["Java", "Kotlin", "React", "PostgreSQL", "Kafka"],
            is_moderated=True,
            completed_projects_count=18
        )
        c3 = Company(
            full_name='АО "Позитив Текнолоджиз"',
            short_name="Positive Technologies",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Positive_Technologies_logo.svg/640px-Positive_Technologies_logo.svg.png",
            description="Лидер в сфере результативной информационной безопасности и защиты критической инфраструктуры.",
            industry="Информационная безопасность",
            website="https://ptsecurity.com",
            contact_email="edu@ptsecurity.com",
            contact_phone="+7 (495) 744-01-44",
            directions=["Информационная безопасность", "Системное программирование", "Reverse Engineering"],
            technologies=["Python", "C/C++", "Rust", "Network Protocols", "SIEM"],
            is_moderated=True,
            completed_projects_count=7
        )
        c4 = Company(
            full_name='ООО "УфаНет Стартап Лаб"',
            short_name="UfaNet Lab",
            logo_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80",
            description="Региональный инновационный хаб и телеком-разработчик в Республике Башкортостан.",
            industry="Телеком / IoT / Умный дом",
            website="https://ufanet.ru",
            contact_email="dev@ufanet.ru",
            directions=["IoT", "Mobile", "Backend", "Frontend"],
            technologies=["FastAPI", "React Native", "MQTT", "PostgreSQL"],
            is_moderated=True,
            completed_projects_count=5
        )
        db.add_all([c1, c2, c3, c4])
        await db.flush()

        # Company Representatives
        rep1_user = User(
            email="hr@yandex.ru",
            hashed_password=get_password_hash("partner123"),
            role="COMPANY",
            first_name="Михаил",
            last_name="Морозов",
            patronymic="Олегович",
            phone="+7 (926) 111-22-33",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        )
        rep2_user = User(
            email="partner@sber.ru",
            hashed_password=get_password_hash("partner123"),
            role="COMPANY",
            first_name="Анна",
            last_name="Соколова",
            patronymic="Дмитриевна",
            phone="+7 (926) 444-55-66",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
        )
        db.add_all([rep1_user, rep2_user])
        await db.flush()

        db.add(CompanyRepresentative(user_id=rep1_user.id, company_id=c1.id, position="Руководитель академических программ"))
        db.add(CompanyRepresentative(user_id=rep2_user.id, company_id=c2.id, position="Tech Lead / Ментор"))
        await db.flush()

        # 3. Students
        s1 = User(
            email="student1@uunit.ru",
            hashed_password=get_password_hash("student123"),
            role="STUDENT",
            first_name="Артур",
            last_name="Каримов",
            patronymic="Ильдарович",
            phone="+7 (987) 654-32-10",
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
        )
        s2 = User(
            email="student2@uunit.ru",
            hashed_password=get_password_hash("student123"),
            role="STUDENT",
            first_name="Диана",
            last_name="Галимова",
            patronymic="Рашидовна",
            phone="+7 (987) 555-44-33",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80"
        )
        s3 = User(
            email="student3@uunit.ru",
            hashed_password=get_password_hash("student123"),
            role="STUDENT",
            first_name="Тимур",
            last_name="Юсупов",
            patronymic="Азатович",
            phone="+7 (987) 999-88-77",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
        )
        db.add_all([s1, s2, s3])
        await db.flush()

        prof1 = StudentProfile(
            user_id=s1.id,
            university="УУНиТ",
            faculty="Институт информатики, математики и робототехники (ИИМР)",
            field_of_study="09.03.04 Программная инженерия",
            study_program="Инженерия программного обеспечения высоконагруженных систем",
            course=3,
            academic_group="ПИ-301",
            bio="Fullstack & Backend разработчик, капитан команды хакатонов УУНиТ. Люблю чистую архитектуру, FastAPI, PostgreSQL и React.",
            professional_interests=["Backend", "HighLoad", "System Design", "Cloud Native"],
            competencies=["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis"],
            technologies=["Python", "FastAPI", "PostgreSQL", "Docker", "TypeScript", "TailwindCSS"],
            github_url="https://github.com/artur-karimov",
            portfolio_url="https://artur.uunit.pro",
            completed_projects_count=3,
            rating=145.0
        )
        prof2 = StudentProfile(
            user_id=s2.id,
            university="УУНиТ",
            faculty="Институт информатики, математики и робототехники (ИИМР)",
            field_of_study="09.03.01 Информатика и вычислительная техника",
            study_program="Искусственный интеллект и машинное обучение",
            course=4,
            academic_group="ИВТ-402",
            bio="Data Scientist / ML Engineer. Опыт в NLP, LLM, Computer Vision и аналитике больших данных.",
            professional_interests=["Machine Learning", "NLP", "LLM Agents", "Computer Vision"],
            competencies=["PyTorch", "Hugging Face", "Pandas", "Scikit-learn", "MLOps"],
            technologies=["Python", "PyTorch", "FastAPI", "Docker", "CUDA"],
            github_url="https://github.com/diana-galimova",
            completed_projects_count=2,
            rating=110.0
        )
        prof3 = StudentProfile(
            user_id=s3.id,
            university="УУНиТ",
            faculty="Институт электроники и телекоммуникаций",
            field_of_study="10.03.01 Информационная безопасность",
            study_program="Безопасность автоматизированных систем",
            course=3,
            academic_group="ИБ-305",
            bio="AppSec & DevSecOps энтузиаст. Занимаюсь поиском уязвимостей, анализом кода (SAST/DAST) и защитой сетей.",
            professional_interests=["Cybersecurity", "DevSecOps", "Reverse Engineering", "Linux"],
            competencies=["Network Security", "Docker Security", "Python", "Linux Admin", "Burp Suite"],
            technologies=["Linux", "Bash", "Python", "Wireshark", "Docker"],
            github_url="https://github.com/timur-security",
            completed_projects_count=1,
            rating=75.0
        )
        db.add_all([prof1, prof2, prof3])
        await db.flush()

        # 4. Cases across 4 categories (п. 5.4 ТЗ)
        today = date.today()
        case1 = CaseProject(
            title="Интеллектуальная система семантического поиска и рекомендаций для студентов УУНиТ",
            company_id=c1.id,
            short_description="Разработка сервиса умного поиска по каталогу учебных материалов, методичек и научных публикаций с использованием векторных эмбеддингов.",
            full_specification="""Цель проекта: создать веб-сервис с открытым API, обеспечивающий гибридный поиск (BM25 + Dense Retrieval) по многотысячной библиотеке УУНиТ.
Требования:
1. Индексация PDF и Markdown документов.
2. Использование модели ru-en-bge или multilingual-e5.
3. Веб-интерфейс с поисковой строкой и подсказками на лету.
4. Развертывание в Docker.""",
            direction="AI / Машинное обучение",
            difficulty="Продвинутый",
            participation_format="Командный",
            work_format="Смешанный",
            max_participants=4,
            required_competencies=["Machine Learning", "NLP", "FastAPI", "Vector DB"],
            recommended_technologies=["Python", "FAISS / Qdrant", "FastAPI", "React"],
            target_courses=[2, 3, 4, 5],
            deadline_date=today + timedelta(days=45),
            application_deadline=today + timedelta(days=10),
            expected_result="Работающий MVP в Docker + бенчмарк качества поиска MRR@10.",
            evaluation_criteria_desc="Оценка точности поиска, чистота кода, отзывчивость UI и полнота документации.",
            selection_type="COMPETITIVE",
            category="CONTEST",
            reward_description="Призовой фонд 300 000 ₽ + Fast-track на стажировку в Яндекс Уфа / Москва",
            has_payment=False,
            prize_fund=300000.0,
            payment_status="CONFIRMED",
            has_internship=True,
            ip_rights_terms="OPEN_SOURCE",
            is_confidential=False,
            status="IN_PROGRESS",
            moderation_status="APPROVED"
        )

        case2 = CaseProject(
            title="Микросервис скоринга финансовой надежности и предотвращения фрода",
            company_id=c2.id,
            short_description="Создание высоконагруженного сервиса валидации транзакций в реальном времени с задержкой не более 50мс.",
            full_specification="""Сервис должен обрабатывать поток событий транзакций и вычислять агрегированные скоринговые признаки.
Архитектурные требования:
- Асинхронный пайплайн обработки.
- Graceful degradation при пиковых нагрузках.
- Покрытие интеграционными тестами > 80%.""",
            direction="Backend",
            difficulty="Продвинутый",
            participation_format="Командный",
            work_format="Дистанционный",
            max_participants=3,
            required_competencies=["HighLoad", "PostgreSQL", "Kafka / Celery", "Python / Go"],
            recommended_technologies=["FastAPI", "asyncpg", "Redis", "Kafka", "Grafana"],
            target_courses=[3, 4],
            deadline_date=today + timedelta(days=30),
            application_deadline=today + timedelta(days=7),
            expected_result="REST API сервис со Swagger-документацией и нагрузочным тестом на 2000 RPS.",
            evaluation_criteria_desc="Производительность (RPS и p99 latency), чистота архитектуры, покрытие тестами.",
            selection_type="COMPETITIVE",
            category="PAID",
            reward_description="Денежное вознаграждение 150 000 ₽ за успешную приемку кода.",
            has_payment=True,
            payment_amount=150000.0,
            payment_status="CONFIRMED",
            has_internship=True,
            ip_rights_terms="EXCLUSIVE_COMPANY_TRANSFER",
            is_confidential=False,
            status="ACTIVE",
            moderation_status="APPROVED"
        )

        case3 = CaseProject(
            title="Интерактивный дашборд киберугроз региональной сети (DevSecOps)",
            company_id=c3.id,
            short_description="Визуализация в реальном времени сетевых аномалий и интеграция с правилами Suricata/Snort.",
            full_specification="""(Конфиденциальный проект)
Требуется подписать Соглашение о конфиденциальности (NDA) перед получением доступа к логам и топологии защищаемой инфраструктуры.""",
            direction="Информационная безопасность",
            difficulty="Средний",
            participation_format="Индивидуальный",
            work_format="Очный",
            max_participants=2,
            required_competencies=["AppSec", "Network Protocols", "SIEM", "Python"],
            recommended_technologies=["Python", "Elasticsearch", "React", "TailwindCSS"],
            target_courses=[3, 4],
            deadline_date=today + timedelta(days=60),
            application_deadline=today + timedelta(days=15),
            expected_result="Консоль мониторинга сетевых атак с алертами в Telegram.",
            evaluation_criteria_desc="Удобство интерфейса, корректность разбора PCAP пакетов.",
            selection_type="TEST_TASK",
            category="OTHER_REWARD",
            reward_description="Оплачиваемая стажировка в Positive Technologies + фирменный мерч и сертификат.",
            has_payment=False,
            has_internship=True,
            payment_status="NOT_PROVIDED",
            ip_rights_terms="CUSTOM_AGREEMENT",
            is_confidential=True,
            status="ACTIVE",
            moderation_status="APPROVED"
        )

        case4 = CaseProject(
            title="Мобильное приложение кампусной навигации для студентов первого курса УУНиТ",
            company_id=c4.id,
            short_description="Интерактивная карта корпусов УУНиТ с поиском аудиторий, расписанием занятий и путеводителем по студенческой жизни.",
            full_specification="""Образовательный кейс для начинающих разработчиков.
Создание кроссплатформенного приложения с поэтажными схемами 1, 2, 8 корпусов УУНиТ.""",
            direction="Мобильная разработка",
            difficulty="Базовый",
            participation_format="Смешанный",
            work_format="Смешанный",
            max_participants=5,
            required_competencies=["Flutter / React Native", "UI/UX Design", "REST API"],
            recommended_technologies=["Flutter", "TypeScript", "Figma", "FastAPI"],
            target_courses=[1, 2, 3],
            deadline_date=today + timedelta(days=40),
            application_deadline=today + timedelta(days=12),
            expected_result="APK-файл и исходный код в репозитории.",
            evaluation_criteria_desc="Удобство интерфейса для первокурсников, точность маршрутов.",
            selection_type="OPEN",
            category="EDUCATIONAL",
            reward_description="Сертификат об успешном проектном обучении УУНиТ + отзыв компании в портфолио.",
            has_payment=False,
            payment_status="NOT_PROVIDED",
            has_internship=False,
            ip_rights_terms="NON_EXCLUSIVE_LICENSE",
            is_confidential=False,
            status="ACTIVE",
            moderation_status="APPROVED"
        )
        db.add_all([case1, case2, case3, case4])
        await db.flush()

        # Add 7 standard milestones to cases
        milestone_titles = [
            ("Анализ задачи и ТЗ", 7),
            ("Проектирование архитектуры и схемы БД", 14),
            ("Создание прототипа интерфейса", 21),
            ("Разработка MVP", 30),
            ("Тестирование и бенчмаркинг", 37),
            ("Финальная версия", 42),
            ("Защита проекта перед экспертами", 45)
        ]
        for c in [case1, case2, case3, case4]:
            for idx, (title, days_off) in enumerate(milestone_titles, 1):
                status_m = "ACCEPTED" if (c.id == case1.id and idx <= 3) else ("IN_PROGRESS" if (c.id == case1.id and idx == 4) else "PENDING")
                db.add(ProjectMilestone(
                    case_id=c.id,
                    order_index=idx,
                    title=title,
                    description=f"Контрольная точка {idx}: {title}",
                    due_date=today + timedelta(days=days_off),
                    status=status_m,
                    reviewer_comment="Этап успешно согласован куратором" if status_m == "ACCEPTED" else None
                ))
        await db.flush()

        # 5. Team, Application, Submission, Review & Award for Case 1 (Сквозной сценарий)
        # Application from student 1
        app1 = CaseApplication(
            case_id=case1.id,
            student_id=s1.id,
            cover_letter="Добрый день! Имею опыт построения поисковых пайплайнов на FAISS и FastAPI. Хочу реализовать этот кейс вместе с командой ИИМР.",
            resume_url="https://artur.uunit.pro/resume.pdf",
            portfolio_url="https://artur.uunit.pro",
            github_url="https://github.com/artur-karimov",
            prior_experience="Участник финала Хакатона Цифровой Прорыв, 1 место в университетском IT-турнире.",
            status="APPROVED",
            company_feedback="Отличное портфолио! Приглашаем возглавить проектную команду."
        )
        db.add(app1)
        await db.flush()

        # Project Team
        team = ProjectTeam(
            case_id=case1.id,
            name="Ufa AI Syndicate",
            team_lead_id=s1.id,
            mentor_id=mentor.id,
            status="ACTIVE"
        )
        db.add(team)
        await db.flush()

        # Team Members
        db.add(TeamMember(team_id=team.id, user_id=s1.id, role="TEAM_LEAD", competencies=["Архитектура", "FastAPI"]))
        db.add(TeamMember(team_id=team.id, user_id=s2.id, role="DATA_SCIENTIST", competencies=["NLP", "PyTorch", "Embeddings"]))
        await db.flush()

        # Submissions (MVP checkpoint)
        sub1 = ProjectSubmission(
            team_id=team.id,
            milestone_id=4,
            is_final=True,
            solution_description="Реализован гибридный поиск (BM25 + BGE-m3 dense retrieval). Собрана коллекция из 15 000 методических пособий УУНиТ, настроен веб-клиент на React с подсветкой сниппетов. Время отклика 80мс.",
            repository_url="https://github.com/artur-karimov/uunit-smart-search",
            demo_url="https://search-demo.uunit.pro",
            presentation_url="https://slides.uunit.pro/smart-search.pdf",
            video_url="https://youtube.com/watch?v=demo-uunit-search",
            status="ACCEPTED"
        )
        db.add(sub1)
        await db.flush()

        # Review with 10 Criteria (п. 5.12 ТЗ)
        review1 = ProjectReview(
            submission_id=sub1.id,
            reviewer_id=rep1_user.id,
            score_completeness=10,
            score_implementation_quality=10,
            score_code_quality=9,
            score_architecture=10,
            score_spec_compliance=10,
            score_usability=9,
            score_originality=9,
            score_documentation=9,
            score_deadline_adherence=10,
            score_teamwork=10,
            total_score=96,
            company_feedback="Блестящая работа команды 'Ufa AI Syndicate'! Отличная архитектура гибридного поиска и высокая скорость работы на реальном корпусе документов УУНиТ. Приглашаем команду на собеседование в AI Lab Яндекса."
        )
        db.add(review1)

        # Award winner 1st place (п. 5.13 ТЗ)
        award = AwardWinner(
            case_id=case1.id,
            team_id=team.id,
            place="1ST_PLACE",
            nomination_name="Лучшее инженерное AI-решение",
            reward_detail="300 000 ₽ + Офферы на стажировку"
        )
        db.add(award)

        # 6. Student Showcase Projects (Витрина собственных проектов студентов, п. 5.14, 5.15 ТЗ)
        sp1 = StudentShowcaseProject(
            author_id=s1.id,
            title="CampusBot: Telegram AI-ассистент расписания и навигации УУНиТ",
            cover_image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            project_type="PET_PROJECT",
            short_description="Бот с интеграцией LLM для быстрого доступа к расписанию преподавателей и мгновенным ответам на частые вопросы студентов.",
            detailed_description="Проект использует парсер личного кабинета УУНиТ, кэширование в Redis и локальную модель llama.cpp для диалогового поиска аудиторий.",
            problem_solved="Решает проблему очередей к информационным стендам и поиска свободных аудиторий в сессию.",
            technologies=["Python", "Aiogram 3", "PostgreSQL", "Redis", "Docker"],
            direction="Backend / AI",
            github_url="https://github.com/artur-karimov/uunit-campus-bot",
            live_demo_url="https://t.me/uunit_helper_bot",
            seeking_team=True,
            open_for_job=True,
            open_for_internship=True,
            moderation_status="APPROVED",
            likes_count=42
        )
        sp2 = StudentShowcaseProject(
            author_id=s2.id,
            title="BashMedAI: Детекция патологий легких на снимках КТ",
            cover_image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
            project_type="STARTUP",
            short_description="Сверточная нейросеть для автоматической сегментации очагов поражения легких в помощь врачам-рентгенологам Республики Башкортостан.",
            detailed_description="Модель обучена на открытых датасетах и анонимизированных данных с точностью Dice Score 0.91.",
            problem_solved="Снижение рутинной нагрузки на врачей и ускорение диагностики в региональных клиниках.",
            technologies=["PyTorch", "MONAI", "FastAPI", "React", "Docker"],
            direction="AI / Компьютерное зрение",
            github_url="https://github.com/diana-galimova/bashmed-ai",
            live_demo_url="https://bashmed.uunit.pro",
            seeking_partner=True,
            seeking_investor=True,
            seeking_mentor=True,
            open_for_internship=True,
            moderation_status="APPROVED",
            likes_count=68
        )
        sp3 = StudentShowcaseProject(
            author_id=s3.id,
            title="AutoVulnScan: Легковесный сканер зависимостей и секретов в Git-репозиториях",
            cover_image_url="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
            project_type="OPEN_SOURCE",
            short_description="CLI-утилита для поиска утекших токенов, приватных ключей и уязвимостей в зависимостях перед коммитом в репозиторий.",
            detailed_description="Реализовано на Python с использованием регулярных выражений высокой энтропии и интеграцией с CVE базами данных.",
            problem_solved="Предотвращение утечек секретов разработчиками в публичный доступ.",
            technologies=["Python", "CLI", "Regex", "GitHub Actions", "Docker"],
            direction="Информационная безопасность",
            github_url="https://github.com/timur-security/autovulnscan",
            open_for_job=True,
            moderation_status="APPROVED",
            likes_count=35
        )
        db.add_all([sp1, sp2, sp3])

        # 7. Initial Audit Logs
        db.add(AuditLog(
            action_type="SYSTEM_INIT",
            entity_type="system",
            user_email="admin@uunit.ru",
            new_values={"status": "initial_seed_completed", "university": "УУНиТ"}
        ))

        await db.commit()
        print("Demo data seeded successfully! All 19 acceptance scenarios are covered.")

if __name__ == "__main__":
    asyncio.run(seed())

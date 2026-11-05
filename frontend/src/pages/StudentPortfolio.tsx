import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  GitBranch, 
  ExternalLink, 
  Trophy, 
  GraduationCap, 
  Building2, 
  Star,
  ShieldCheck,
  Mail,
  User as UserIcon
} from 'lucide-react';
import api from '../api';
import { User } from '../types';

interface StudentPortfolioProps {
  userId?: number;
  currentUser: User | null;
}

export const StudentPortfolio: React.FC<StudentPortfolioProps> = ({ 
  userId, 
  currentUser 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Default to student 1 (Artur Karimov) if not specified
  const targetId = userId || (currentUser?.role === 'STUDENT' ? currentUser.id : 6);

  useEffect(() => {
    fetchPortfolio();
  }, [targetId]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/talents/portfolio/${targetId}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Загрузка цифрового портфолио...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-slate-400 text-xs">Портфолио студента не найдено.</div>;
  }

  const { student, confirmed_company_cases, showcase_projects } = data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Student Profile Card (Fable style) */}
      <div className="p-8 rounded-3xl fable-glass border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <img
            src={student.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
            alt={student.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{student.name}</h1>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Студент УУНиТ</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              {student.faculty} • {student.field_of_study} ({student.course} курс, гр. {student.academic_group})
            </p>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl pt-1">
              {student.bio}
            </p>

            {/* Competencies */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(student.technologies || []).map((tech: string, i: number) => (
                <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/[0.04] text-indigo-300 border border-indigo-500/20 font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Rating stats */}
          <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 space-y-3">
            <div>
              <div className="text-2xl font-black text-amber-400 flex items-center sm:justify-end space-x-1">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{student.rating}</span>
              </div>
              <div className="text-[10px] text-slate-400">Рейтинг проектной активности</div>
            </div>

            <div>
              <div className="text-lg font-bold text-white sm:text-right">
                {student.completed_projects_count} проектов
              </div>
              <div className="text-[10px] text-slate-400">Завершено успешно</div>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmed Corporate Projects (п. 5.16 ТЗ) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Проекты, подтверждённые компаниями-партнёрами
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {confirmed_company_cases.length === 0 ? (
            <div className="p-8 rounded-2xl fable-glass text-center text-xs text-slate-500">
              Пока нет завершённых корпоративных кейсов.
            </div>
          ) : (
            confirmed_company_cases.map((c: any, idx: number) => (
              <div key={idx} className="p-6 rounded-3xl fable-glass border border-emerald-500/20 bg-emerald-950/[0.04] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {c.company_logo && (
                      <img src={c.company_logo} alt={c.company_name} className="w-9 h-9 rounded-xl bg-white/10 p-1 object-contain" />
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base">{c.case_title}</h3>
                      <p className="text-xs text-slate-400">Заказчик: {c.company_name} • Команда: {c.team_name}</p>
                    </div>
                  </div>

                  {/* Confirmed Badge */}
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Проект подтверждён компанией</span>
                  </span>
                </div>

                {/* Award banner if won */}
                {c.award && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>{c.award.place === '1ST_PLACE' ? '🥇 1 Место (Победитель)' : c.award.place} • {c.award.nomination}</span>
                    </div>
                    <span className="text-xs text-amber-200 font-semibold">{c.award.reward_detail}</span>
                  </div>
                )}

                {/* Company Feedback */}
                {c.reviews && c.reviews.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[11px] font-bold text-indigo-400">Официальный отзыв и оценка эксперта:</span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      «{c.reviews[0].company_feedback}»
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Student's Own Showcase Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Собственные разработки и pet-проекты студента
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showcase_projects.map((sp: any) => (
            <div key={sp.id} className="p-5 rounded-2xl fable-glass border border-white/[0.08] space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-semibold">
                {sp.project_type}
              </span>
              <h4 className="font-bold text-white text-sm">{sp.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{sp.short_description}</p>
              <div className="flex items-center space-x-3 pt-2 text-xs">
                {sp.github_url && (
                  <a href={sp.github_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Репозиторий</span>
                  </a>
                )}
                {sp.live_demo_url && (
                  <a href={sp.live_demo_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center space-x-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Демо</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

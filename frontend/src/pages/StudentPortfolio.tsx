import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  GitBranch, 
  ExternalLink, 
  Trophy, 
  ShieldCheck,
  Star,
  Building,
  GraduationCap
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
    return <div className="text-center py-20 text-slate-500 font-mono text-xs">Загрузка профиля студента...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-slate-400 text-xs">Портфолио не найдено.</div>;
  }

  const { student, confirmed_company_cases, showcase_projects } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Official Academic Profile Header */}
      <div className="uunit-panel rounded-xl p-6 border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
              alt={student.name}
              className="w-16 h-16 rounded-lg object-cover border border-[#1E293B]"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{student.name}</h1>
                <span className="uunit-badge bg-[#064E3B]/40 text-[#34D399] border-[#059669]/40">
                  Верифицирован УУНиТ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {student.faculty} • гр. {student.academic_group} ({student.course} курс)
              </p>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Направление: {student.field_of_study}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-right font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1E293B]">
            <div className="text-xs text-slate-400">Рейтинг активности:</div>
            <div className="text-xl font-bold text-[#FBBF24] flex items-center space-x-1">
              <Star className="w-4 h-4 fill-[#FBBF24]" />
              <span>{student.rating}</span>
            </div>
            <div className="text-[10px] text-slate-500">{student.completed_projects_count} завершённых кейса</div>
          </div>
        </div>

        {/* Bio and Stack */}
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {student.bio}
          </p>

          <div className="flex flex-wrap gap-1 pt-1 font-mono">
            {(student.technologies || []).map((t: string, idx: number) => (
              <span key={idx} className="uunit-badge bg-[#0D1322] text-slate-300 border-[#1A2338]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmed Corporate Projects (Official Seals) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <h2 className="text-sm font-mono uppercase font-bold text-slate-200">
            Проекты, подтверждённые компаниями-партнёрами (п. 5.16 ТЗ):
          </h2>
        </div>

        <div className="space-y-3">
          {confirmed_company_cases.length === 0 ? (
            <div className="uunit-card p-6 text-center text-xs text-slate-500 font-mono">
              Подтверждённые кейсы пока отсутствуют.
            </div>
          ) : (
            confirmed_company_cases.map((c: any, idx: number) => (
              <div key={idx} className="uunit-card p-4 space-y-3 border-l-4 border-l-[#059669]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {c.company_logo && (
                      <img src={c.company_logo} alt={c.company_name} className="w-6 h-6 rounded object-contain bg-white/5 p-0.5" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-xs">{c.case_title}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Заказчик: {c.company_name} • Команда: {c.team_name}</p>
                    </div>
                  </div>

                  <span className="uunit-badge bg-[#064E3B]/30 text-[#34D399] border-[#059669]/40 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Проект подтверждён компанией</span>
                  </span>
                </div>

                {/* Award Banner */}
                {c.award && (
                  <div className="p-2 rounded bg-[#78350F]/20 border border-[#D97706]/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#FBBF24] font-bold">
                      {c.award.place === '1ST_PLACE' ? '🥇 1 место (Победитель)' : c.award.place} • {c.award.nomination}
                    </span>
                    <span className="text-slate-300 text-[11px]">{c.award.reward_detail}</span>
                  </div>
                )}

                {/* Company Feedback */}
                {c.reviews && c.reviews.length > 0 && (
                  <div className="p-2.5 rounded bg-[#070A12] border border-[#172033] text-xs space-y-0.5 font-sans">
                    <div className="text-[10px] font-mono text-slate-400">Официальный отзыв эксперта:</div>
                    <p className="text-slate-300 italic">«{c.reviews[0].company_feedback}»</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pet Projects */}
      <div className="space-y-3">
        <h2 className="text-sm font-mono uppercase font-bold text-slate-200">
          Собственные разработки и pet-проекты:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showcase_projects.map((sp: any) => (
            <div key={sp.id} className="uunit-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{sp.project_type}</span>
                <span>{sp.direction}</span>
              </div>
              <h4 className="font-semibold text-white text-xs">{sp.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{sp.short_description}</p>
              <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
                {sp.github_url && (
                  <a href={sp.github_url} target="_blank" rel="noreferrer" className="text-[#60A5FA] hover:underline flex items-center space-x-1">
                    <GitBranch className="w-3 h-3" />
                    <span>Код</span>
                  </a>
                )}
                {sp.live_demo_url && (
                  <a href={sp.live_demo_url} target="_blank" rel="noreferrer" className="text-[#34D399] hover:underline flex items-center space-x-1">
                    <ExternalLink className="w-3 h-3" />
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

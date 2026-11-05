import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  GitBranch, 
  ExternalLink, 
  Award, 
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
    return <div className="text-center py-20 text-slate-500 text-xs">Загрузка профиля студента...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">Портфолио не найдено.</div>;
  }

  const { student, confirmed_company_cases, showcase_projects } = data;

  const getAwardLabel = (place: string) => {
    switch (place) {
      case '1ST_PLACE': return '1 место (Победитель)';
      case '2ND_PLACE': return '2 место';
      case '3RD_PLACE': return '3 место';
      default: return 'Лауреат номинации';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Official Academic Profile Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
              alt={student.name}
              className="w-16 h-16 rounded-md object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Верифицирован УУНиТ</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {student.faculty} • группа {student.academic_group} ({student.course} курс)
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Направление: {student.field_of_study}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Рейтинг активности:</div>
            <div className="text-xl font-bold text-blue-900 flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{student.rating}</span>
            </div>
            <div className="text-xs text-slate-500">{student.completed_projects_count} завершённых проекта</div>
          </div>
        </div>

        {/* Bio and Stack */}
        <div className="space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed">
            {student.bio}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(student.technologies || []).map((t: string, idx: number) => (
              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmed Corporate Projects */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-800" />
          <h2 className="text-sm uppercase font-bold text-slate-800 tracking-wide">
            Проекты, подтверждённые компаниями-партнёрами (п. 5.16 ТЗ):
          </h2>
        </div>

        <div className="space-y-3">
          {confirmed_company_cases.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
              Подтверждённые кейсы пока отсутствуют.
            </div>
          ) : (
            confirmed_company_cases.map((c: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 border-l-4 border-l-blue-800 rounded-lg p-5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    {c.company_logo && (
                      <img 
                        src={c.company_logo} 
                        alt={c.company_name} 
                        className="w-7 h-7 rounded object-contain bg-slate-50 p-1 border border-slate-200" 
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{c.case_title}</h3>
                      <p className="text-xs text-slate-500 font-medium">Заказчик: {c.company_name} • Команда: {c.team_name}</p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Проект принят компанией</span>
                  </span>
                </div>

                {/* Award Banner */}
                {c.award && (
                  <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <span className="text-blue-900 font-bold flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-blue-800" />
                      <span>{getAwardLabel(c.award.place)} • {c.award.nomination}</span>
                    </span>
                    <span className="text-slate-600 font-medium">{c.award.reward_detail}</span>
                  </div>
                )}

                {/* Company Feedback */}
                {c.reviews && c.reviews.length > 0 && (
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Официальный отзыв эксперта компании:</div>
                    <p className="text-slate-800 italic leading-relaxed">«{c.reviews[0].company_feedback}»</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pet Projects */}
      <div className="space-y-3">
        <h2 className="text-sm uppercase font-bold text-slate-800 tracking-wide">
          Собственные разработки и pet-проекты:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showcase_projects.map((sp: any) => (
            <div key={sp.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-blue-800">{sp.project_type}</span>
                <span>{sp.direction}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{sp.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{sp.short_description}</p>
              <div className="flex items-center space-x-3 pt-1 text-xs">
                {sp.github_url && (
                  <a href={sp.github_url} target="_blank" rel="noreferrer" className="text-blue-800 hover:text-blue-950 font-semibold flex items-center space-x-1">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Исходный код</span>
                  </a>
                )}
                {sp.live_demo_url && (
                  <a href={sp.live_demo_url} target="_blank" rel="noreferrer" className="text-blue-800 hover:text-blue-950 font-semibold flex items-center space-x-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Демо-версия</span>
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

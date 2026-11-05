import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Award, 
  GraduationCap, 
  ExternalLink, 
  Mail, 
  Send,
  CheckCircle2,
  Filter
} from 'lucide-react';
import api from '../api';

interface TalentSearchProps {
  onOpenPortfolio: (userId: number) => void;
}

export const TalentSearch: React.FC<TalentSearchProps> = ({ onOpenPortfolio }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState('ALL');

  useEffect(() => {
    fetchStudents();
  }, [selectedCourse, selectedCompetency, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCourse) params.course = selectedCourse;
      if (selectedCompetency !== 'ALL') params.competency = selectedCompetency;
      if (search) params.search = search;
      const res = await api.get('/talents/students', { params });
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (studentName: string) => {
    alert(`Приглашение в проект успешно отправлено студенту ${studentName}! Он получит уведомление в личном кабинете.`);
  };

  const techOptions = ['ALL', 'Python', 'FastAPI', 'PyTorch', 'Docker', 'PostgreSQL', 'React', 'Linux'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-8 rounded-3xl fable-glass border border-white/10 space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          <span>Кадровый резерв и поиск талантов (п. 5.17 ТЗ)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Поиск студентов и проектных команд для компаний
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Фильтруйте обучающихся УУНиТ по институтам, курсу, подтвержденным компетенциям и рейтингу проектной активности. Приглашайте лучших на стажировки и в команды.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ФИО, институту, навыкам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl fable-glass border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tech Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {techOptions.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedCompetency(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedCompetency === t
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Все стеки' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Student Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Поиск студентов...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 fable-glass rounded-2xl text-slate-400 text-xs">
          Студентов по выбранным критериям не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((s) => (
            <div 
              key={s.id} 
              className="p-6 rounded-3xl fable-glass fable-glass-hover border border-white/[0.08] flex flex-col justify-between space-y-4 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                      alt={s.name} 
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10" 
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{s.name}</h3>
                      <p className="text-[11px] text-slate-400">{s.course} курс • {s.academic_group}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{s.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-indigo-400 font-medium">
                  {s.faculty}
                </p>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {s.bio || 'Студент направления программной инженерии УУНиТ.'}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(s.technologies || []).slice(0, 4).map((tech: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06] font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenPortfolio(s.id)}
                  className="text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Портфолио →
                </button>

                <button
                  onClick={() => handleInvite(s.name)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3 h-3" />
                  <span>Пригласить</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

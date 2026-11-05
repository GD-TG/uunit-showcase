import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Send,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import api from '../api';

interface TalentSearchProps {
  onOpenPortfolio: (userId: number) => void;
}

export const TalentSearch: React.FC<TalentSearchProps> = ({ onOpenPortfolio }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState('ALL');

  useEffect(() => {
    fetchStudents();
  }, [selectedCompetency, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
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
    alert(`Официальное приглашение в проект направлено студенту ${studentName}!`);
  };

  const techOptions = ['ALL', 'Python', 'FastAPI', 'PyTorch', 'Docker', 'PostgreSQL', 'React', 'Linux'];

  return (
    <div className="space-y-6">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="text-xs text-slate-500 font-medium">Кадровый резерв УУНиТ / Подбор проектных специалистов</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Реестр студентов и поиск проектных команд
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ФИО, институту, стеку технологий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {techOptions.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedCompetency(t)}
              className={`px-3 py-1 rounded-md border font-medium transition whitespace-nowrap ${
                selectedCompetency === t
                  ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {t === 'ALL' ? 'Все стеки' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of students */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Поиск в базе студентов УУНиТ...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">
          Студенты по заданным критериям не найдены.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all space-y-3.5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                      alt={s.name} 
                      className="w-11 h-11 rounded-md object-cover border border-slate-200" 
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.course} курс • группа {s.academic_group}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{s.rating}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-medium truncate">
                  {s.faculty}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {s.bio || 'Студент направления программной инженерии УУНиТ.'}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(s.technologies || []).slice(0, 4).map((tech: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenPortfolio(s.id)}
                  className="text-blue-800 hover:text-blue-950 font-semibold flex items-center space-x-1"
                >
                  <span>Портфолио</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleInvite(s.name)}
                  className="px-3.5 py-1.5 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
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

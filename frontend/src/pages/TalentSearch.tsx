import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Send,
  GraduationCap
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
    <div className="space-y-4">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-2">
        <div>
          <div className="text-xs font-mono text-slate-400">Кадровый резерв УУНиТ / Подбор специалистов</div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Реестр студентов и поиск проектных команд
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-[#0B101E] p-2.5 rounded-xl border border-[#1A2338]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ФИО, институту, стеку..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {techOptions.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedCompetency(t)}
              className={`px-2.5 py-1 rounded-md border transition whitespace-nowrap ${
                selectedCompetency === t
                  ? 'bg-[#1E293B] text-white border-[#334155]'
                  : 'bg-[#070A12] text-slate-400 border-[#1E293B] hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Все стеки' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of students */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">Поиск в базе студентов...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {students.map((s) => (
            <div key={s.id} className="uunit-card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                      alt={s.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-[#1E293B]" 
                    />
                    <div>
                      <h3 className="font-semibold text-white text-xs">{s.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{s.course} курс • {s.academic_group}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#78350F]/20 text-[#FBBF24] border border-[#D97706]/30 text-xs font-mono font-bold">
                    <Star className="w-3 h-3 fill-[#FBBF24]" />
                    <span>{s.rating}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {s.faculty}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {s.bio || 'Студент направления программной инженерии УУНиТ.'}
                </p>

                <div className="flex flex-wrap gap-1 font-mono">
                  {(s.technologies || []).slice(0, 4).map((tech: string, i: number) => (
                    <span key={i} className="uunit-badge bg-[#070A12] text-slate-300 border-[#1A2338]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#1A2338] flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => onOpenPortfolio(s.id)}
                  className="text-[#60A5FA] hover:underline"
                >
                  Портфолио →
                </button>

                <button
                  onClick={() => handleInvite(s.name)}
                  className="px-3 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-medium transition flex items-center space-x-1"
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

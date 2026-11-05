import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trophy, 
  Lock, 
  Sparkles, 
  Calendar, 
  Users, 
  ChevronRight, 
  CheckCircle,
  Building2,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { CaseProject, User } from '../types';
import api from '../api';
import { CaseDetailModal } from './CaseDetailModal';

interface CasesShowcaseProps {
  currentUser: User | null;
  onSelectCaseForWorkspace: (caseItem: CaseProject) => void;
}

export const CasesShowcase: React.FC<CasesShowcaseProps> = ({ 
  currentUser, 
  onSelectCaseForWorkspace 
}) => {
  const [cases, setCases] = useState<CaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseProject | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    fetchCases();
  }, [selectedDirection, selectedCategory, selectedDifficulty, selectedCourse, search]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDirection !== 'ALL') params.direction = selectedDirection;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
      if (selectedCourse) params.course = selectedCourse;
      if (search) params.search = search;

      const res = await api.get('/cases', { params });
      setCases(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const directions = [
    'ALL',
    'AI / Машинное обучение',
    'Backend',
    'Frontend',
    'Fullstack',
    'Мобильная разработка',
    'Информационная безопасность',
    'DevOps',
    'Big Data'
  ];

  const categories = [
    { id: 'ALL', label: 'Все форматы' },
    { id: 'CONTEST', label: 'Конкурсные с призовым фондом', icon: Trophy },
    { id: 'PAID', label: 'Оплачиваемые проекты', icon: DollarSign },
    { id: 'EDUCATIONAL', label: 'Образовательные', icon: GraduationCap },
    { id: 'OTHER_REWARD', label: 'Стажировки и офферы', icon: Sparkles }
  ];

  return (
    <div className="space-y-8">
      
      {/* Hero Banner (Fable Aesthetic) */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/[0.08] fable-glass">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Весенний семестр 2026 • Уфимский университет науки и технологий</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Реальные ИТ-кейсы от <span className="gradient-text">индустриальных лидеров</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Разрабатывайте реальные продукты для Яндекса, Сбера и Positive Technologies, получайте призовые вознаграждения, офферы на работу и формируйте верифицированное цифровое портфолио УУНиТ.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.08]">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">450 000 ₽</div>
              <div className="text-xs text-slate-400 font-medium">Суммарный призовой фонд</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">4 компании</div>
              <div className="text-xs text-slate-400 font-medium">Активных партнёра</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">100%</div>
              <div className="text-xs text-slate-400 font-medium">Верификация в портфолио</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400 tracking-tight">Fast-track</div>
              <div className="text-xs text-slate-400 font-medium">На стажировки</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию кейса, компании или технологиям..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl fable-glass border border-white/[0.08] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
            />
          </div>

          {/* Course selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Курс:</span>
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourse(selectedCourse === c ? null : c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedCourse === c
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                {c} курс
              </button>
            ))}
          </div>
        </div>

        {/* Direction Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {directions.map((dir) => (
            <button
              key={dir}
              onClick={() => setSelectedDirection(dir)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                selectedDirection === dir
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-slate-200'
              }`}
            >
              {dir === 'ALL' ? 'Все направления' : dir}
            </button>
          ))}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedCategory === cat.id
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:text-slate-300'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Case Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          Загрузка кейсов витрины...
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 fable-glass rounded-2xl border border-white/[0.06]">
          <p className="text-slate-400 text-sm">По выбранным фильтрам кейсы не найдены.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const hasReward = c.prize_fund || c.payment_amount;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="group relative rounded-2xl p-6 fable-glass fable-glass-hover cursor-pointer transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top: Company Logo & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      {c.company_logo ? (
                        <img 
                          src={c.company_logo} 
                          alt={c.company_name} 
                          className="w-10 h-10 rounded-xl bg-white/10 p-1 object-contain border border-white/10" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                          {c.company_name.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-300">{c.company_name}</h4>
                        <span className="text-[11px] text-slate-400">{c.direction}</span>
                      </div>
                    </div>

                    {c.is_confidential && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        <span>NDA</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {c.short_description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      {c.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      {c.participation_format}
                    </span>
                    {(c.recommended_technologies || []).slice(0, 2).map((tech, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Rewards & Action */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    {hasReward ? (
                      <div>
                        <div className="text-xs font-bold text-emerald-400">
                          {c.prize_fund ? `${c.prize_fund.toLocaleString('ru-RU')} ₽` : `${c.payment_amount?.toLocaleString('ru-RU')} ₽`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.category === 'CONTEST' ? 'Призовой фонд' : 'Вознаграждение'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-bold text-indigo-300">
                          {c.has_internship ? 'Стажировка' : 'Сертификат'}
                        </div>
                        <div className="text-[10px] text-slate-500">Подтверждение УУНиТ</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Подробнее</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          currentUser={currentUser}
          onClose={() => setSelectedCase(null)}
          onGoToWorkspace={() => {
            onSelectCaseForWorkspace(selectedCase);
            setSelectedCase(null);
          }}
          onReloadCases={fetchCases}
        />
      )}

    </div>
  );
};

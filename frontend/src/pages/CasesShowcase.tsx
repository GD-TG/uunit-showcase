import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight, 
  Lock, 
  LayoutGrid, 
  List as ListIcon, 
  SlidersHorizontal,
  Calendar,
  Users,
  CheckCircle2,
  Building,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    fetchCases();
  }, [selectedDirection, selectedCategory, selectedCourse, search]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDirection !== 'ALL') params.direction = selectedDirection;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
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
    'DevOps'
  ];

  const categories = [
    { id: 'ALL', label: 'Все форматы' },
    { id: 'CONTEST', label: 'Конкурсные кейсы' },
    { id: 'PAID', label: 'Оплачиваемые проекты' },
    { id: 'OTHER_REWARD', label: 'Стажировки и офферы' },
    { id: 'EDUCATIONAL', label: 'Образовательные' }
  ];

  return (
    <div className="space-y-5">
      
      {/* University Academic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1E293B] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>УУНиТ • Практико-ориентированная проектная деятельность</span>
            <span>/</span>
            <span className="text-[#60A5FA]">Семестр 2026/1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Реестр проектов и кейсов индустриальных партнёров
          </h1>
        </div>

        {/* Quick Stats in Linear style */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-slate-400">Призовой фонд: </span>
            <span className="text-[#34D399] font-bold">450 000 ₽</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-slate-400">Компаний: </span>
            <span className="text-white font-bold">4</span>
          </div>
        </div>
      </div>

      {/* Filter and Toolbar (Linear Pattern) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0B101E] p-2.5 rounded-xl border border-[#1A2338]">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию, компании или технологиям..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        {/* Direction Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-300 focus:outline-none focus:border-[#3B82F6]"
          >
            {directions.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'Все направления' : d}
              </option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-300 focus:outline-none focus:border-[#3B82F6]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Course Selector */}
          <div className="flex items-center space-x-1 border-l border-[#1E293B] pl-2">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourse(selectedCourse === c ? null : c)}
                className={`w-7 h-7 rounded-md text-xs font-mono font-medium transition ${
                  selectedCourse === c
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#070A12] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
                title={`${c} курс`}
              >
                {c}к
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-1 border-l border-[#1E293B] pl-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cases Viewport */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">Загрузка данных реестра...</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 uunit-card text-slate-400 text-xs">
          По заданным критериям кейсы не найдены.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="uunit-card p-5 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Partner + NDA */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {c.company_logo ? (
                      <img src={c.company_logo} alt={c.company_name} className="w-7 h-7 rounded-md object-contain bg-white/5 p-1 border border-white/10" />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-[#1E293B] text-slate-300 font-bold text-xs flex items-center justify-center">
                        {c.company_name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{c.company_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.direction}</div>
                    </div>
                  </div>

                  {c.is_confidential && (
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#881337]/30 text-[#FB7185] border border-[#BE123C]/30">
                      <Lock className="w-2.5 h-2.5" />
                      <span>NDA</span>
                    </span>
                  )}
                </div>

                {/* Case Title */}
                <h3 className="font-semibold text-slate-100 text-sm group-hover:text-[#60A5FA] transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>

                {/* Brief description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {c.short_description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(c.recommended_technologies || []).slice(0, 3).map((t, idx) => (
                    <span key={idx} className="uunit-badge bg-[#060A14] text-slate-300 border-[#1E293B]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Meta Bar */}
              <div className="mt-4 pt-3 border-t border-[#1A2338] flex items-center justify-between text-xs font-mono">
                <div>
                  {c.prize_fund ? (
                    <span className="text-[#34D399] font-bold">{c.prize_fund.toLocaleString('ru-RU')} ₽</span>
                  ) : c.payment_amount ? (
                    <span className="text-[#38BDF8] font-bold">{c.payment_amount.toLocaleString('ru-RU')} ₽</span>
                  ) : (
                    <span className="text-slate-400 font-medium">{c.has_internship ? 'Стажировка' : 'Сертификат'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-white transition-colors text-[11px]">
                  <span>Открыть</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Table View (Linear style) */
        <div className="uunit-panel rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0D1322] text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Проект / Кейс</th>
                <th className="py-2.5 px-4 font-medium">Компания</th>
                <th className="py-2.5 px-4 font-medium">Направление</th>
                <th className="py-2.5 px-4 font-medium">Формат</th>
                <th className="py-2.5 px-4 font-medium">Вознаграждение</th>
                <th className="py-2.5 px-4 font-medium text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033]">
              {cases.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCase(c)}
                  className="hover:bg-[#11182B] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-100 max-w-sm truncate">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {c.company_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {c.direction}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.participation_format}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#34D399]">
                    {c.prize_fund ? `${c.prize_fund.toLocaleString('ru-RU')} ₽` : (c.payment_amount ? `${c.payment_amount.toLocaleString('ru-RU')} ₽` : 'Сертификат')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[#60A5FA] hover:underline font-mono text-[11px]">ТЗ →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

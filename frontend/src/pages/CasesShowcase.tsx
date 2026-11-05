import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight, 
  Lock, 
  LayoutGrid, 
  List as ListIcon, 
  Building,
  CheckCircle2,
  Calendar,
  Users
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
    <div className="space-y-6">
      
      {/* University Academic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>УУНиТ • Практико-ориентированная проектная деятельность</span>
            <span>/</span>
            <span className="text-blue-700">Семестр 2026/1</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Реестр проектов и кейсов индустриальных партнёров
          </h1>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500">Призовой фонд: </span>
            <span className="text-emerald-700 font-bold ml-1">450 000 ₽</span>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500">Партнеры: </span>
            <span className="text-slate-900 font-bold ml-1">4 компании</span>
          </div>
        </div>
      </div>

      {/* Filter and Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию, компании или технологиям..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Direction Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
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
            className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Course Selector */}
          <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourse(selectedCourse === c ? null : c)}
                className={`w-7 h-7 rounded-md text-xs font-semibold transition ${
                  selectedCourse === c
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                title={`${c} курс`}
              >
                {c}к
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Сетка"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Таблица"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cases Viewport */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Загрузка данных реестра...</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">
          По заданным критериям кейсы не найдены.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="bg-white border border-slate-200 rounded-lg p-5 cursor-pointer flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                {/* Header: Partner + NDA */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {c.company_logo ? (
                      <img 
                        src={c.company_logo} 
                        alt={c.company_name} 
                        className="w-8 h-8 rounded-md object-contain bg-slate-50 p-1 border border-slate-200" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200">
                        {c.company_name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{c.company_name}</div>
                      <div className="text-[11px] text-slate-500">{c.direction}</div>
                    </div>
                  </div>

                  {c.is_confidential && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <Lock className="w-3 h-3" />
                      <span>NDA</span>
                    </span>
                  )}
                </div>

                {/* Case Title */}
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-800 transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>

                {/* Brief description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.short_description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(c.recommended_technologies || []).slice(0, 3).map((t, idx) => (
                    <span 
                      key={idx} 
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Meta Bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  {c.prize_fund ? (
                    <span className="text-emerald-700 font-semibold">{c.prize_fund.toLocaleString('ru-RU')} ₽ фонд</span>
                  ) : c.payment_amount ? (
                    <span className="text-blue-700 font-semibold">{c.payment_amount.toLocaleString('ru-RU')} ₽ / проект</span>
                  ) : (
                    <span className="text-slate-600 font-medium">{c.has_internship ? 'Стажировка' : 'Сертификат'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-blue-700 transition-colors text-xs font-medium">
                  <span>Подробнее</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Проект / Кейс</th>
                <th className="py-3 px-4">Компания</th>
                <th className="py-3 px-4">Направление</th>
                <th className="py-3 px-4">Формат</th>
                <th className="py-3 px-4">Вознаграждение</th>
                <th className="py-3 px-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCase(c)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-sm truncate">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {c.company_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.direction}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.participation_format}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">
                    {c.prize_fund ? `${c.prize_fund.toLocaleString('ru-RU')} ₽` : (c.payment_amount ? `${c.payment_amount.toLocaleString('ru-RU')} ₽` : 'Сертификат')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-700 font-medium hover:underline">Подробнее →</span>
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

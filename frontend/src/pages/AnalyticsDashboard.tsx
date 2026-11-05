import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Building2, 
  Layers, 
  Users, 
  Trophy, 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../api';
import { AnalyticsSummary } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/summary');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (format: 'excel' | 'csv' | 'pdf', type: 'cases' | 'students' | 'companies') => {
    window.open(`/api/analytics/export?format=${format}&report_type=${type}`, '_blank');
  };

  const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  if (loading || !data) {
    return <div className="text-center py-20 text-slate-500 text-xs">Загрузка аналитики УУНиТ...</div>;
  }

  const categoryChartData = [
    { name: 'Конкурсные', value: data.categories.CONTEST },
    { name: 'Оплачиваемые', value: data.categories.PAID },
    { name: 'Образовательные', value: data.categories.EDUCATIONAL },
    { name: 'Стажировки / Иные', value: data.categories.OTHER_REWARD },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header & Export Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl fable-glass border border-white/10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Аналитический модуль руководства УУНиТ (п. 5.21 ТЗ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Сводные показатели взаимодействия с индустрией
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Мониторинг проектной активности студентов, вовлеченности ИТ-компаний и финансовой динамики.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadReport('excel', 'cases')}
            className="px-3.5 py-2 rounded-xl fable-glass hover:bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Экспорт в Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownloadReport('pdf', 'cases')}
            className="px-3.5 py-2 rounded-xl fable-glass hover:bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Экспорт в PDF</span>
          </button>

          <button
            onClick={() => handleDownloadReport('csv', 'cases')}
            className="px-3 py-2 rounded-xl fable-glass hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition"
          >
            CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">Всего кейсов</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{data.overview.total_cases}</div>
          <div className="text-[11px] text-slate-400">
            {data.overview.cases_active} открыто • {data.overview.cases_completed} завершено
          </div>
        </div>

        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Призовые фонды</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {data.overview.total_prize_fund.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">100% подтверждено компаниями</div>
        </div>

        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Компании-партнёры</span>
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{data.overview.total_companies}</div>
          <div className="text-[11px] text-slate-400">
            {data.overview.active_companies} прошли верификацию УУНиТ
          </div>
        </div>

        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">Студенты в проектах</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{data.overview.total_students}</div>
          <div className="text-[11px] text-slate-400">
            {data.overview.active_students} с подтвержденным портфолио
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Directions Bar Chart */}
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-base">Распределение проектов по направлениям (п. 5.6 ТЗ)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.directions} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-base">Категории и финансовые форматы (п. 5.4 ТЗ)</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Companies Table */}
      <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-base">Топ компаний по взаимодействию с УУНиТ:</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
              <tr>
                <th className="pb-3 font-semibold">Компания</th>
                <th className="pb-3 font-semibold">Размещено кейсов</th>
                <th className="pb-3 font-semibold">Завершённых проектов</th>
                <th className="pb-3 font-semibold">Статус партнёрства</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.top_companies.map((c, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-bold text-white">{c.name}</td>
                  <td className="py-3 font-mono">{c.cases_count}</td>
                  <td className="py-3 font-mono">{c.completed_count}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                      Активный индустриальный партнёр
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  FileSpreadsheet, 
  FileText, 
  Download,
  Building,
  Layers,
  Users,
  DollarSign
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

  const handleDownload = (format: 'excel' | 'csv' | 'pdf', type: 'cases' | 'students' | 'companies') => {
    window.open(`/api/analytics/export?format=${format}&report_type=${type}`, '_blank');
  };

  const COLORS = ['#2563EB', '#3B82F6', '#059669', '#D97706', '#7C3AED'];

  if (loading || !data) {
    return <div className="text-center py-20 text-slate-500 font-mono text-xs">Формирование аналитического отчёта...</div>;
  }

  const categoryChartData = [
    { name: 'Конкурсные', value: data.categories.CONTEST },
    { name: 'Оплачиваемые', value: data.categories.PAID },
    { name: 'Образовательные', value: data.categories.EDUCATIONAL },
    { name: 'Стажировки / Офферы', value: data.categories.OTHER_REWARD },
  ];

  return (
    <div className="space-y-5">
      
      {/* Header and Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-3">
        <div>
          <div className="text-xs font-mono text-slate-400">Ректорат УУНиТ / Управление проектного обучения</div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Сводная аналитика индустриального взаимодействия
          </h1>
        </div>

        {/* Linear style export buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => handleDownload('excel', 'cases')}
            className="px-3 py-1.5 rounded-lg bg-[#0D1322] hover:bg-[#162038] border border-[#1A2338] text-slate-200 transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownload('pdf', 'cases')}
            className="px-3 py-1.5 rounded-lg bg-[#0D1322] hover:bg-[#162038] border border-[#1A2338] text-slate-200 transition flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#FB7185]" />
            <span>PDF Отчёт</span>
          </button>

          <button
            onClick={() => handleDownload('csv', 'cases')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1322] hover:bg-[#162038] border border-[#1A2338] text-slate-400 hover:text-white transition"
          >
            CSV
          </button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-4 rounded-xl uunit-panel space-y-1">
          <div className="text-slate-400 text-[11px] uppercase">ИТ-кейсы в семестре</div>
          <div className="text-2xl font-bold text-white tracking-tight">{data.overview.total_cases}</div>
          <div className="text-[10px] text-slate-500">{data.overview.cases_active} открыто для заявок</div>
        </div>

        <div className="p-4 rounded-xl uunit-panel space-y-1">
          <div className="text-slate-400 text-[11px] uppercase">Призовой фонд</div>
          <div className="text-2xl font-bold text-[#34D399] tracking-tight">
            {data.overview.total_prize_fund.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-slate-500">Гарантия выплат партнёров</div>
        </div>

        <div className="p-4 rounded-xl uunit-panel space-y-1">
          <div className="text-slate-400 text-[11px] uppercase">Компании-партнёры</div>
          <div className="text-2xl font-bold text-white tracking-tight">{data.overview.total_companies}</div>
          <div className="text-[10px] text-slate-500">Аккредитованы в УУНиТ</div>
        </div>

        <div className="p-4 rounded-xl uunit-panel space-y-1">
          <div className="text-slate-400 text-[11px] uppercase">Студентов в проектной работе</div>
          <div className="text-2xl font-bold text-white tracking-tight">{data.overview.total_students}</div>
          <div className="text-[10px] text-slate-500">Формируют портфолио</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Directions */}
        <div className="p-4 rounded-xl uunit-panel space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
            Распределение по ИТ-направлениям:
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.directions} margin={{ top: 5, right: 5, left: -25, bottom: 15 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090E1A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 rounded-xl uunit-panel space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
            Категории кейсов (п. 5.4 ТЗ):
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#090E1A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Partners Table */}
      <div className="p-4 rounded-xl uunit-panel space-y-3">
        <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
          Реестр компаний-партнёров УУНиТ:
        </h3>
        <table className="w-full text-left text-xs text-slate-300 font-mono">
          <thead className="bg-[#070A12] text-[10px] uppercase text-slate-400 border-b border-[#1E293B]">
            <tr>
              <th className="py-2 px-3">Организация</th>
              <th className="py-2 px-3">Размещено кейсов</th>
              <th className="py-2 px-3">Завершено проектов</th>
              <th className="py-2 px-3">Статус в УУНиТ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172033]">
            {data.top_companies.map((c, i) => (
              <tr key={i} className="hover:bg-[#11182B]">
                <td className="py-2.5 px-3 font-semibold text-white font-sans">{c.name}</td>
                <td className="py-2.5 px-3">{c.cases_count}</td>
                <td className="py-2.5 px-3">{c.completed_count}</td>
                <td className="py-2.5 px-3">
                  <span className="text-[#34D399] font-medium text-[11px]">Аккредитован</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

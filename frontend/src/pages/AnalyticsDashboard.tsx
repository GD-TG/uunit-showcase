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

  const COLORS = ['#1D4ED8', '#3B82F6', '#059669', '#D97706', '#6366F1'];

  if (loading || !data) {
    return <div className="text-center py-20 text-slate-500 text-xs">Формирование аналитического отчёта...</div>;
  }

  const categoryChartData = [
    { name: 'Конкурсные', value: data.categories.CONTEST },
    { name: 'Оплачиваемые', value: data.categories.PAID },
    { name: 'Образовательные', value: data.categories.EDUCATIONAL },
    { name: 'Стажировки / Офферы', value: data.categories.OTHER_REWARD },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="text-xs text-slate-500 font-medium">Ректорат УУНиТ / Управление проектного обучения</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Сводная аналитика индустриального взаимодействия
          </h1>
        </div>

        {/* Export buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => handleDownload('excel', 'cases')}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium transition flex items-center space-x-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownload('pdf', 'cases')}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium transition flex items-center space-x-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-rose-700" />
            <span>PDF Отчёт</span>
          </button>

          <button
            onClick={() => handleDownload('csv', 'cases')}
            className="px-3 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium transition shadow-xs"
          >
            CSV
          </button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">ИТ-кейсы в семестре</div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{data.overview.total_cases}</div>
          <div className="text-xs text-slate-500">{data.overview.cases_active} открыто для заявок</div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Призовой фонд</div>
          <div className="text-3xl font-bold text-emerald-700 tracking-tight">
            {data.overview.total_prize_fund.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-slate-500">Гарантия выплат партнёров</div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Компании-партнёры</div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{data.overview.total_companies}</div>
          <div className="text-xs text-slate-500">Аккредитованы в УУНиТ</div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Студентов в проектах</div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{data.overview.total_students}</div>
          <div className="text-xs text-slate-500">Формируют портфолио</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Directions */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
            Распределение по ИТ-направлениям:
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.directions} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A' }} />
                <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
            Категории кейсов (п. 5.4 ТЗ):
          </h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Partners Table */}
      <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
          Реестр компаний-партнёров УУНиТ:
        </h3>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Организация</th>
                <th className="py-2.5 px-4">Размещено кейсов</th>
                <th className="py-2.5 px-4">Завершено проектов</th>
                <th className="py-2.5 px-4">Статус в УУНиТ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.top_companies.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600">{c.cases_count}</td>
                  <td className="py-3 px-4 text-slate-600">{c.completed_count}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      Аккредитована
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

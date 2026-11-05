import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  History, 
  Building, 
  FileText
} from 'lucide-react';
import api from '../api';

export const ModerationAudit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'companies' | 'audit'>('cases');
  const [cases, setCases] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'cases') {
        const res = await api.get('/cases?only_moderated=false');
        setCases(res.data || []);
      } else if (activeTab === 'companies') {
        const res = await api.get('/companies?only_moderated=false');
        setCompanies(res.data || []);
      } else {
        const res = await api.get('/audit');
        setAuditLogs(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateCase = async (caseId: number, status: string) => {
    try {
      await api.post(`/cases/${caseId}/moderate?status=${status}`);
      alert(`Статус кейса изменён: ${status}`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка модерации');
    }
  };

  const handleModerateCompany = async (companyId: number, approve: boolean) => {
    try {
      await api.post(`/companies/${companyId}/moderate?approve=${approve}`);
      alert(approve ? 'Компания аккредитована в УУНиТ' : 'Отклонено');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка модерации');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="text-xs text-slate-500 font-medium">Служебный контур УУНиТ / Административный контроль</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Модерация кейсов, аккредитация компаний и аудит
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'cases' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Модерация кейсов
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'companies' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Аккредитация компаний
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'audit' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Журнал аудита (Audit Log)
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Загрузка данных...</div>
      ) : activeTab === 'cases' ? (
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{c.title}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    c.moderation_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    c.moderation_status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                    'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {c.moderation_status === 'APPROVED' ? 'Одобрен' : 
                     c.moderation_status === 'PENDING_REVIEW' ? 'На рассмотрении' : 'Отклонён'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Компания: <span className="font-medium text-slate-700">{c.company_name}</span> • Направление: {c.direction} • {c.category}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleModerateCase(c.id, 'APPROVED')}
                  className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition shadow-xs"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'NEEDS_REVISION')}
                  className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium transition shadow-xs"
                >
                  На доработку
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'REJECTED')}
                  className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-medium transition shadow-xs"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'companies' ? (
        <div className="space-y-3">
          {companies.map((comp) => (
            <div key={comp.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between text-xs shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{comp.full_name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{comp.industry} • {comp.website}</p>
              </div>

              <div>
                {comp.is_moderated ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Аккредитована в УУНиТ
                  </span>
                ) : (
                  <button
                    onClick={() => handleModerateCompany(comp.id, true)}
                    className="px-3.5 py-1.5 rounded-md bg-blue-800 hover:bg-blue-900 text-white font-medium transition shadow-xs"
                  >
                    Аккредитовать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Время</th>
                <th className="py-2.5 px-4">Пользователь</th>
                <th className="py-2.5 px-4">Действие</th>
                <th className="py-2.5 px-4">Объект</th>
                <th className="py-2.5 px-4">Параметры</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 text-slate-500">{new Date(log.created_at).toLocaleTimeString('ru-RU')}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{log.user_email || 'система'}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{log.entity_type} #{log.entity_id || '-'}</td>
                  <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs font-mono text-[11px]">
                    {JSON.stringify(log.new_values || log.old_values || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

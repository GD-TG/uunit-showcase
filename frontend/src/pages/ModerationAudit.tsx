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
    <div className="space-y-4">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-2">
        <div>
          <div className="text-xs font-mono text-slate-400">Служебный контур УУНиТ / Административный контроль</div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Модерация кейсов, аккредитация компаний и аудит
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 font-mono text-xs border-b border-[#1E293B] pb-2">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'cases' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Модерация кейсов
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'companies' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Аккредитация компаний
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'audit' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Журнал аудита (Audit Log)
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">Загрузка данных...</div>
      ) : activeTab === 'cases' ? (
        <div className="space-y-2.5">
          {cases.map((c) => (
            <div key={c.id} className="uunit-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{c.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    c.moderation_status === 'APPROVED' ? 'bg-[#064E3B]/40 text-[#34D399]' :
                    c.moderation_status === 'PENDING_REVIEW' ? 'bg-[#78350F]/40 text-[#FBBF24]' : 'bg-[#881337]/40 text-[#FB7185]'
                  }`}>
                    {c.moderation_status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {c.company_name} • {c.direction} • {c.category}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 font-mono">
                <button
                  onClick={() => handleModerateCase(c.id, 'APPROVED')}
                  className="px-2.5 py-1 rounded bg-[#064E3B] hover:bg-[#047857] text-[#34D399] transition"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'NEEDS_REVISION')}
                  className="px-2.5 py-1 rounded bg-[#78350F] hover:bg-[#92400E] text-[#FBBF24] transition"
                >
                  Доработка
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'REJECTED')}
                  className="px-2.5 py-1 rounded bg-[#881337] hover:bg-[#9F1239] text-[#FB7185] transition"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'companies' ? (
        <div className="space-y-2.5">
          {companies.map((comp) => (
            <div key={comp.id} className="uunit-card p-3.5 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-semibold text-white">{comp.full_name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{comp.industry} • {comp.website}</p>
              </div>

              <div>
                {comp.is_moderated ? (
                  <span className="text-[#34D399] font-mono font-medium text-xs">✓ Аккредитована</span>
                ) : (
                  <button
                    onClick={() => handleModerateCompany(comp.id, true)}
                    className="px-3 py-1 rounded bg-[#2563EB] text-white font-mono"
                  >
                    Аккредитовать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="uunit-panel rounded-xl overflow-hidden font-mono text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-[#070A12] text-[10px] uppercase text-slate-400 border-b border-[#1E293B]">
              <tr>
                <th className="py-2 px-3">Дата/Время</th>
                <th className="py-2 px-3">Пользователь</th>
                <th className="py-2 px-3">Операция</th>
                <th className="py-2 px-3">Объект</th>
                <th className="py-2 px-3">Параметры</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033] text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#11182B]">
                  <td className="py-2 px-3 text-slate-400">{new Date(log.created_at).toLocaleTimeString('ru-RU')}</td>
                  <td className="py-2 px-3 text-white">{log.user_email || 'система'}</td>
                  <td className="py-2 px-3 text-[#60A5FA] font-bold">{log.action_type}</td>
                  <td className="py-2 px-3">{log.entity_type} #{log.entity_id || '-'}</td>
                  <td className="py-2 px-3 text-slate-400 truncate max-w-xs">
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

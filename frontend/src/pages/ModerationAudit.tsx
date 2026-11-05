import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  History, 
  Building2, 
  FileText,
  Lock,
  UserCheck
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
      alert(`Кейс успешно обновлен со статусом: ${status}`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка модерации кейса');
    }
  };

  const handleModerateCompany = async (companyId: number, approve: boolean) => {
    try {
      await api.post(`/companies/${companyId}/moderate?approve=${approve}`);
      alert(approve ? 'Компания одобрена для публикации кейсов!' : 'Компания отклонена');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка модерации компании');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-8 rounded-3xl fable-glass border border-white/10 space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Панель сотрудника и администратора УУНиТ (п. 5.23, 5.26 ТЗ)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Модерация контента и журнал аудита
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Проверка юридических лиц, согласование кейсов перед публикацией и сквозной аудит критических операций системы.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cases' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Модерация кейсов</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'companies' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Верификация компаний</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Журнал действий (Аудит-лог)</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Загрузка данных модерации...</div>
      ) : activeTab === 'cases' ? (
        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl fable-glass border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{c.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    c.moderation_status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
                    c.moderation_status === 'PENDING_REVIEW' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {c.moderation_status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.company_name} • {c.direction} • {c.category}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleModerateCase(c.id, 'APPROVED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Одобрить</span>
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'NEEDS_REVISION')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                >
                  На доработку
                </button>
                <button
                  onClick={() => handleModerateCase(c.id, 'REJECTED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Отклонить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'companies' ? (
        <div className="space-y-4">
          {companies.map((comp) => (
            <div key={comp.id} className="p-5 rounded-2xl fable-glass border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">{comp.full_name}</h4>
                <p className="text-xs text-slate-400">{comp.industry} • {comp.website}</p>
              </div>

              <div className="flex items-center space-x-2">
                {comp.is_moderated ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Компания верифицирована</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleModerateCompany(comp.id, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Подтвердить аккредитацию
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-base">Журнал фиксации критических действий (п. 5.26 ТЗ)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                <tr>
                  <th className="pb-3">Дата/Время</th>
                  <th className="pb-3">Пользователь</th>
                  <th className="pb-3">Тип операции</th>
                  <th className="pb-3">Объект</th>
                  <th className="pb-3">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 text-slate-400">{new Date(log.created_at).toLocaleString('ru-RU')}</td>
                    <td className="py-2.5 text-white font-sans">{log.user_email || 'система'}</td>
                    <td className="py-2.5 text-indigo-400 font-bold">{log.action_type}</td>
                    <td className="py-2.5 text-slate-300">{log.entity_type} #{log.entity_id || '-'}</td>
                    <td className="py-2.5 text-slate-500 text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.new_values || log.old_values || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Layers, 
  Send, 
  FileText, 
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { CaseProject, User } from '../types';
import api from '../api';

interface CaseDetailModalProps {
  caseItem: CaseProject;
  currentUser: User | null;
  onClose: () => void;
  onGoToWorkspace: () => void;
  onReloadCases: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  currentUser,
  onClose,
  onGoToWorkspace,
  onReloadCases
}) => {
  const [isNdaSigned, setIsNdaSigned] = useState(caseItem.is_nda_signed || false);
  const [signingNda, setSigningNda] = useState(false);
  
  // Application Form
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleSignNda = async () => {
    try {
      setSigningNda(true);
      await api.post(`/cases/${caseItem.id}/nda-sign`);
      setIsNdaSigned(true);
      onReloadCases();
    } catch (e) {
      console.error(e);
    } finally {
      setSigningNda(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      await api.post('/applications', {
        case_id: caseItem.id,
        cover_letter: coverLetter,
        github_url: githubUrl
      });
      setAppliedSuccess(true);
      setTimeout(() => {
        setShowApplyForm(false);
        setAppliedSuccess(false);
      }, 2000);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка отправки заявки');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl bg-[#090E1A] border border-[#1E293B] p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-3">
            {caseItem.company_logo ? (
              <img src={caseItem.company_logo} alt={caseItem.company_name} className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#1E293B] text-slate-300 font-bold text-sm flex items-center justify-center">
                {caseItem.company_name.slice(0, 1)}
              </div>
            )}
            <div>
              <div className="text-xs text-slate-400 font-mono">{caseItem.company_name} • {caseItem.direction}</div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{caseItem.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Financial and Format Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Вознаграждение:</span>
            <span className="text-[#34D399] font-bold">
              {caseItem.prize_fund ? `${caseItem.prize_fund.toLocaleString('ru-RU')} ₽` : (caseItem.payment_amount ? `${caseItem.payment_amount.toLocaleString('ru-RU')} ₽` : 'Сертификат УУНиТ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Формат участия:</span>
            <span className="text-slate-200">{caseItem.participation_format}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Сложность:</span>
            <span className="text-slate-200">{caseItem.difficulty}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0D1322] border border-[#1A2338]">
            <span className="text-[10px] text-slate-500 uppercase block">РИД (Права):</span>
            <span className="text-slate-200 text-[11px] truncate block">{caseItem.ip_rights_terms}</span>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Постановка задачи:</h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0D1322] p-3 rounded-lg border border-[#1A2338]">
            {caseItem.short_description}
          </p>
        </div>

        {/* Technical Specification & NDA */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Техническое задание:</span>
          </h4>

          {caseItem.is_confidential && !isNdaSigned ? (
            <div className="p-5 rounded-lg bg-[#140810] border border-[#881337]/50 text-center space-y-3">
              <Lock className="w-6 h-6 text-[#FB7185] mx-auto" />
              <div>
                <h5 className="font-semibold text-white text-xs">Доступ ограничен Соглашением о конфиденциальности (NDA)</h5>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-0.5">
                  Полное техническое задание содержит сведения ограниченного доступа. Для ознакомления подпишите соглашение в электронной форме.
                </p>
              </div>
              <button
                onClick={handleSignNda}
                disabled={signingNda}
                className="px-4 py-1.5 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] text-white text-xs font-mono font-medium transition"
              >
                {signingNda ? 'Фиксация соглашения...' : 'Электронно подписать NDA (п. 5.25 ТЗ)'}
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {caseItem.full_specification}
            </div>
          )}
        </div>

        {/* 7 Milestones */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Контрольные точки (7 этапов по ТЗ):</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
            {caseItem.milestones.map((m) => (
              <div key={m.id} className="p-2 rounded bg-[#0D1322] border border-[#1A2338] flex items-center justify-between">
                <span className="text-slate-300 truncate max-w-[200px]">{m.order_index}. {m.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  m.status === 'ACCEPTED' ? 'bg-[#064E3B]/40 text-[#34D399]' :
                  m.status === 'IN_PROGRESS' ? 'bg-[#1E3A8A]/40 text-[#60A5FA]' : 'text-slate-500'
                }`}>
                  {m.status === 'ACCEPTED' ? 'Зачтен' : m.status === 'IN_PROGRESS' ? 'В работе' : 'Ожидает'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
          <button
            onClick={onGoToWorkspace}
            className="px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Рабочее место проекта</span>
          </button>

          {currentUser?.role === 'STUDENT' && (
            <button
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Подать заявку (п. 5.7 ТЗ)</span>
            </button>
          )}
        </div>

        {/* Application Form */}
        {showApplyForm && (
          <form onSubmit={handleApply} className="p-4 rounded-lg bg-[#0D1322] border border-[#2563EB]/40 space-y-3">
            <div className="text-xs font-bold text-white">Форма подачи заявки студента УУНиТ:</div>
            <div>
              <textarea
                rows={3}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Сопроводительное письмо: укажите ваш опыт, стек и мотивацию..."
                className="w-full p-2.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="Ссылка на репозиторий / профиль GitHub (https://github.com/...)"
                className="w-full p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {appliedSuccess ? (
                <span className="text-xs text-[#34D399] flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Заявка успешно направлена компании!</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">Данные студента прикрепятся автоматически</span>
              )}

              <button
                type="submit"
                disabled={applying || appliedSuccess}
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium"
              >
                {applying ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

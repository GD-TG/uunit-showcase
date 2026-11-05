import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Layers, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertTriangle 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-lg bg-white border border-slate-200 p-6 shadow-2xl space-y-5 text-slate-800">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            {caseItem.company_logo ? (
              <img 
                src={caseItem.company_logo} 
                alt={caseItem.company_name} 
                className="w-10 h-10 rounded-md object-contain bg-slate-50 p-1 border border-slate-200" 
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200">
                {caseItem.company_name.slice(0, 1)}
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 font-medium">{caseItem.company_name} • {caseItem.direction}</div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{caseItem.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial and Format Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-medium block">Вознаграждение:</span>
            <span className="text-emerald-700 font-bold text-sm mt-0.5 block">
              {caseItem.prize_fund ? `${caseItem.prize_fund.toLocaleString('ru-RU')} ₽` : (caseItem.payment_amount ? `${caseItem.payment_amount.toLocaleString('ru-RU')} ₽` : 'Сертификат')}
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-medium block">Формат участия:</span>
            <span className="text-slate-800 font-medium text-sm mt-0.5 block">{caseItem.participation_format}</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-medium block">Сложность:</span>
            <span className="text-slate-800 font-medium text-sm mt-0.5 block">{caseItem.difficulty}</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-medium block">РИД (Права):</span>
            <span className="text-slate-800 font-medium text-sm mt-0.5 truncate block">{caseItem.ip_rights_terms}</span>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wide">Постановка задачи:</h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-md border border-slate-200">
            {caseItem.short_description}
          </p>
        </div>

        {/* Technical Specification & NDA */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wide flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Техническое задание:</span>
          </h4>

          {caseItem.is_confidential && !isNdaSigned ? (
            <div className="p-5 rounded-md bg-amber-50 border border-amber-200 text-center space-y-3">
              <AlertTriangle className="w-6 h-6 text-amber-700 mx-auto" />
              <div>
                <h5 className="font-semibold text-slate-900 text-xs">Доступ ограничен Соглашением о конфиденциальности (NDA)</h5>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Полное техническое задание содержит сведения ограниченного доступа компании. Для ознакомления подтвердите согласие в электронной форме.
                </p>
              </div>
              <button
                onClick={handleSignNda}
                disabled={signingNda}
                className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium transition shadow-xs"
              >
                {signingNda ? 'Фиксация соглашения...' : 'Электронно подписать NDA (п. 5.25 ТЗ)'}
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {caseItem.full_specification}
            </div>
          )}
        </div>

        {/* 7 Milestones */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wide flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Контрольные точки (7 этапов по ТЗ):</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {caseItem.milestones.map((m) => (
              <div key={m.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800 truncate max-w-[200px] font-medium">{m.order_index}. {m.title}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  m.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {m.status === 'ACCEPTED' ? 'Зачтен' : m.status === 'IN_PROGRESS' ? 'В работе' : 'Ожидает'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onGoToWorkspace}
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-300"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Открыть в рабочем месте</span>
          </button>

          {currentUser?.role === 'STUDENT' && (
            <button
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Подать заявку на кейс</span>
            </button>
          )}
        </div>

        {/* Application Form */}
        {showApplyForm && (
          <form onSubmit={handleApply} className="p-4 rounded-md bg-blue-50 border border-blue-200 space-y-3">
            <div className="text-xs font-bold text-blue-950">Подача заявки студента УУНиТ:</div>
            <div>
              <textarea
                rows={3}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Сопроводительное письмо: укажите ваш опыт, стек технологий и мотивацию..."
                className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="Ссылка на репозиторий или портфолио GitHub (https://github.com/...)"
                className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {appliedSuccess ? (
                <span className="text-xs text-emerald-800 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Заявка успешно направлена компании!</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Данные студента УУНиТ прикрепятся автоматически</span>
              )}

              <button
                type="submit"
                disabled={applying || appliedSuccess}
                className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition shadow-xs"
              >
                {applying ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

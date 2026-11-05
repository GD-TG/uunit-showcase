import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Lock, 
  Unlock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Send, 
  FileText, 
  Layers, 
  Award,
  Sparkles,
  ExternalLink
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl fable-glass border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Company & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pr-12">
          <div className="flex items-center space-x-3">
            {caseItem.company_logo && (
              <img 
                src={caseItem.company_logo} 
                alt={caseItem.company_name} 
                className="w-12 h-12 rounded-xl bg-white/10 p-1.5 object-contain border border-white/10" 
              />
            )}
            <div>
              <h4 className="font-bold text-white text-sm">{caseItem.company_name}</h4>
              <p className="text-xs text-indigo-400">{caseItem.direction} • {caseItem.difficulty}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {caseItem.category === 'CONTEST' && 'Конкурсный проект'}
              {caseItem.category === 'PAID' && 'Оплачиваемый проект'}
              {caseItem.category === 'EDUCATIONAL' && 'Образовательный проект'}
              {caseItem.category === 'OTHER_REWARD' && 'Стажировка и оффер'}
            </span>
            {caseItem.is_confidential && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>NDA Соглашение</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {caseItem.title}
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {caseItem.short_description}
          </p>
        </div>

        {/* Reward Box */}
        {(caseItem.prize_fund || caseItem.payment_amount || caseItem.reward_description) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Награда и вознаграждение:</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {caseItem.prize_fund && `${caseItem.prize_fund.toLocaleString('ru-RU')} ₽ (Призовой фонд) • `}
                  {caseItem.payment_amount && `${caseItem.payment_amount.toLocaleString('ru-RU')} ₽ (Оплата) • `}
                  {caseItem.reward_description || 'Официальный сертификат УУНиТ'}
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold">
              {caseItem.payment_status === 'CONFIRMED' ? 'Фонд подтвержден' : 'Ожидается'}
            </span>
          </div>
        )}

        {/* Full Specification / NDA Protected Area */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Техническое задание:</span>
          </h3>

          {caseItem.is_confidential && !isNdaSigned ? (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
              <Lock className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <h4 className="font-bold text-white text-base">Кейс защищен Соглашением о конфиденциальности</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Компания требует подписания электронного соглашения о неразглашении конфиденциальных данных УУНиТ перед ознакомлением с ТЗ.
                </p>
              </div>
              <button
                onClick={handleSignNda}
                disabled={signingNda}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                {signingNda ? 'Подписание...' : 'Электронно подписать NDA (1 клик)'}
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
              {caseItem.full_specification}
            </div>
          )}
        </div>

        {/* 7 Standard Milestones Preview */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Контрольные точки выполнения (7 этапов):</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {caseItem.milestones.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{m.order_index}. {m.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  m.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' :
                  m.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-500'
                }`}>
                  {m.status === 'ACCEPTED' ? 'Принят' : m.status === 'IN_PROGRESS' ? 'В работе' : 'Ожидает'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Формат: <b className="text-slate-200">{caseItem.participation_format}</b></span>
            <span>Участников: <b className="text-slate-200">до {caseItem.max_participants} чел.</b></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToWorkspace}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/10 transition flex items-center space-x-2"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Рабочее пространство кейса</span>
            </button>

            {currentUser?.role === 'STUDENT' && (
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Подать заявку на проект</span>
              </button>
            )}
          </div>
        </div>

        {/* Slide-down Application Form */}
        {showApplyForm && (
          <form onSubmit={handleApply} className="p-5 rounded-2xl fable-glass border border-indigo-500/30 space-y-4">
            <h4 className="font-bold text-white text-sm">Подача заявки студента (п. 5.7 ТЗ)</h4>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Сопроводительное письмо и мотивация:
              </label>
              <textarea
                rows={3}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Расскажите компании о вашем опыте, роли в проекте и почему хотите решить этот кейс..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ссылка на профиль GitHub / GitLab:
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {appliedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Заявка успешно отправлена компании!</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Данные профиля УУНиТ прикрепятся автоматически</span>
              )}

              <button
                type="submit"
                disabled={applying || appliedSuccess}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                {applying ? 'Отправка...' : 'Подтвердить отправку'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

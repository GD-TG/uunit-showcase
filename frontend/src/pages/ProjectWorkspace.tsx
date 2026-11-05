import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Upload, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  ExternalLink, 
  FileText, 
  Trophy, 
  Star, 
  UserCheck, 
  Send,
  AlertCircle
} from 'lucide-react';
import { CaseProject, Team, Submission, User } from '../types';
import api from '../api';

interface ProjectWorkspaceProps {
  currentCase: CaseProject | null;
  currentUser: User | null;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ 
  currentCase, 
  currentUser 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'review' | 'team'>('submissions');

  // Submission Form
  const [solutionDesc, setSolutionDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 10 Criteria Review
  const [scores, setScores] = useState({
    completeness: 10,
    implementation: 10,
    code: 9,
    architecture: 10,
    spec: 10,
    usability: 9,
    originality: 9,
    documentation: 9,
    deadlines: 10,
    teamwork: 10
  });
  const [feedback, setFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Award
  const [awardPlace, setAwardPlace] = useState('1ST_PLACE');

  useEffect(() => {
    if (currentCase) {
      fetchTeams();
    }
  }, [currentCase]);

  useEffect(() => {
    if (selectedTeam) {
      fetchSubmissions(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const res = await api.get(`/teams/case/${currentCase?.id || 1}`);
      if (res.data && res.data.length > 0) {
        setSelectedTeam(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubmissions = async (teamId: number) => {
    try {
      const res = await api.get(`/projects/team/${teamId}/submissions`);
      setSubmissions(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      setSubmitting(true);
      await api.post('/projects/submissions', {
        team_id: selectedTeam.id,
        is_final: true,
        solution_description: solutionDesc,
        repository_url: repoUrl,
        demo_url: demoUrl
      });
      alert('Решение успешно зафиксировано в реестре сдачи!');
      setSolutionDesc('');
      setRepoUrl('');
      setDemoUrl('');
      fetchSubmissions(selectedTeam.id);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка отправки решения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async () => {
    const subId = submissions[0]?.id || 1;
    try {
      setReviewing(true);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      await api.post('/projects/reviews', {
        submission_id: subId,
        score_completeness: scores.completeness,
        score_implementation_quality: scores.implementation,
        score_code_quality: scores.code,
        score_architecture: scores.architecture,
        score_spec_compliance: scores.spec,
        score_usability: scores.usability,
        score_originality: scores.originality,
        score_documentation: scores.documentation,
        score_deadline_adherence: scores.deadlines,
        score_teamwork: scores.teamwork,
        total_score: total,
        company_feedback: feedback || 'Проект полностью принят компанией-заказчиком без замечаний.'
      });
      alert(`Официальная оценка ${total}/100 выставлена. Запись внесена в верифицированное портфолио!`);
      if (selectedTeam) fetchSubmissions(selectedTeam.id);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка фиксации оценки');
    } finally {
      setReviewing(false);
    }
  };

  const handleAward = async () => {
    if (!currentCase || !selectedTeam) return;
    try {
      await api.post('/projects/awards', {
        case_id: currentCase.id,
        team_id: selectedTeam.id,
        place: awardPlace,
        nomination_name: 'Лучшее прикладное решение семестра',
        reward_detail: currentCase.reward_description || 'Официальный диплом УУНиТ'
      });
      alert(`Итог зафиксирован: команде присвоено ${awardPlace}!`);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка фиксации награды');
    }
  };

  if (!currentCase) {
    return (
      <div className="text-center py-20 uunit-card space-y-2">
        <Layers className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="font-semibold text-white text-sm">Проект не выбран</h3>
        <p className="text-xs text-slate-400">Выберите кейс из реестра для перехода в рабочее пространство.</p>
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      
      {/* Top Academic Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0B101E] rounded-xl border border-[#1A2338] gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Проектный контур УУНиТ</span>
            <span>/</span>
            <span className="text-[#60A5FA]">{currentCase.company_name}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            {currentCase.title}
          </h1>
        </div>

        {selectedTeam && (
          <div className="flex items-center space-x-2 bg-[#070A12] px-3 py-1.5 rounded-lg border border-[#1E293B] text-xs font-mono">
            <span className="text-slate-400">Команда:</span>
            <span className="font-bold text-white">{selectedTeam.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">TL: {selectedTeam.team_lead_name}</span>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (5/12): 7 Milestones Tracker */}
        <div className="lg:col-span-5 uunit-panel rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
              График контрольных точек (7 этапов):
            </h3>
            <span className="text-[10px] font-mono text-slate-500">п. 5.10 ТЗ</span>
          </div>

          <div className="space-y-2">
            {currentCase.milestones.map((m) => {
              const isAccepted = m.status === 'ACCEPTED';
              const isInProgress = m.status === 'IN_PROGRESS';
              return (
                <div 
                  key={m.id}
                  className={`p-2.5 rounded-lg border transition text-xs font-mono ${
                    isAccepted ? 'bg-[#064E3B]/10 border-[#059669]/30 text-slate-200' :
                    isInProgress ? 'bg-[#1E3A8A]/10 border-[#2563EB]/40 text-white' :
                    'bg-[#070A12] border-[#172033] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">
                      {m.order_index}. {m.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      isAccepted ? 'text-[#34D399] bg-[#064E3B]/40' :
                      isInProgress ? 'text-[#60A5FA] bg-[#1E3A8A]/40' : 'text-slate-500'
                    }`}>
                      {isAccepted ? '✓ Принят' : isInProgress ? 'В работе' : 'Ожидает'}
                    </span>
                  </div>
                  {m.reviewer_comment && (
                    <div className="text-[10px] text-[#34D399] mt-1 font-sans">
                      Замечание куратора: «{m.reviewer_comment}»
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7/12): Submissions / Review / Team */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub-tabs */}
          <div className="flex items-center space-x-1 border-b border-[#1E293B] pb-2">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'submissions' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Сдача решений и код (п. 5.11)
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'review' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Оценка компании (10 критериев)
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'team' ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Роли команды
            </button>
          </div>

          {/* TAB: Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              
              {/* Submission Form */}
              <form onSubmit={handleSubmitSolution} className="uunit-card p-4 space-y-3">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
                  Форма сдачи финального решения:
                </h4>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={solutionDesc}
                    onChange={(e) => setSolutionDesc(e.target.value)}
                    placeholder="Описание реализованного решения: архитектура, модули, результаты..."
                    className="w-full p-2.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Ссылка на репозиторий GitHub"
                    className="p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
                  />
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="Ссылка на работающий сервис / демо"
                    className="p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition font-mono flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Фиксация...' : 'Сдать проект на проверку компании'}</span>
                </button>
              </form>

              {/* Submissions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Журнал сдач:</h4>
                {submissions.map((s) => (
                  <div key={s.id} className="uunit-panel rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#60A5FA] font-bold">
                        {s.is_final ? 'Финальная сдача' : 'Промежуточный этап'}
                      </span>
                      <span className="text-slate-500">
                        {new Date(s.submitted_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs">{s.solution_description}</p>

                    <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
                      {s.repository_url && (
                        <a href={s.repository_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center space-x-1 bg-[#1E293B] px-2 py-0.5 rounded">
                          <GitBranch className="w-3 h-3 text-[#60A5FA]" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {s.demo_url && (
                        <a href={s.demo_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center space-x-1 bg-[#1E293B] px-2 py-0.5 rounded">
                          <ExternalLink className="w-3 h-3 text-[#34D399]" />
                          <span>Демо</span>
                        </a>
                      )}
                    </div>

                    {/* Review preview if present */}
                    {s.reviews && s.reviews.length > 0 && (
                      <div className="mt-2 p-2.5 rounded bg-[#0A1224] border border-[#1E3A8A]/40 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#FBBF24] font-bold">Оценка: {s.reviews[0].total_score} / 100</span>
                          <span className="text-[#34D399]">✓ Проект подтверждён</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">«{s.reviews[0].company_feedback}»</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: Review (10 Criteria) */}
          {activeTab === 'review' && (
            <div className="uunit-card p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                <div>
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-200">
                    Оценка эксперта по 10 критериям (п. 5.12 ТЗ)
                  </h4>
                  <p className="text-[11px] text-slate-400">Шкала: 1–10 баллов по каждому параметру</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-[#FBBF24]">{totalScore} / 100</div>
                  <div className="text-[10px] text-slate-500 font-mono">Итоговый балл</div>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'completeness', label: '1. Полнота решения' },
                  { key: 'implementation', label: '2. Качество реализации' },
                  { key: 'code', label: '3. Качество программного кода' },
                  { key: 'architecture', label: '4. Архитектура' },
                  { key: 'spec', label: '5. Соответствие ТЗ' },
                  { key: 'usability', label: '6. Удобство UX/UI' },
                  { key: 'originality', label: '7. Оригинальность' },
                  { key: 'documentation', label: '8. Документация' },
                  { key: 'deadlines', label: '9. Соблюдение сроков' },
                  { key: 'teamwork', label: '10. Командная работа' },
                ].map(({ key, label }) => (
                  <div key={key} className="p-2 rounded bg-[#070A12] border border-[#172033] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>{label}</span>
                      <span className="text-[#60A5FA] font-bold">{(scores as any)[key]}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={(scores as any)[key]}
                      onChange={(e) => setScores({ ...scores, [key]: parseInt(e.target.value) })}
                      className="w-full accent-[#2563EB]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Официальное заключение компании-заказчика:
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Отзыв компании для внесения в подтверждённое портфолио студента..."
                  className="w-full p-2.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center space-x-2">
                  <select
                    value={awardPlace}
                    onChange={(e) => setAwardPlace(e.target.value)}
                    className="p-1.5 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs font-mono text-white"
                  >
                    <option value="1ST_PLACE">🥇 1 место (Победитель)</option>
                    <option value="2ND_PLACE">🥈 2 место</option>
                    <option value="3RD_PLACE">🥉 3 место</option>
                    <option value="NOMINATION_WINNER">Номинация</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAward}
                    className="px-3 py-1.5 rounded-lg bg-[#78350F]/40 border border-[#D97706]/40 hover:bg-[#78350F]/60 text-[#FBBF24] text-xs font-mono font-medium transition"
                  >
                    Присудить
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={reviewing}
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono font-medium transition"
                >
                  {reviewing ? 'Сохранение...' : 'Зафиксировать оценку'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: Team */}
          {activeTab === 'team' && (
            <div className="uunit-card p-4 space-y-2">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300 pb-1 border-b border-[#1E293B]">
                Штатное расписание команды проекта (п. 5.8 ТЗ):
              </h4>
              {selectedTeam?.members.map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-[#070A12] border border-[#172033] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{m.user_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.competencies.join(', ')}</div>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#172554] text-[#60A5FA] border border-[#1E40AF]/50">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  ExternalLink, 
  Send,
  Award,
  Users
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
      alert(`Итог зафиксирован: команде присвоено призовое место!`);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка фиксации награды');
    }
  };

  if (!currentCase) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-lg p-8 space-y-3">
        <Layers className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="font-semibold text-slate-900 text-sm">Проект не выбран</h3>
        <p className="text-xs text-slate-500">Выберите кейс из реестра для перехода в рабочее пространство.</p>
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Academic Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-xs gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>Проектный практикум УУНиТ</span>
            <span>/</span>
            <span className="text-blue-700 font-semibold">{currentCase.company_name}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            {currentCase.title}
          </h1>
        </div>

        {selectedTeam && (
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-xs">
            <span className="text-slate-500">Команда:</span>
            <span className="font-bold text-slate-900">{selectedTeam.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Тимлид: {selectedTeam.team_lead_name}</span>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5/12): 7 Milestones Tracker */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
              График контрольных точек (7 этапов):
            </h3>
            <span className="text-xs text-slate-400">п. 5.10 ТЗ</span>
          </div>

          <div className="space-y-2">
            {currentCase.milestones.map((m) => {
              const isAccepted = m.status === 'ACCEPTED';
              const isInProgress = m.status === 'IN_PROGRESS';
              return (
                <div 
                  key={m.id}
                  className={`p-3 rounded-md border text-xs transition ${
                    isAccepted ? 'bg-emerald-50/60 border-emerald-200 text-slate-800' :
                    isInProgress ? 'bg-blue-50/60 border-blue-200 text-slate-900' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {m.order_index}. {m.title}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      isAccepted ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' :
                      isInProgress ? 'text-blue-800 bg-blue-100 border border-blue-200' : 
                      'text-slate-500 bg-slate-100 border border-slate-200'
                    }`}>
                      {isAccepted ? 'Зачтен' : isInProgress ? 'В работе' : 'Ожидает'}
                    </span>
                  </div>
                  {m.reviewer_comment && (
                    <div className="text-[11px] text-slate-600 mt-1.5 italic bg-white/70 p-1.5 rounded border border-slate-200">
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
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'submissions' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Сдача решений и код (п. 5.11)
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'review' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Оценка компании (10 критериев)
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'team' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Состав команды
            </button>
          </div>

          {/* TAB: Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              
              {/* Submission Form */}
              <form onSubmit={handleSubmitSolution} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
                <h4 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
                  Форма сдачи финального решения:
                </h4>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={solutionDesc}
                    onChange={(e) => setSolutionDesc(e.target.value)}
                    placeholder="Описание реализованного решения: архитектурные решения, модули, результаты..."
                    className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Ссылка на репозиторий GitHub"
                    className="p-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="Ссылка на рабочий сервис / демо"
                    className="p-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Фиксация...' : 'Сдать проект на проверку компании'}</span>
                </button>
              </form>

              {/* Submissions List */}
              <div className="space-y-2.5">
                <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wide">Журнал сдач:</h4>
                {submissions.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-800 font-bold">
                        {s.is_final ? 'Финальная сдача' : 'Промежуточный этап'}
                      </span>
                      <span className="text-slate-500">
                        {new Date(s.submitted_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{s.solution_description}</p>

                    <div className="flex items-center space-x-2 pt-1">
                      {s.repository_url && (
                        <a 
                          href={s.repository_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-slate-700 hover:text-blue-800 flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                          <span>Репозиторий GitHub</span>
                        </a>
                      )}
                      {s.demo_url && (
                        <a 
                          href={s.demo_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-slate-700 hover:text-blue-800 flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                          <span>Демо-сервис</span>
                        </a>
                      )}
                    </div>

                    {/* Review preview if present */}
                    {s.reviews && s.reviews.length > 0 && (
                      <div className="mt-3 p-3 rounded-md bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-emerald-900">Итоговая оценка: {s.reviews[0].total_score} / 100</span>
                          <span className="text-emerald-800">Решение принято экспертом</span>
                        </div>
                        <p className="text-xs text-slate-700 italic">«{s.reviews[0].company_feedback}»</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: Review (10 Criteria) */}
          {activeTab === 'review' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-800 tracking-wide">
                    Оценка эксперта по 10 критериям (п. 5.12 ТЗ)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Шкала: 1–10 баллов по каждому параметру</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{totalScore} <span className="text-slate-400 text-sm font-normal">/ 100</span></div>
                  <div className="text-xs text-slate-500">Итоговый балл</div>
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
                  <div key={key} className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-medium">{label}</span>
                      <span className="text-blue-800 font-bold">{(scores as any)[key]}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={(scores as any)[key]}
                      onChange={(e) => setScores({ ...scores, [key]: parseInt(e.target.value) })}
                      className="w-full accent-blue-700"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Официальное заключение компании-заказчика:
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Отзыв компании для внесения в подтверждённое портфолио студента..."
                  className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <select
                    value={awardPlace}
                    onChange={(e) => setAwardPlace(e.target.value)}
                    className="p-2 rounded-md bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="1ST_PLACE">1 место (Победитель)</option>
                    <option value="2ND_PLACE">2 место</option>
                    <option value="3RD_PLACE">3 место</option>
                    <option value="NOMINATION_WINNER">Победитель в номинации</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAward}
                    className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-300 flex items-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5 text-blue-700" />
                    <span>Присудить награду</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={reviewing}
                  className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition shadow-xs"
                >
                  {reviewing ? 'Сохранение...' : 'Зафиксировать оценку в реестре'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: Team */}
          {activeTab === 'team' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
              <h4 className="text-xs uppercase font-bold text-slate-800 tracking-wide pb-2 border-b border-slate-100">
                Штатное расписание команды проекта (п. 5.8 ТЗ):
              </h4>
              {selectedTeam?.members.map((m) => (
                <div key={m.id} className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{m.user_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.competencies.join(', ')}</div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
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

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  Star, 
  Trophy, 
  GitBranch, 
  ExternalLink, 
  Video, 
  FileText, 
  UserCheck, 
  Send,
  MessageSquare
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
  const [activeTab, setActiveTab] = useState<'milestones' | 'submissions' | 'review' | 'team'>('milestones');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Submission Form
  const [solutionDesc, setSolutionDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [presUrl, setPresUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 10 Criteria Review Form (Company / Staff)
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

  // Award modal
  const [awardPlace, setAwardPlace] = useState('1ST_PLACE');
  const [awardNomination, setAwardNomination] = useState('Лучшее инженерное AI-решение');

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
      setLoading(true);
      const res = await api.get(`/teams/case/${currentCase?.id || 1}`);
      setTeams(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedTeam(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        demo_url: demoUrl,
        presentation_url: presUrl
      });
      alert('Решение успешно загружено на проверку компании!');
      setSolutionDesc('');
      setRepoUrl('');
      setDemoUrl('');
      fetchSubmissions(selectedTeam.id);
      setActiveTab('submissions');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка отправки решения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmission = async (submissionId: number) => {
    try {
      setReviewing(true);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      await api.post('/projects/reviews', {
        submission_id: submissionId,
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
        company_feedback: feedback || 'Проект полностью соответствует техническому заданию.'
      });
      alert(`Оценка ${total}/100 успешно выставлена! Проект верифицирован в портфолио студентов.`);
      if (selectedTeam) fetchSubmissions(selectedTeam.id);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка выставления оценки');
    } finally {
      setReviewing(false);
    }
  };

  const handleAwardWinner = async () => {
    if (!currentCase || !selectedTeam) return;
    try {
      await api.post('/projects/awards', {
        case_id: currentCase.id,
        team_id: selectedTeam.id,
        place: awardPlace,
        nomination_name: awardNomination,
        reward_detail: currentCase.reward_description || '300 000 ₽ + Сертификат УУНиТ'
      });
      alert(`🎉 Поздравляем! Команде '${selectedTeam.name}' официально присуждено ${awardPlace}!`);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка фиксации награды');
    }
  };

  if (!currentCase) {
    return (
      <div className="text-center py-24 fable-glass rounded-3xl border border-white/10 space-y-4">
        <Layers className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Выберите проект для входа в рабочее пространство</h3>
        <p className="text-xs text-slate-400">Перейдите на Витрину кейсов и нажмите «Рабочее пространство»</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="p-6 rounded-3xl fable-glass border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold mb-1">
            <span>Проектный контур УУНиТ</span>
            <span>•</span>
            <span>{currentCase.company_name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{currentCase.title}</h1>
        </div>

        {/* Selected Team Badge */}
        {selectedTeam && (
          <div className="flex items-center space-x-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
              Т
            </div>
            <div>
              <div className="text-xs font-bold text-white">{selectedTeam.name}</div>
              <div className="text-[10px] text-slate-400">Тимлид: {selectedTeam.team_lead_name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'milestones'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>7 Контрольных точек (Этапы)</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'submissions'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Сдача решений & Артефакты</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'review'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Оценка по 10 критериям ТЗ</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'team'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Команда и роли (п. 5.8)</span>
        </button>
      </div>

      {/* TAB 1: 7 Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {currentCase.milestones.map((m) => {
              const isDone = m.status === 'ACCEPTED';
              const isCurrent = m.status === 'IN_PROGRESS';
              return (
                <div 
                  key={m.id}
                  className={`p-5 rounded-2xl fable-glass border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDone ? 'border-emerald-500/30 bg-emerald-950/10' :
                    isCurrent ? 'border-indigo-500/40 bg-indigo-950/15' : 'border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' :
                      isCurrent ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-white/5 text-slate-500'
                    }`}>
                      {m.order_index}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                      {m.reviewer_comment && (
                        <p className="text-[11px] text-emerald-400 mt-1 italic">
                          Куратор УУНиТ: «{m.reviewer_comment}»
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400">Срок: {m.due_date || 'По плану'}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      isDone ? 'bg-emerald-500/15 text-emerald-400' :
                      isCurrent ? 'bg-indigo-500/15 text-indigo-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      {isDone ? 'Зачтен' : isCurrent ? 'В работе' : 'Ожидает'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Submissions (Upload Solution) */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form to submit final/milestone solution */}
          <form onSubmit={handleSubmitSolution} className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Загрузка решения проекта (п. 5.11 ТЗ)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Описание решения и реализованных функций:
              </label>
              <textarea
                rows={4}
                required
                value={solutionDesc}
                onChange={(e) => setSolutionDesc(e.target.value)}
                placeholder="Подробно опишите стек, модули, бенчмарки и как запускать..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ссылка на исходный код (GitHub / GitLab):
              </label>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/ufa-team/project"
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ссылка на демо-сервис:
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://demo.uunit.pro"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Презентация (PDF / ссылка):
                </label>
                <input
                  type="url"
                  value={presUrl}
                  onChange={(e) => setPresUrl(e.target.value)}
                  placeholder="https://slides.com/presentation"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Отправка на проверку...' : 'Отправить решение компании'}</span>
            </button>
          </form>

          {/* Submissions List */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base">История сдач и ревью:</h3>
            {submissions.length === 0 ? (
              <div className="p-8 rounded-2xl fable-glass border border-white/[0.06] text-center text-xs text-slate-500">
                Пока нет сданных решений.
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-5 rounded-2xl fable-glass border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">
                      {sub.is_final ? 'Финальное решение' : 'Промежуточный результат'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(sub.submitted_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{sub.solution_description}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {sub.repository_url && (
                      <a 
                        href={sub.repository_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-200 border border-white/10"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Код репозитория</span>
                      </a>
                    )}
                    {sub.demo_url && (
                      <a 
                        href={sub.demo_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-200 border border-white/10"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Работающее демо</span>
                      </a>
                    )}
                  </div>

                  {/* Reviews for this submission */}
                  {sub.reviews && sub.reviews.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          Оценка эксперта: {sub.reviews[0].total_score} / 100 баллов
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">✓ Проект подтвержден</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        «{sub.reviews[0].company_feedback}»
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 10 Criteria Review (Company & Staff Evaluation) */}
      {activeTab === 'review' && (
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Оценка проекта представителем компании (п. 5.12 ТЗ)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Выставление баллов строго по 10 обязательным критериям технического задания УУНиТ.
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">
                {Object.values(scores).reduce((a, b) => a + b, 0)} / 100
              </div>
              <div className="text-[10px] text-slate-500">Итоговый балл проекта</div>
            </div>
          </div>

          {/* 10 Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'completeness', label: '1. Полнота решения' },
              { key: 'implementation', label: '2. Качество реализации' },
              { key: 'code', label: '3. Качество программного кода' },
              { key: 'architecture', label: '4. Архитектура' },
              { key: 'spec', label: '5. Соответствие ТЗ' },
              { key: 'usability', label: '6. Удобство использования (UX/UI)' },
              { key: 'originality', label: '7. Оригинальность' },
              { key: 'documentation', label: '8. Качество документации' },
              { key: 'deadlines', label: '9. Соблюдение сроков' },
              { key: 'teamwork', label: '10. Командная работа' },
            ].map(({ key, label }) => (
              <div key={key} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>{label}</span>
                  <span className="text-indigo-400 font-bold">{(scores as any)[key]} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={(scores as any)[key]}
                  onChange={(e) => setScores({ ...scores, [key]: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Официальный текстовый отзыв компании-заказчика:
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Напишите развернутый отзыв о работе студентов (он отобразится в подтвержденном портфолио)..."
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            {/* Award winner action */}
            <div className="flex items-center space-x-2">
              <select
                value={awardPlace}
                onChange={(e) => setAwardPlace(e.target.value)}
                className="p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
              >
                <option value="1ST_PLACE">1 место (Победитель)</option>
                <option value="2ND_PLACE">2 место</option>
                <option value="3RD_PLACE">3 место</option>
                <option value="NOMINATION_WINNER">Специальная номинация</option>
              </select>
              <button
                type="button"
                onClick={handleAwardWinner}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Присудить место</span>
              </button>
            </div>

            <button
              onClick={() => handleReviewSubmission(submissions[0]?.id || 1)}
              disabled={reviewing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
            >
              {reviewing ? 'Сохранение...' : 'Зафиксировать оценку 10 критериев'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Team and Roles */}
      {activeTab === 'team' && (
        <div className="p-6 rounded-3xl fable-glass border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-base">Состав команды и распределение ролей (п. 5.8 ТЗ)</h3>
          {selectedTeam?.members.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  {m.user_name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{m.user_name}</h4>
                  <p className="text-[11px] text-slate-400">{m.competencies.join(', ')}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

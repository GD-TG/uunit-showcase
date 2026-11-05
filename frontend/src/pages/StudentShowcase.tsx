import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  GitBranch, 
  ExternalLink, 
  Heart, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Search,
  Rocket
} from 'lucide-react';
import { StudentShowcaseProject, User } from '../types';
import api from '../api';

interface StudentShowcaseProps {
  currentUser: User | null;
  onOpenPortfolio: (userId: number) => void;
}

export const StudentShowcase: React.FC<StudentShowcaseProps> = ({ 
  currentUser,
  onOpenPortfolio
}) => {
  const [projects, setProjects] = useState<StudentShowcaseProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Project Form
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('PET_PROJECT');
  const [shortDesc, setShortDesc] = useState('');
  const [direction, setDirection] = useState('Fullstack');
  const [techs, setTechs] = useState('React, Python, FastAPI');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [seekingTeam, setSeekingTeam] = useState(false);
  const [openForJob, setOpenForJob] = useState(true);
  const [openForInternship, setOpenForInternship] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [selectedTag]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedTag !== 'ALL') params.tag = selectedTag;
      const res = await api.get('/showcase', { params });
      setProjects(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/showcase', {
        title,
        project_type: projectType,
        short_description: shortDesc,
        direction,
        technologies: techs.split(',').map(s => s.trim()),
        github_url: githubUrl,
        live_demo_url: demoUrl,
        seeking_team: seekingTeam,
        open_for_job: openForJob,
        open_for_internship: openForInternship
      });
      alert('Проект успешно опубликован на витрине!');
      setShowAddModal(false);
      fetchProjects();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка создания проекта');
    }
  };

  const tags = [
    { id: 'ALL', label: 'Все проекты' },
    { id: 'seeking_team', label: '👥 Ищут команду' },
    { id: 'open_for_job', label: '💼 Открыты к офферам' },
    { id: 'open_for_internship', label: '🎓 Ищут стажировку' },
    { id: 'seeking_partner', label: '🤝 Ищут партнёра / инвестора' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl fable-glass border border-white/10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Витрина студенческих проектов (п. 5.14 ТЗ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Стартапы, pet-проекты и ВКР студентов УУНиТ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Открытая площадка инициативных разработок. Компании могут находить перспективные прототипы и приглашать авторов на работу.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Опубликовать свой проект</span>
        </button>
      </div>

      {/* Tags Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
              selectedTag === t.id
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Загрузка проектов...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 fable-glass rounded-2xl text-slate-400 text-xs">
          Проектов по выбранному тегу пока нет.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div 
              key={p.id}
              className="rounded-2xl overflow-hidden fable-glass fable-glass-hover border border-white/[0.08] flex flex-col justify-between transition-all duration-300"
            >
              <div>
                {/* Cover Image */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={p.cover_image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'}
                    alt={p.title}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full fable-glass text-[10px] font-bold text-white border border-white/20">
                    {p.project_type}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div 
                    onClick={() => onOpenPortfolio(p.author_id)}
                    className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
                  >
                    Автор: {p.author_name} ({p.author_course} курс, ИИМР)
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {p.short_description}
                  </p>

                  {/* 6 Special Badges (п. 5.15 ТЗ) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.seeking_team && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Ищу команду
                      </span>
                    )}
                    {p.open_for_job && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                        Открыт к работе
                      </span>
                    )}
                    {p.open_for_internship && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        Ищу стажировку
                      </span>
                    )}
                    {p.seeking_investor && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        Ищу инвестора
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="p-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  {p.live_demo_url && (
                    <a href={p.live_demo_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => onOpenPortfolio(p.author_id)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Портфолио автора →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleCreateProject} className="w-full max-w-lg rounded-3xl fable-glass border border-white/10 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Публикация проекта на витрине</h3>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Название проекта:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: FastDocs AI"
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Тип проекта:</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                >
                  <option value="PET_PROJECT">Pet-проект</option>
                  <option value="STARTUP">Стартап</option>
                  <option value="COURSEWORK">Курсовой проект</option>
                  <option value="DIPLOMA_VKR">Дипломная работа (ВКР)</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Направление:</label>
                <input
                  type="text"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Краткое описание:</label>
              <textarea
                rows={3}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Стек (через запятую):</label>
              <input
                type="text"
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub URL:</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Демо URL:</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            {/* Checkboxes for 6 tags */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input type="checkbox" checked={seekingTeam} onChange={(e) => setSeekingTeam(e.target.checked)} />
                <span>Ищу команду</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input type="checkbox" checked={openForJob} onChange={(e) => setOpenForJob(e.target.checked)} />
                <span>Открыт к работе</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input type="checkbox" checked={openForInternship} onChange={(e) => setOpenForInternship(e.target.checked)} />
                <span>Ищу стажировку</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Опубликовать
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

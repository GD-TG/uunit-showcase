import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  GitBranch, 
  ExternalLink, 
  Search,
  Code2,
  User,
  ArrowRight
} from 'lucide-react';
import { StudentShowcaseProject, User as UserType } from '../types';
import api from '../api';

interface StudentShowcaseProps {
  currentUser: UserType | null;
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
        open_for_job: openForJob
      });
      alert('Проект опубликован в каталоге!');
      setShowAddModal(false);
      fetchProjects();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка публикации проекта');
    }
  };

  const tags = [
    { id: 'ALL', label: 'Все проекты' },
    { id: 'seeking_team', label: 'Ищут команду' },
    { id: 'open_for_job', label: 'Открыты к предложениям' },
    { id: 'open_for_internship', label: 'Ищут стажировку' }
  ];

  const projectTypeLabels: Record<string, string> = {
    PET_PROJECT: 'Pet-проект',
    STARTUP: 'Стартап',
    COURSEWORK: 'Курсовой проект',
    DIPLOMA_VKR: 'ВКР (Диплом)',
    OPEN_SOURCE: 'Open Source'
  };

  return (
    <div className="space-y-6">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="text-xs text-slate-500 font-medium">Студенческая экосистема УУНиТ / Инициативные разработки</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Витрина студенческих проектов и pet-разработок
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить проект</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3 py-1.5 rounded-md border font-medium transition whitespace-nowrap ${
              selectedTag === t.id
                ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Загрузка каталога проектов...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">
          Проекты в выбранной категории отсутствуют.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-blue-800">{projectTypeLabels[p.project_type] || p.project_type}</span>
                  <span>{p.direction}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {p.title}
                </h3>

                <div 
                  onClick={() => onOpenPortfolio(p.author_id)}
                  className="text-xs text-slate-600 hover:text-blue-800 cursor-pointer font-medium"
                >
                  Автор: {p.author_name} ({p.author_course} курс, ИИМР)
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {p.short_description}
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.seeking_team && (
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Ищет команду
                    </span>
                  )}
                  {p.open_for_job && (
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-800 border border-blue-200">
                      Открыт к предложениям
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom links */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {p.github_url && (
                    <a 
                      href={p.github_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 transition"
                      title="GitHub"
                    >
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  {p.live_demo_url && (
                    <a 
                      href={p.live_demo_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 transition"
                      title="Демо-сервис"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onOpenPortfolio(p.author_id)}
                  className="text-xs text-blue-800 hover:text-blue-900 font-semibold flex items-center space-x-1"
                >
                  <span>Портфолио автора</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleCreateProject} className="w-full max-w-lg rounded-lg bg-white border border-slate-200 p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-200">
              Публикация проекта в каталоге УУНиТ
            </h3>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Название проекта:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Тип проекта:</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PET_PROJECT">Pet-проект</option>
                  <option value="STARTUP">Стартап</option>
                  <option value="COURSEWORK">Курсовой проект</option>
                  <option value="DIPLOMA_VKR">ВКР (Диплом)</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Направление:</label>
                <input
                  type="text"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Стек технологий (через запятую):</label>
              <input
                type="text"
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL"
                className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Краткое описание:</label>
              <textarea
                rows={2}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md text-slate-600 hover:text-slate-900 font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-xs"
              >
                Опубликовать проект
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

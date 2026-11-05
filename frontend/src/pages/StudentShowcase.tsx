import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  GitBranch, 
  ExternalLink, 
  Search,
  Code2
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
      alert('Проект опубликован в реестре!');
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

  return (
    <div className="space-y-4">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-3">
        <div>
          <div className="text-xs font-mono text-slate-400">Студенческая экосистема УУНиТ / Инициативные разработки</div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Витрина студенческих проектов и pet-разработок
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono font-medium transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить проект</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-1.5 font-mono text-xs overflow-x-auto pb-1">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3 py-1.5 rounded-md border transition whitespace-nowrap ${
              selectedTag === t.id
                ? 'bg-[#1E293B] text-white border-[#334155]'
                : 'bg-[#0D1322] text-slate-400 border-[#1A2338] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">Загрузка данных...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="uunit-card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-[#60A5FA]">{p.project_type}</span>
                  <span>{p.direction}</span>
                </div>

                <h3 className="font-semibold text-white text-sm line-clamp-1">
                  {p.title}
                </h3>

                <div 
                  onClick={() => onOpenPortfolio(p.author_id)}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Автор: {p.author_name} ({p.author_course} курс)
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {p.short_description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1 font-mono">
                  {p.seeking_team && (
                    <span className="uunit-badge bg-[#064E3B]/40 text-[#34D399] border-[#059669]/40">
                      Ищу команду
                    </span>
                  )}
                  {p.open_for_job && (
                    <span className="uunit-badge bg-[#1E3A8A]/40 text-[#60A5FA] border-[#2563EB]/40">
                      Открыт к работе
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom links */}
              <div className="pt-3 border-t border-[#1A2338] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <GitBranch className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {p.live_demo_url && (
                    <a href={p.live_demo_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onOpenPortfolio(p.author_id)}
                  className="text-[11px] text-[#60A5FA] hover:underline"
                >
                  Портфолио →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateProject} className="w-full max-w-md rounded-xl bg-[#090E1A] border border-[#1E293B] p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-[#1E293B]">
              Публикация проекта в каталоге
            </h3>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Название проекта:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Тип:</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-slate-200 focus:outline-none"
                >
                  <option value="PET_PROJECT">Pet-проект</option>
                  <option value="STARTUP">Стартап</option>
                  <option value="COURSEWORK">Курсовой</option>
                  <option value="DIPLOMA_VKR">ВКР (Диплом)</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Направление:</label>
                <input
                  type="text"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Краткое описание:</label>
              <textarea
                rows={2}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-slate-200"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-mono"
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

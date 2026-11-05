import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Layers, 
  Code2, 
  Users, 
  BarChart2, 
  Shield, 
  Bell, 
  Award,
  ChevronDown,
  Check
} from 'lucide-react';
import { User, Role } from '../types';
import api from '../api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onSwitchRole: (role: Role) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      // fallback
    }
  };

  const navItems = [
    { id: 'cases', label: 'Витрина кейсов', icon: Briefcase },
    { id: 'workspace', label: 'Рабочее место', icon: Layers },
    { id: 'showcase', label: 'Проекты студентов', icon: Code2 },
    { id: 'talents', label: 'Поиск талантов', icon: Users },
    { id: 'portfolio', label: 'Портфолио', icon: Award },
    { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
    ...(currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN' 
      ? [{ id: 'moderation', label: 'Модерация', icon: Shield }] 
      : []
    ),
  ];

  const roleLabels: Record<Role, { title: string; subtitle: string; badge: string }> = {
    STUDENT: { title: 'Артур Каримов', subtitle: 'Студент УУНиТ (ИИМР, 3 курс)', badge: 'Студент' },
    COMPANY: { title: 'Яндекс Технологии', subtitle: 'Индустриальный партнёр', badge: 'Компания' },
    STAFF: { title: 'Елена Кураторова', subtitle: 'Куратор / Модератор УУНиТ', badge: 'Сотрудник' },
    ADMIN: { title: 'Администратор системы', subtitle: 'Полный доступ и аудит', badge: 'Админ' },
    MENTOR: { title: 'Руслан Хакимов', subtitle: 'Академический наставник', badge: 'Ментор' },
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* UUNiT Academic Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveTab('cases')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-800 text-white font-bold text-sm tracking-wider shadow-xs">
              УУ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 text-base leading-none">Витрина проектов</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  УУНиТ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-none">
                Уфимский университет науки и технологий
              </p>
            </div>
          </div>

          {/* Clean Segmented Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-800' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Role Selector & Notifications */}
          <div className="flex items-center space-x-3">
            
            {/* Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 hover:bg-slate-100 transition text-left"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-slate-800 leading-tight">
                    {currentUser ? roleLabels[currentUser.role]?.title : 'Профиль'}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {currentUser ? roleLabels[currentUser.role]?.subtitle : ''}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-xs text-slate-500 font-medium">
                    Демо-переключение ролей:
                  </div>
                  <div className="py-1">
                    {[
                      { role: 'STUDENT' as Role, name: 'Артур Каримов', desc: 'Студент УУНиТ, ИИМР (ПИ-301)' },
                      { role: 'COMPANY' as Role, name: 'Яндекс Технологии', desc: 'Индустриальный партнёр' },
                      { role: 'STAFF' as Role, name: 'Елена Кураторова', desc: 'Сотрудник деканата / Модератор' },
                      { role: 'MENTOR' as Role, name: 'Руслан Хакимов', desc: 'Академический наставник' },
                      { role: 'ADMIN' as Role, name: 'Администратор', desc: 'Полный аудит и управление' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        onClick={() => { onSwitchRole(item.role); setShowRoleMenu(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-slate-500 text-[11px]">{item.desc}</div>
                        </div>
                        {currentUser?.role === item.role && (
                          <Check className="w-4 h-4 text-blue-700 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative border border-slate-200 bg-white"
                title="Уведомления"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-700"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white border border-slate-200 shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-semibold text-slate-800">
                    <span>Уведомления ({notifications.length})</span>
                    <button 
                      onClick={async () => {
                        await api.post('/notifications/read-all');
                        fetchNotifications();
                      }}
                      className="text-xs text-blue-700 hover:text-blue-900"
                    >
                      Прочитать все
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2 space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Новых уведомлений нет</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-slate-600 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

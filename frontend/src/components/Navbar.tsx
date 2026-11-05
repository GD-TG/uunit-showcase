import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Layers, 
  Sparkles, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  Award,
  ChevronDown,
  UserCheck
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
    { id: 'showcase', label: 'Студенческая витрина', icon: Sparkles },
    { id: 'talents', label: 'Поиск студентов', icon: Users },
    { id: 'portfolio', label: 'Моё портфолио', icon: Award },
    { id: 'analytics', label: 'Аналитика УУНиТ', icon: BarChart3 },
    ...(currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN' 
      ? [{ id: 'moderation', label: 'Модерация и аудит', icon: ShieldCheck }] 
      : []
    ),
  ];

  const roleLabels: Record<Role, { title: string; color: string }> = {
    STUDENT: { title: 'Студент УУНиТ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    COMPANY: { title: 'Яндекс (Компания)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    STAFF: { title: 'Куратор УУНиТ', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ADMIN: { title: 'Администратор', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    MENTOR: { title: 'Наставник', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  };

  return (
    <header className="sticky top-0 z-50 w-full fable-glass border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & University badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('cases')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center fable-glow">
              <span className="font-extrabold text-white text-base tracking-wider">ИТ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-tight text-lg">Витрина Проектов</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                  УУНиТ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Единая среда индустриального партнерства</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Role Switcher & Notifications */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Demo Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  currentUser ? roleLabels[currentUser.role]?.color : 'bg-slate-800 text-slate-300'
                }`}
                title="Переключить роль для тестирования сценариев ТЗ"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{currentUser ? roleLabels[currentUser.role]?.title : 'Выбрать роль'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl fable-glass border border-white/10 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/5">
                    Тестовый доступ (Роли ТЗ):
                  </div>
                  <button
                    onClick={() => { onSwitchRole('STUDENT'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 flex items-center justify-between"
                  >
                    <span>Студент (Артур Каримов)</span>
                    <span className="text-[10px] text-emerald-400">ПИ-301</span>
                  </button>
                  <button
                    onClick={() => { onSwitchRole('COMPANY'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 flex items-center justify-between"
                  >
                    <span>Представитель компании</span>
                    <span className="text-[10px] text-amber-400">Яндекс</span>
                  </button>
                  <button
                    onClick={() => { onSwitchRole('STAFF'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 flex items-center justify-between"
                  >
                    <span>Сотрудник УУНиТ</span>
                    <span className="text-[10px] text-blue-400">Куратор</span>
                  </button>
                  <button
                    onClick={() => { onSwitchRole('ADMIN'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 flex items-center justify-between"
                  >
                    <span>Администратор</span>
                    <span className="text-[10px] text-purple-400">Полный доступ</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl fable-glass border border-white/10 shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
                    <span>Уведомления ({notifications.length})</span>
                    <button 
                      onClick={async () => {
                        await api.post('/notifications/read-all');
                        fetchNotifications();
                      }}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Прочитано
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Нет новых уведомлений</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {currentUser && (
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

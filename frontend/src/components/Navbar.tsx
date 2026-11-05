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
    { id: 'showcase', label: 'Студенческие проекты', icon: Code2 },
    { id: 'talents', label: 'Кадровый поиск', icon: Users },
    { id: 'portfolio', label: 'Портфолио', icon: Award },
    { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
    ...(currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN' 
      ? [{ id: 'moderation', label: 'Модерация', icon: Shield }] 
      : []
    ),
  ];

  const roleLabels: Record<Role, { title: string; subtitle: string }> = {
    STUDENT: { title: 'Артур Каримов', subtitle: 'Студент УУНиТ (ИИМР)' },
    COMPANY: { title: 'Яндекс Технологии', subtitle: 'Индустриальный партнёр' },
    STAFF: { title: 'Елена Кураторова', subtitle: 'Сотрудник УУНиТ' },
    ADMIN: { title: 'Администратор', subtitle: 'Системный доступ' },
    MENTOR: { title: 'Руслан Хакимов', subtitle: 'Куратор проекта' },
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090E1A]/95 backdrop-blur-md border-b border-[#172033]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* UUNiT Academic Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('cases')}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E3A8A] border border-[#2563EB]/40 text-white font-bold text-xs tracking-wider">
              УУ
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-100 text-sm tracking-tight">Витрина проектов</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#172554] text-[#60A5FA] border border-[#1E40AF]/50 font-medium">
                  УУНиТ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal">Уфимский университет науки и технологий</p>
            </div>
          </div>

          {/* Segmented Control Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#060A14] p-1 rounded-lg border border-[#172033]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-sm border border-[#334155]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#60A5FA]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Role Selector & Notifications */}
          <div className="flex items-center space-x-2.5">
            
            {/* Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] transition text-left"
              >
                <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                <div className="hidden sm:block">
                  <div className="text-[11px] font-medium text-slate-200 leading-none">
                    {currentUser ? roleLabels[currentUser.role]?.title : 'Профиль'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
                    {currentUser ? roleLabels[currentUser.role]?.subtitle : ''}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl py-1.5 z-50 divide-y divide-[#1E293B]/60">
                  <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                    Переключение роли (ТЗ):
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { onSwitchRole('STUDENT'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white">Артур Каримов</div>
                        <div className="text-[10px] text-slate-400">Студент УУНиТ, ИИМР, 3 курс</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#34D399] bg-[#064E3B]/40 px-1.5 py-0.5 rounded border border-[#059669]/40">ПИ-301</span>
                    </button>

                    <button
                      onClick={() => { onSwitchRole('COMPANY'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white">Яндекс Технологии</div>
                        <div className="text-[10px] text-slate-400">Индустриальный партнёр</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#FBBF24] bg-[#78350F]/40 px-1.5 py-0.5 rounded border border-[#D97706]/40">Компания</span>
                    </button>

                    <button
                      onClick={() => { onSwitchRole('STAFF'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white">Елена Кураторова</div>
                        <div className="text-[10px] text-slate-400">Сотрудник деканата / Модератор</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#60A5FA] bg-[#1E3A8A]/40 px-1.5 py-0.5 rounded border border-[#2563EB]/40">УУНиТ</span>
                    </button>

                    <button
                      onClick={() => { onSwitchRole('ADMIN'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white">Администратор</div>
                        <div className="text-[10px] text-slate-400">Полный доступ и аудит</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#C084FC] bg-[#581C87]/40 px-1.5 py-0.5 rounded border border-[#7C3AED]/40">Root</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] transition relative border border-transparent hover:border-[#334155]"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] text-xs font-semibold text-slate-200">
                    <span>Уведомления ({notifications.length})</span>
                    <button 
                      onClick={async () => {
                        await api.post('/notifications/read-all');
                        fetchNotifications();
                      }}
                      className="text-[10px] text-[#60A5FA] hover:underline"
                    >
                      Пометить прочитанными
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-2 space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Новых уведомлений нет</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded-lg bg-[#070A12] border border-[#1E293B] text-xs">
                          <p className="font-medium text-slate-200">{n.title}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
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

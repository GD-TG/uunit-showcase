import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CasesShowcase } from './pages/CasesShowcase';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { StudentShowcase } from './pages/StudentShowcase';
import { StudentPortfolio } from './pages/StudentPortfolio';
import { TalentSearch } from './pages/TalentSearch';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ModerationAudit } from './pages/ModerationAudit';
import { User, Role, CaseProject } from './types';
import api from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('cases');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCaseForWorkspace, setSelectedCaseForWorkspace] = useState<CaseProject | null>(null);
  const [targetPortfolioUserId, setTargetPortfolioUserId] = useState<number | undefined>(undefined);

  // Initialize demo student by default
  useEffect(() => {
    switchRole('STUDENT');
    fetchInitialCase();
  }, []);

  const fetchInitialCase = async () => {
    try {
      const res = await api.get('/cases');
      if (res.data && res.data.length > 0) {
        setSelectedCaseForWorkspace(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const switchRole = async (role: Role) => {
    const roleCredentials: Record<Role, { email: string; pass: string }> = {
      STUDENT: { email: 'student1@uunit.ru', pass: 'student123' },
      COMPANY: { email: 'hr@yandex.ru', pass: 'partner123' },
      STAFF: { email: 'staff@uunit.ru', pass: 'staff123' },
      ADMIN: { email: 'admin@uunit.ru', pass: 'admin123' },
      MENTOR: { email: 'mentor@uunit.ru', pass: 'mentor123' }
    };

    const creds = roleCredentials[role];
    try {
      const res = await api.post('/auth/login', {
        email: creds.email,
        password: creds.pass
      });
      localStorage.setItem('uunit_token', res.data.access_token);
      setCurrentUser(res.data.user);
    } catch (e) {
      console.error('Role switch failed', e);
    }
  };

  const handleOpenPortfolio = (userId: number) => {
    setTargetPortfolioUserId(userId);
    setActiveTab('portfolio');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Premium Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'portfolio') setTargetPortfolioUserId(undefined);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        onSwitchRole={switchRole}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'cases' && (
          <CasesShowcase
            currentUser={currentUser}
            onSelectCaseForWorkspace={(c) => {
              setSelectedCaseForWorkspace(c);
              setActiveTab('workspace');
            }}
          />
        )}

        {activeTab === 'workspace' && (
          <ProjectWorkspace
            currentCase={selectedCaseForWorkspace}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'showcase' && (
          <StudentShowcase
            currentUser={currentUser}
            onOpenPortfolio={handleOpenPortfolio}
          />
        )}

        {activeTab === 'talents' && (
          <TalentSearch
            onOpenPortfolio={handleOpenPortfolio}
          />
        )}

        {activeTab === 'portfolio' && (
          <StudentPortfolio
            userId={targetPortfolioUserId}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'moderation' && (
          <ModerationAudit />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 fable-glass mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">АИС «Витрина ИТ-проектов»</span>
            <span>•</span>
            <span>ФГБОУ ВО «Уфимский университет науки и технологий» (УУНиТ)</span>
          </div>
          <div>
            Стек: Python 3.12 (FastAPI) + PostgreSQL 16 + React 19 + Tailwind CSS
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;

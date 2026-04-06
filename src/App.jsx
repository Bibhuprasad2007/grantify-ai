import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import AIAssistantPage from './components/AIAssistantPage';
import ApplicationForm from './components/ApplicationForm';
import LoanForm from './components/LoanForm';
import LoginPage from './components/LoginPage';
import { useUser } from './context/UserContext';
import { GraduationCap } from 'lucide-react';

const App = () => {
  const { user, loading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center shadow-lg shadow-accent/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-3 text-xs font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onApplyLoan={() => setCurrentView('apply-loan')} 
            onApplyScholarship={() => setCurrentView('apply-scholarship')} 
          />
        );
      case 'apply-loan':
        return <LoanForm onBackToDashboard={() => setCurrentView('dashboard')} />;
      case 'apply-scholarship':
        return <ApplicationForm onBackToDashboard={() => setCurrentView('dashboard')} />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      default:
        return <Dashboard onApplyLoan={() => setCurrentView('apply-loan')} onApplyScholarship={() => setCurrentView('apply-scholarship')} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-1 font-body">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        onNavigate={(view) => setCurrentView(view)}
        activeView={currentView}
        onOpenAi={() => setIsAiOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {currentView !== 'ai-assistant' && <TopBar />}
        <main className={`flex-1 overflow-x-hidden custom-scrollbar ${currentView === 'ai-assistant' ? 'overflow-y-hidden p-6' : 'overflow-y-auto p-6'}`}>
          {renderContent()}
        </main>
      </div>

      <AIAssistant isOpen={isAiOpen} toggleOpen={() => setIsAiOpen(!isAiOpen)} />
    </div>
  );
};

export default App;

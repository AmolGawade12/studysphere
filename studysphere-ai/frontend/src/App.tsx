import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Notes } from './pages/Notes';
import { AITutor } from './pages/AITutor';
import { Quiz } from './pages/Quiz';
import { Planner } from './pages/Planner';
import { Timer } from './pages/Timer';
import { Progress } from './pages/Progress';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import notificationService from './services/notificationService';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Navigation Flow State
  const [viewState, setViewState] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [appSubPage, setAppSubPage] = useState<string>('dashboard');
  const [subPageParams, setSubPageParams] = useState<any>(null);

  // Unread alerts count
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getAll();
      const count = data.filter((n: any) => !n.read).length;
      setUnreadCount(count);
    } catch {
      // Ignore
    }
  };

  // Sync flowState with user login state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setViewState('app');
        fetchUnreadCount();
      } else {
        setViewState('landing');
      }
    }
  }, [user, loading]);

  // Handle updates to notification counts periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(fetchUnreadCount, 15000); // sync every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNavigateAppSubPage = (page: string, params?: any) => {
    setAppSubPage(page);
    setSubPageParams(params || null);
    fetchUnreadCount(); // update unread badges on page shifts
  };

  const handleClearParams = () => {
    setSubPageParams(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Booting StudySphere...</span>
      </div>
    );
  }

  // 1. Render Login Flow
  if (viewState === 'login') {
    return (
      <Login
        onSuccess={() => setViewState('app')}
        onNavigateToRegister={() => setViewState('register')}
        onBack={() => setViewState('landing')}
      />
    );
  }

  // 2. Render Register Flow
  if (viewState === 'register') {
    return (
      <Register
        onSuccess={() => setViewState('app')}
        onNavigateToLogin={() => setViewState('login')}
        onBack={() => setViewState('landing')}
      />
    );
  }

  // 3. Render Landing page
  if (viewState === 'landing') {
    return (
      <Landing
        onOpenLogin={() => setViewState('login')}
        onOpenRegister={() => setViewState('register')}
        onNavigate={(page) => page === 'landing' ? setViewState('landing') : setViewState('login')}
      />
    );
  }

  // 4. Render Main Dashboard Workspace Layout
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Collapsible Sidebar */}
      <Sidebar
        currentPage={appSubPage}
        onNavigate={handleNavigateAppSubPage}
        unreadCount={unreadCount}
      />

      {/* Main Workspace Frame container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden md:max-h-screen md:overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {appSubPage === 'dashboard' && (
            <Dashboard 
              onNavigate={handleNavigateAppSubPage} 
            />
          )}
          {appSubPage === 'subjects' && (
            <Subjects 
              onNavigate={handleNavigateAppSubPage} 
            />
          )}
          {appSubPage === 'notes' && (
            <Notes 
              onNavigate={handleNavigateAppSubPage} 
            />
          )}
          {appSubPage === 'ai-tutor' && (
            <AITutor 
              initialParams={subPageParams} 
              clearParams={handleClearParams} 
            />
          )}
          {appSubPage === 'quizzes' && (
            <Quiz />
          )}
          {appSubPage === 'planner' && (
            <Planner />
          )}
          {appSubPage === 'timer' && (
            <Timer />
          )}
          {appSubPage === 'progress' && (
            <Progress />
          )}
          {appSubPage === 'notifications' && (
            <Notifications 
              onRefreshUnreadCount={fetchUnreadCount} 
            />
          )}
          {appSubPage === 'profile' && (
            <Profile />
          )}
          {appSubPage === 'settings' && (
            <Settings />
          )}
        </div>
      </main>
    </div>
  );
};
export default App;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  BookOpen, Clock, Award, CheckSquare, 
  FileUp, Bot, HelpCircle, Calendar,
  ChevronRight, FileText, ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';
import progressService from '../services/progressService';
import taskService, { MockTask } from '../services/taskService';
import noteService from '../services/noteService';
import subjectService from '../services/subjectService';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenUploadModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    total_subjects: 4,
    study_hours: 18.5,
    quiz_average: 82.0,
    tasks_completed: 75.0
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const analytics = await progressService.getAnalytics();
      setStats({
        total_subjects: analytics.subject_progress.length,
        study_hours: analytics.stats.total_study_hours,
        quiz_average: analytics.stats.quiz_average,
        tasks_completed: analytics.stats.tasks_completed
      });
      setWeeklyData(analytics.weekly_study_time);
      setSubjects(analytics.subject_progress.slice(0, 4));

      // Fetch tasks
      const allTasks = await taskService.getAll();
      setTasks(allTasks.slice(0, 3)); // show first 3 tasks

      // Fetch notes
      const allNotes = await noteService.getAll();
      setRecentNotes(allNotes.slice(0, 3)); // show first 3 notes
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (task: MockTask) => {
    const updatedStatus = !task.completed;
    try {
      await taskService.update(task.id, { completed: updatedStatus });
      
      // Update local task checklist list
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
      
      // Show feedback
      if (updatedStatus) {
        showToast(`Task "${task.title}" completed! Keep it up! 🎉`, 'success');
      } else {
        showToast(`Task "${task.title}" marked as incomplete.`, 'info');
      }

      // Re-fetch progress metrics
      const analytics = await progressService.getAnalytics();
      setStats(prev => ({
        ...prev,
        tasks_completed: analytics.stats.tasks_completed
      }));
    } catch (err) {
      showToast('Failed to update task state.', 'error');
    }
  };

  // Quick Action triggers
  const handleQuickAction = (page: string) => {
    onNavigate(page);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.profile?.name || user?.username || 'Student';
    if (hour < 12) return `Good morning, ${name} 👋`;
    if (hour < 18) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Loading your workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Ready to make progress today? Let's crush your study targets.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-4 py-2.5 rounded-xl shadow-sm self-start text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
          📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Subjects", val: stats.total_subjects, icon: BookOpen, sub: "Registered courses", col: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
          { title: "Study Hours", val: `${stats.study_hours}h`, icon: Clock, sub: "↑ 2.1h this week", col: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { title: "Quiz Average", val: `${stats.quiz_average}%`, icon: Award, sub: "Overall test score", col: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
          { title: "Tasks Completed", val: `${stats.tasks_completed}%`, icon: CheckSquare, sub: "Checklist progress", col: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{card.val}</div>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.col}`} />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-3">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-left">
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Upload Notes", desc: "PDF, DOCX or TXT files", icon: FileUp, action: () => handleQuickAction('notes') },
            { label: "Ask AI Tutor", desc: "Instant study explanations", icon: Bot, action: () => handleQuickAction('ai-tutor') },
            { label: "Create Quiz", desc: "Generate practice tests", icon: HelpCircle, action: () => handleQuickAction('quizzes') },
            { label: "Add Task", desc: "Plan your study sessions", icon: Calendar, action: () => handleQuickAction('planner') }
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={act.action}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 dark:border-slate-800/50 dark:hover:border-indigo-950/40 bg-slate-50/50 hover:bg-indigo-50/15 dark:bg-slate-900 dark:hover:bg-indigo-950/10 text-left transition-all group focus:outline-none cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-850 shadow-sm border border-slate-200/20 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">{act.label}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{act.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Tasks, Recent Notes, Charts, Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Study Hours Graph (Recharts) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between min-h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Weekly Study Chart</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Hours spent on study focus sessions per day</p>
            </div>
            <button 
              onClick={() => onNavigate('progress')}
              className="text-xs text-indigo-500 font-bold flex items-center hover:underline focus:outline-none"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
          <div className="flex-1 w-full h-[240px]">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">No study data loaded.</div>
            )}
          </div>
        </div>

        {/* Right Side: Today's Tasks Checklist */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Today's Tasks</h3>
              <button 
                onClick={() => onNavigate('planner')}
                className="text-xs text-slate-400 hover:text-indigo-500 font-bold focus:outline-none"
              >
                Go to Planner
              </button>
            </div>

            <div className="space-y-3.5">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      task.completed 
                        ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10' 
                        : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 mt-0.5 cursor-pointer checkbox-animate"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <div className={`text-xs font-bold text-slate-800 dark:text-slate-200 truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: task.subject_details?.color || '#cbd5e1' }} 
                        />
                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                          {task.subject_details?.name || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                          {task.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No tasks set for today.
                  <button 
                    onClick={() => onNavigate('planner')}
                    className="text-indigo-500 block hover:underline mx-auto mt-2 font-bold focus:outline-none"
                  >
                    + Add first task
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Completion summary badge */}
          {tasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>CHECKLIST PROGRESS</span>
              <span className="text-indigo-600 dark:text-indigo-400">{stats.tasks_completed}% Done</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Notes View List */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Recent Notes</h3>
            <button 
              onClick={() => onNavigate('notes')}
              className="text-xs text-indigo-500 font-bold focus:outline-none"
            >
              All Notes
            </button>
          </div>

          <div className="space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map(note => (
                <div 
                  key={note.id} 
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/30 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{note.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                        <span>{note.file_size}</span>
                        <span>•</span>
                        <span 
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: note.subject_details?.color || '#6366f1' }}
                        >
                          {note.subject_details?.name || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onNavigate('notes')}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 focus:outline-none"
                    >
                      Summarize
                    </button>
                    <button 
                      onClick={() => onNavigate('ai-tutor')}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 focus:outline-none"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No study notes uploaded yet.
                <button 
                  onClick={() => onNavigate('notes')}
                  className="text-indigo-500 block hover:underline mx-auto mt-2 font-bold focus:outline-none"
                >
                  + Upload note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subject Mastery Progress Bars */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Subject Mastery</h3>
            <button 
              onClick={() => onNavigate('subjects')}
              className="text-xs text-indigo-500 font-bold focus:outline-none"
            >
              Edit Subjects
            </button>
          </div>

          <div className="space-y-4">
            {subjects.length > 0 ? (
              subjects.map(sub => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      {sub.name}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No courses added yet.
                <button 
                  onClick={() => onNavigate('subjects')}
                  className="text-indigo-500 block hover:underline mx-auto mt-2 font-bold focus:outline-none"
                >
                  + Create subject
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;

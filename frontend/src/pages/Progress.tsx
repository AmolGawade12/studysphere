import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, Clock, HelpCircle, CheckSquare, 
  Flame, TrendingUp, Calendar, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import progressService from '../services/progressService';

export const Progress: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<'7' | '30' | '90'>('7');

  // Stats State
  const [stats, setStats] = useState({
    total_study_hours: 18.5,
    quiz_average: 82,
    tasks_completed: 75,
    study_streak: 7
  });

  const [weeklyStudyTime, setWeeklyStudyTime] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await progressService.getAnalytics();
      setStats({
        total_study_hours: data.stats.total_study_hours,
        quiz_average: data.stats.quiz_average,
        tasks_completed: data.stats.tasks_completed,
        study_streak: data.stats.study_streak
      });
      setWeeklyStudyTime(data.weekly_study_time);
      setSubjectProgress(data.subject_progress);
      setQuizPerformance(data.quiz_performance);
    } catch (err) {
      showToast('Failed to load study analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRangeChange = (range: '7' | '30' | '90') => {
    setActiveRange(range);
    showToast(`Metrics range updated to last ${range} days.`, 'info');
  };

  if (loading && weeklyStudyTime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading analytics dashboard...</span>
      </div>
    );
  }

  // Reverse quiz results order so chronological is left-to-right (oldest to newest)
  const chronologicalQuizData = [...quizPerformance].reverse();

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title & Filter range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            My Academic Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Track learning velocities, subject masteries, and quiz score benchmarks
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-1 rounded-xl shadow-sm self-start sm:self-center">
          {['7', '30', '90'].map(range => (
            <button
              key={range}
              onClick={() => handleRangeChange(range as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                activeRange === range
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/30'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              {range} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics grids */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours', val: `${stats.total_study_hours}h`, desc: 'Overall session duration', icon: Clock, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Quiz Average', val: `${stats.quiz_average}%`, desc: 'MCQ test score rate', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Tasks Completed', val: `${stats.tasks_completed}%`, desc: 'Planner checkbox average', icon: CheckSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Study Streak', val: `${stats.study_streak} Days`, desc: '🔥 Active focus streak', icon: Flame, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{item.val}</div>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Study time chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Study Velocity Chart</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Focus hours registered daily</p>
          </div>
          <div className="flex-1 w-full h-[220px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStudyTime} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject progress bar grid stats */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Course Masteries</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Subject comprehension milestones</p>
          </div>
          <div className="space-y-4 flex-1 justify-center flex flex-col mt-4">
            {subjectProgress.map(s => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span>{s.progress}%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${s.progress}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Accuracy Line Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-6 rounded-3xl shadow-sm text-left flex flex-col min-h-[350px]">
        <div>
          <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Quiz Performance Trends</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Test percentage results chronologically</p>
        </div>
        <div className="flex-1 w-full h-[220px] mt-6">
          {chronologicalQuizData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chronologicalQuizData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="title" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
              No quiz scores recorded yet. Generate and complete quizzes to track accuracies.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default Progress;

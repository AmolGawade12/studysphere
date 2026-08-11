import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Play, Pause, RotateCcw, Award, 
  HelpCircle, Clock, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import subjectService from '../services/subjectService';
import progressService from '../services/progressService';
import { Modal } from '../components/Modal';

export const Timer: React.FC = () => {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modes: 'study' | 'break'
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  
  // Timer running state
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default

  const timerRef = useRef<any>(null);

  // Success Modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Daily logged stats preview
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(135); // default 2h 15m

  const fetchSubjectsAndStats = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
      
      const analytics = await progressService.getAnalytics();
      // Calculate today's logged study sessions sum in minutes
      // Since weekly study time returns hours for today, let's map hours to minutes!
      const todayHours = analytics.weekly_study_time[analytics.weekly_study_time.length - 1]?.hours || 0.0;
      setTodayStudyMinutes(Math.round(todayHours * 60));
    } catch (err) {
      console.error("Failed to load timer associations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndStats();
  }, []);

  // Timer Tick implementation
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    const minutesStudied = timerMode === 'study' ? Math.round(timeLeft === 0 ? (timerMode === 'study' ? 25 : 5) : 0) : 0;
    
    // Log study session
    if (timerMode === 'study') {
      try {
        const sessionMins = 25; // standard duration
        await progressService.logStudySession({
          subject_id: selectedSubjectId,
          duration: sessionMins,
          session_type: 'study'
        });
        
        setTodayStudyMinutes(prev => prev + sessionMins);
        setSuccessModalOpen(true);
        showToast('Focus session completed! Great job! 🎉', 'success');
      } catch (err) {
        showToast('Session logged locally, but sync failed.', 'warning');
        setSuccessModalOpen(true);
      }
    } else {
      showToast('Break session completed. Ready to focus again?', 'info');
      // Shift back to study mode automatically
      setTimerMode('study');
      setTimeLeft(25 * 60);
    }
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(timerMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const handleModeChange = (mode: 'study' | 'break') => {
    setIsActive(false);
    setTimerMode(mode);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Circular progress calculations for visual SVG circle overlay
  const maxSeconds = timerMode === 'study' ? 25 * 60 : 5 * 60;
  const strokeDashoffset = ((maxSeconds - timeLeft) / maxSeconds) * 283; // 2 * PI * r (r=45, circumference ~ 283)

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading timer modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Pomodoro Study Timer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Lock in your attention using custom focus intervals and log hours automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Circular Timer Visual Card */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="inline-flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
            <button
              onClick={() => handleModeChange('study')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                timerMode === 'study'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Focus Mode
            </button>
            <button
              onClick={() => handleModeChange('break')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                timerMode === 'break'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Break Mode
            </button>
          </div>

          {/* SVG Circular countdown container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="absolute w-full h-full transform -rotate-95" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="4"
              />
              {/* Foreground progress path */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`fill-none transition-all duration-300 stroke-indigo-600 dark:stroke-indigo-400`}
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered Numbers Text */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl font-extrabold text-slate-850 dark:text-slate-50 tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mt-1">
                {timerMode === 'study' ? 'STUDY SESSION' : 'SHORT BREAK'}
              </span>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex items-center gap-3.5 pt-2">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {isActive ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold px-6 py-3.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20 transition-all focus:outline-none cursor-pointer"
              >
                <Pause className="w-5 h-5" />
                Pause Session
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all focus:outline-none cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Timer
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Log widget stats and Subject picker configuration */}
        <div className="md:col-span-4 flex flex-col justify-between gap-6">
          
          {/* Association configurator card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 text-left flex-1">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Timer Associations</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Associated</label>
              <select
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isActive}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl disabled:opacity-50"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                <option value="">No Associated Course</option>
              </select>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                Associating logs adds hours directly to course mastery tracking metrics.
              </p>
            </div>
          </div>

          {/* Today's Stats card widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Focus Metrics Today
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Logged Today</span>
                <span className="text-lg font-bold text-slate-850 dark:text-slate-100 block mt-1">
                  {formatDuration(todayStudyMinutes)}
                </span>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Completed</span>
                <span className="text-lg font-bold text-slate-850 dark:text-slate-100 block mt-1">
                  {Math.floor(todayStudyMinutes / 25)} Session(s)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Success Congrats Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Session Completed!"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/45 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-150">Focus Session Completed! 🎉</h3>
            <p className="text-slate-450 text-xs font-semibold">Great work on locking in your attention. Keep going.</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md focus:outline-none"
            >
              Back to Timer
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default Timer;

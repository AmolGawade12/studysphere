import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Sun, Moon, Bell, Shield, LogOut, Lock, 
  Settings as SettingsIcon, Check, Loader2
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [reminders, setReminders] = useState(true);
  const [completions, setCompletions] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwsLoading, setPwsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'warning');
      return;
    }

    setPwsLoading(true);
    // Simulate API call for password changes
    setTimeout(() => {
      showToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwsLoading(false);
    }, 800);
  };

  const handleTogglePreference = (type: string) => {
    if (type === 'reminders') {
      setReminders(!reminders);
    } else if (type === 'completions') {
      setCompletions(!completions);
    } else {
      setWeeklyReport(!weeklyReport);
    }
    showToast('Preference settings saved.', 'success');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Adjust notifications, interface display modes, and manage security parameters
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Theme Configuration Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-150 flex items-center gap-2">
            <Sun className="w-4.5 h-4.5 text-indigo-500" />
            Appearance theme
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Customize how StudySphere AI is displayed on your screen. Select Light, Dark, or sync with OS mode.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50/20 border-indigo-500 text-indigo-650 dark:text-indigo-400 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Light Theme
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-950/20 border-indigo-500 text-indigo-400 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              Dark Theme
            </button>
          </div>
        </div>

        {/* 2. Notifications Config Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-150 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-indigo-500" />
            Notification Settings
          </h3>
          
          <div className="space-y-4 pt-1">
            {[
              { id: 'reminders', state: reminders, label: 'Study session reminders', desc: 'Alerts when scheduled study planner tasks are due today.' },
              { id: 'completions', state: completions, label: 'Quiz evaluations notifications', desc: 'Alerts when custom AI quizzes are successfully submitted.' },
              { id: 'report', state: weeklyReport, label: 'Weekly progress stats summary', desc: 'Digest updates summarizing study streaks and hours completed.' }
            ].map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <div className="text-left">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                    {item.label}
                  </label>
                  <span className="text-[10px] text-slate-400 leading-normal block mt-0.5">{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={() => handleTogglePreference(item.id)}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-350 focus:ring-indigo-500/20 rounded cursor-pointer checkbox-animate"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Password / Account Settings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-150 flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-indigo-500" />
            Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-850 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-850 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-855 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pwsLoading}
              className="flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none"
            >
              {pwsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Update Account Password
            </button>
          </form>
        </div>

        {/* 4. Action list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-left flex justify-between items-center">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">Disconnect Study Session</h4>
            <span className="text-[10px] text-slate-400 leading-normal block mt-0.5">Logs out of the StudySphere user workspace on this device.</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-md text-xs cursor-pointer focus:outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};
export default Settings;

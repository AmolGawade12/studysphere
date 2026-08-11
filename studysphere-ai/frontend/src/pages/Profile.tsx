import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Edit2, Save, School, GraduationCap, Calendar, Mail, CheckCircle2, Loader2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.profile?.email || user?.email || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [course, setCourse] = useState(user?.profile?.course || '');
  const [year, setYear] = useState(user?.profile?.year || '3rd Year');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email are required.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, email, college, course, year });
      showToast('Profile details updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const n = name || user?.username || 'S';
    return n.split(' ').map((p: string) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          My Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Manage course registries, academic years, and account identity
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm text-left">
        
        {/* Upper Profile Identity row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 dark:border-slate-800/85 pb-6 mb-6">
          {/* Avatar sphere */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/10">
            {getInitials()}
          </div>
          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 truncate">
                {user?.profile?.name || user?.username || 'Alex Carter'}
              </h2>
              <span className="self-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] font-extrabold border border-indigo-100/50 dark:border-transparent uppercase">
                Student Account
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">{user?.email || 'student@studysphere.ai'}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              <span>Course: <strong>{user?.profile?.course || 'Computer Science'}</strong></span>
              <span>•</span>
              <span>Year: <strong>{user?.profile?.year || '3rd Year'}</strong></span>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold px-3.5 py-2 rounded-xl text-xs border border-indigo-100/40 dark:border-indigo-900/20 focus:outline-none transition-colors cursor-pointer self-center sm:self-start"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>

        {/* View / Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                />
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course / Major</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
                />
              </div>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100 rounded-xl"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-4 rounded-xl shadow-md text-xs transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* View mode list display */
          <div className="space-y-5 text-slate-650 dark:text-slate-350">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <School className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COLLEGE</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {user?.profile?.college || 'Not set'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COURSE MAJOR</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {user?.profile?.course || 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YEAR OF STUDY</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {user?.profile?.year || 'Not set'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <Mail className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EMAIL</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {user?.profile?.email || user?.email || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default Profile;

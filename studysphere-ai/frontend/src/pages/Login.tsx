import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateToRegister, onBack }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      // Try email login or username (fallback automatically done in authService)
      await login({ email, password });
      showToast('Welcome back to StudySphere AI!', 'success');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      const detailMsg = err?.data?.error || 'Invalid credentials. If offline, use student / password123';
      setErrorMsg(detailMsg);
      showToast(detailMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
      
      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-850/80 p-8 glassmorphism">
        {/* Title Logo */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Welcome back 👋
          </h2>
          <p className="text-slate-400 text-xs">
            Sign in to access your study sphere
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Email/Username input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email or Username
            </label>
            <input
              type="text"
              placeholder="student@studysphere.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 transition-all"
            />
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs text-indigo-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Demo Helper Banner */}
        <div className="mt-5 p-3 bg-slate-50 border border-slate-100 dark:bg-slate-800/20 dark:border-slate-800/50 rounded-xl text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Demo Credentials</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Username/Email: <code className="text-indigo-600 dark:text-indigo-400">student</code> or <code className="text-indigo-600 dark:text-indigo-400">student@studysphere.ai</code>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Password: <code className="text-indigo-600 dark:text-indigo-400">password123</code>
          </div>
        </div>

        {/* Navigate to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToRegister}
            className="text-indigo-500 hover:underline font-semibold"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

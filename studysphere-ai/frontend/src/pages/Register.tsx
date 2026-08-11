import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onNavigateToLogin, onBack }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1st Year');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Register Form] Form submit triggered");
    
    // Perform validations
    const newErrors: Record<string, string> = {};

    if (username.trim() && username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters if specified.';
    }

    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!college.trim()) {
      newErrors.college = 'College/University is required.';
    }

    if (!course.trim()) {
      newErrors.course = 'Course/Major is required.';
    }

    if (!year) {
      newErrors.year = 'Year of Study is required.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.warn("[Register Form] Client validation failed:", newErrors);
      setErrorMsg('Please correct the highlighted errors.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const effectiveUsername = username.trim() || email.trim().split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    console.log("[Register Form] Submitting registration payload to authService:", {
      username: effectiveUsername,
      email: email.trim(),
      name: name.trim(),
      college: college.trim(),
      course: course.trim(),
      year
    });

    try {
      await register({
        username: effectiveUsername,
        email: email.trim(),
        password,
        name: name.trim(),
        college: college.trim(),
        course: course.trim(),
        year
      });
      console.log("[Register Form] Registration successful!");
      showToast('Account created successfully! Welcome to StudySphere 🚀', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("[Register Form] Registration submission error:", err);
      
      // Parse Django REST Framework validation errors
      if (err?.data && typeof err.data === 'object') {
        const djangoErrors: Record<string, string> = {};
        let generalError = 'Registration failed. Check inputs and try again.';
        
        Object.entries(err.data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          djangoErrors[key] = msg;
        });
        
        if (djangoErrors.non_field_errors) {
          generalError = djangoErrors.non_field_errors;
        } else if (djangoErrors.detail) {
          generalError = djangoErrors.detail;
        } else if (djangoErrors.error) {
          generalError = djangoErrors.error;
        } else if (djangoErrors.username) {
          generalError = `Username: ${djangoErrors.username}`;
        } else if (djangoErrors.email) {
          generalError = `Email: ${djangoErrors.email}`;
        } else if (djangoErrors.password) {
          generalError = `Password: ${djangoErrors.password}`;
        }
        
        setErrors(djangoErrors);
        setErrorMsg(generalError);
      } else {
        setErrorMsg(err?.data?.error || err?.message || 'Unable to connect to Django REST API server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
      
      {/* Back button */}
      <button 
        type="button"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-850/80 p-8 glassmorphism my-8">
        {/* Title Logo */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Create your account 🚀
          </h2>
          <p className="text-slate-400 text-xs">
            Start studying smarter today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Username <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="alex_carter"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.username 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.username && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.username}
                </span>
              )}
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="student@studysphere.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.email 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.email && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          {/* Full Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Carter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                errors.name 
                  ? 'border-rose-500 focus:border-rose-500' 
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.name && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                College / University
              </label>
              <input
                type="text"
                placeholder="Tech University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.college 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.college && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.college}
                </span>
              )}
            </div>

            {/* Course input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Course / Major
              </label>
              <input
                type="text"
                placeholder="Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.course 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.course && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.course}
                </span>
              )}
            </div>
          </div>

          {/* Year selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Year of Study
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                errors.year 
                  ? 'border-rose-500 focus:border-rose-500' 
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
              }`}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
            {errors.year && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.year}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.password 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 dark:text-slate-100 transition-all ${
                  errors.confirmPassword 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.confirmPassword && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.confirmPassword}
                </span>
              )}
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Navigate to Login */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={onNavigateToLogin}
            className="text-indigo-500 hover:underline font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default Register;

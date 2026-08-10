import React from 'react';
import { 
  Bot, FileText, HelpCircle, Calendar, Timer, 
  BarChart3, CheckCircle2, ChevronRight, ArrowRight,
  TrendingUp, Sparkles, BookOpen, Clock, Target, Star
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

interface LandingProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onNavigate: (page: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenLogin, onOpenRegister, onNavigate }) => {
  const features = [
    {
      icon: Bot,
      title: "AI Tutor",
      desc: "Get instant explanations and personalized study assistance for coding, DSA, science, and math concepts.",
      color: "from-violet-500 to-indigo-500",
      glow: "shadow-violet-500/10"
    },
    {
      icon: FileText,
      title: "Smart Notes",
      desc: "Upload notes in PDF, DOCX, or TXT formats and let AI extract text and generate key study takeaways.",
      color: "from-blue-500 to-indigo-500",
      glow: "shadow-blue-500/10"
    },
    {
      icon: HelpCircle,
      title: "AI Quiz",
      desc: "Automatically generate practice multiple-choice questions from your notes to review and retain information.",
      color: "from-purple-500 to-indigo-500",
      glow: "shadow-purple-500/10"
    },
    {
      icon: Calendar,
      title: "Study Planner",
      desc: "Organize tasks by priority and duration. Check them off to see your completion rates increase.",
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/10"
    },
    {
      icon: Timer,
      title: "Study Timer",
      desc: "Set Pomodoro focus and break intervals to build consistent habits and automatically log hours to subjects.",
      color: "from-indigo-500 to-purple-500",
      glow: "shadow-indigo-500/10"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      desc: "Track weekly study hours, quiz accuracy, completion streaks, and watch your subject mastery grow.",
      color: "from-violet-500 to-purple-500",
      glow: "shadow-violet-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Sticky Top Navbar */}
      <Navbar 
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient decor */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 animate-slide-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-gen Student Companion App</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Your <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">AI-powered</span> study companion.
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Organize your notes, learn with AI, practice smarter quizzes, and track your progress — all in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2 w-full sm:w-auto">
                <button 
                  onClick={onOpenRegister}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 sm:flex-initial border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Explore Features
                </button>
              </div>
            </div>

            {/* Right Dashboard Visualization Column */}
            <div className="lg:col-span-5 relative flex justify-center animate-fade-in lg:mt-0">
              {/* Dashboard Preview Visual */}
              <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-2xl overflow-hidden glassmorphism flex flex-col p-5">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    STUDYSPHERE DASHBOARD
                  </span>
                </div>

                {/* Grid of stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 text-left">
                    <div className="text-xs text-slate-400 font-medium">Study Streak</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">🔥 7 Days</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 text-left">
                    <div className="text-xs text-slate-400 font-medium">Quiz Avg</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">🏆 85%</div>
                  </div>
                </div>

                {/* Floating Widget Card - AI tutor bubble */}
                <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/45 dark:bg-indigo-950/20 text-left mb-4 shadow-sm flex items-start gap-3">
                  <Bot className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">AI Study Tutor</div>
                    <div className="text-[11px] text-indigo-900/80 dark:text-indigo-300 mt-0.5">
                      Polymorphism allows subclasses to define custom method overrides...
                    </div>
                  </div>
                </div>

                {/* Progress bar widgets */}
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Java Programming Mastery</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-[75%]" />
                  </div>
                </div>

                {/* Small overlay items floating around */}
                <div className="absolute -top-5 -right-5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-lg text-slate-800 dark:text-slate-100 flex items-center gap-1.5 animate-float">
                  <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold">5.0 Star</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Social Proof Features Overview */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Everything you need to study smarter.
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'AI Tutor', desc: 'Instant chat answers' },
              { label: 'Smart Notes', desc: 'Auto text extraction' },
              { label: 'Smart Quizzes', desc: 'Personalized practice' },
              { label: 'Progress Tracking', desc: 'Metrics & analytics' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="font-bold text-slate-800 dark:text-slate-200">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Cards Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Engineered for high performance learning.
          </h2>
          <p className="text-slate-400 text-sm">
            Tackle difficult semesters with integrated features that focus on organization, comprehension, and execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl dark:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  {/* Icon Shell */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md ${feat.glow}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-indigo-500 font-bold text-xs pt-4 group-hover:translate-x-1.5 transition-transform duration-200 cursor-pointer">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Four steps to academic excellence.
            </h2>
            <p className="text-slate-400 text-sm">
              StudySphere AI transforms how you acquire, practice, and track information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Steps */}
            {[
              { num: '01', title: 'Create account', desc: 'Set up your courses, target subjects and details.' },
              { num: '02', title: 'Add study notes', desc: 'Upload documents or write notes. AI digests text.' },
              { num: '03', title: 'Learn & practice', desc: 'Interact with AI tutor and generate custom quizzes.' },
              { num: '04', title: 'Track progress', desc: 'Visualize focus schedules, accuracy, and streaks.' }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center group">
                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-lg mb-4 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-xs px-4 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Split Section */}
      <section id="benefits" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-[450px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl glassmorphism text-left">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Target Grade Mastery Metrics
              </h3>
              {/* Graphic element */}
              <div className="space-y-4">
                {[
                  { subject: 'Computer Architecture', hrs: '24.5 hrs', pct: 90, color: 'bg-indigo-500' },
                  { subject: 'Algorithms & Structures', hrs: '18.2 hrs', pct: 75, color: 'bg-purple-500' },
                  { subject: 'Database Management', hrs: '12.0 hrs', pct: 60, color: 'bg-blue-500' }
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>{s.subject} ({s.hrs})</span>
                      <span>{s.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 text-center">
                ✓ Student study schedules synchronized automatically.
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 text-left space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Everything your study routine needs.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Consolidating notes, timers, planners, and tutors under one hood prevents context-switching fatigue and maximizes cognitive focus.
            </p>

            <ul className="space-y-3.5">
              {[
                "Organize your learning by course subjects.",
                "Understand difficult concepts instantly with AI Tutor explanations.",
                "Practice with custom generated AI Multiple Choice Quizzes.",
                "Build consistent study habits using Pomodoro tracking timers.",
                "Track your grade improvement and metrics over time."
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Call To Action Card Section */}
      <section id="cta" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
          {/* Sparkles background décor */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent opacity-60 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Ready to study smarter?
            </h2>
            <p className="text-indigo-100/90 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Join thousands of students building better study habits, understanding topics faster, and improving academic grades today.
            </p>
            <div className="pt-4 flex justify-center">
              <button 
                onClick={onOpenRegister}
                className="bg-white hover:bg-slate-50 text-indigo-700 font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
              >
                Start Studying Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-2 text-left space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                SS
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-slate-200">
                StudySphere AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Next-generation AI student dashboard supporting course organization, notes summary, quizzes generator, timers, and progress stats.
            </p>
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} StudySphere AI.
            </div>
          </div>

          {/* Product links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Product</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li><a href="#" className="hover:text-indigo-500">Features</a></li>
              <li><a href="#" className="hover:text-indigo-500">AI Tutor</a></li>
              <li><a href="#" className="hover:text-indigo-500">Quizzes</a></li>
              <li><a href="#" className="hover:text-indigo-500">Timer log</a></li>
            </ul>
          </div>

          {/* Company links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Company</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li><a href="#" className="hover:text-indigo-500">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-500">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-500">Contact Support</a></li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Legal</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li><a href="#" className="hover:text-indigo-500">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-500">Terms of Service</a></li>
            </ul>
          </div>

          {/* Social links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Social</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-indigo-500">GitHub</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-indigo-500">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

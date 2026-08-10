import React, { useState, useEffect } from 'react';
import { BookOpen, LogIn, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenLogin, onOpenRegister }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // Check if we are on landing, otherwise navigate to landing first
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="w-5. h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              StudySphere
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 ml-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-900/30">
              AI
            </span>
          </div>
        </div>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#features" 
            onClick={(e) => handleLinkClick(e, 'features')}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleLinkClick(e, 'how-it-works')}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
          >
            How It Works
          </a>
          <a 
            href="#benefits" 
            onClick={(e) => handleLinkClick(e, 'benefits')}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
          >
            Benefits
          </a>
          <a 
            href="#cta" 
            onClick={(e) => handleLinkClick(e, 'cta')}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
          >
            About
          </a>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-250"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button 
            onClick={onOpenRegister}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg flex flex-col gap-4 animate-fade-in">
          <a 
            href="#features" 
            onClick={(e) => handleLinkClick(e, 'features')}
            className="text-base font-medium text-slate-600 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800/50"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleLinkClick(e, 'how-it-works')}
            className="text-base font-medium text-slate-600 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800/50"
          >
            How It Works
          </a>
          <a 
            href="#benefits" 
            onClick={(e) => handleLinkClick(e, 'benefits')}
            className="text-base font-medium text-slate-600 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800/50"
          >
            Benefits
          </a>
          <a 
            href="#cta" 
            onClick={(e) => handleLinkClick(e, 'cta')}
            className="text-base font-medium text-slate-600 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800/50"
          >
            About
          </a>
          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
              className="flex-1 border border-slate-300 dark:border-slate-700 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl text-sm font-medium text-white shadow-md shadow-indigo-600/10 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

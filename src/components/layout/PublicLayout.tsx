import { Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  FileText, 
  Mic2, 
  Briefcase, 
  Compass, 
  GraduationCap, 
  Sparkles,
  PanelsTopLeft,
  Globe,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { BackButton } from '../ui/BackButton';
import { useUserStore } from '../../store';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);
  const { user } = useUserStore();

  const platformItems = [
    { icon: <FileText size={16} />, label: 'Resume Analyzer', path: '/app/resume', desc: 'AI-powered resume optimization', restricted: true },
    { icon: <Sparkles size={16} />, label: 'Resume Maker', path: '/app/resume-maker', desc: 'Craft professional resumes from scratch', restricted: true },
    { icon: <Mic2 size={16} />, label: 'Mock Interview', path: '/app/interview', desc: 'Real-time interview practice', restricted: true },
    { icon: <Compass size={16} />, label: 'Career Path', path: '/app/career', desc: 'Discover your professional route', restricted: true },
    { icon: <GraduationCap size={16} />, label: 'Skills Lab', path: '/app/skills', desc: 'Master in-demand skills', restricted: true },
    { icon: <Sparkles size={16} />, label: 'AI Roadmap', path: '/app/roadmap', desc: 'Step-by-step career dominance', restricted: true },
    { icon: <PanelsTopLeft size={16} />, label: 'Portfolio Builder', path: '/app/portfolio', desc: 'Create stunning portfolios', restricted: true },
    { icon: <Globe size={16} />, label: 'Company Insights', path: '/app/insights', desc: 'In-depth market & company data', restricted: true },
    { icon: <Users size={16} />, label: 'Networking', path: '/app/networking', desc: 'Connect with industry mentors', restricted: true },
  ];

  return (
    <div className="h-screen flex flex-col bg-mesh overflow-hidden">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BackButton />
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tighter text-text-primary flex items-center gap-2">
                <span className="px-2 py-1 bg-accent rounded text-xs text-white">RKS</span>
                <span className="drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]">HIREIQ</span>
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <Link to="/" className="hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">Home</Link>
            
            <div 
              className="relative group"
              onMouseEnter={() => setIsPlatformsOpen(true)}
              onMouseLeave={() => setIsPlatformsOpen(false)}
            >
              <button type="button" className="flex items-center gap-1 hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">
                Platforms <ChevronDown size={12} className={`transition-transform duration-200 ${isPlatformsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isPlatformsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] p-4 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] grid grid-cols-2 gap-2"
                  >
                    <div className="col-span-2 px-3 py-1 mb-2">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent opacity-80">AI Professional Suite</div>
                    </div>
                    {platformItems.map((item) => (
                      <Link 
                        key={item.path}
                        to={item.restricted && !user ? "/login" : item.path}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item relative overflow-hidden"
                      >
                        {!user && item.restricted && (
                          <div className="absolute top-2 right-2">
                             <div className="px-1.5 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[8px] font-black uppercase tracking-widest">Login</div>
                          </div>
                        )}
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover/item:bg-accent group-hover/item:text-white transition-all">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] text-text-muted leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">About</Link>
            <Link to="/pricing" className="hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">Pricing</Link>
            <Link to="/contact" className="hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">Contact</Link>
            <ThemeToggle />
            {user ? (
              <Link to="/app/dashboard" className="text-white bg-accent px-6 py-2 rounded-full font-bold hover:bg-accent/80 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] text-[10px] uppercase tracking-widest">
                Dashboard
              </Link>
            ) : (
              <Link to="/register" className="text-white bg-accent px-6 py-2 rounded-full font-bold hover:bg-accent/80 transition-all shadow-[0_0_20_rgba(99,102,241,0.2)] text-[10px] uppercase tracking-widest">
                Get Started
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-bg-secondary border-b border-white/5 p-6 md:hidden flex flex-col gap-4 text-center"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Platforms</div>
              <div className="grid grid-cols-1 gap-2">
                {platformItems.map(item => (
                  <Link 
                    key={item.path} 
                    to={item.restricted && !user ? "/login" : item.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-hover border border-border text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-accent">{item.icon}</div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    {!user && item.restricted && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent/60">Member Only</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
            {user ? (
              <Link to="/app/dashboard" onClick={() => setIsMenuOpen(false)} className="bg-accent text-white py-3 rounded-xl font-bold">Dashboard</Link>
            ) : (
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-accent text-white py-3 rounded-xl font-bold">Get Started</Link>
            )}
          </motion.div>
        )}
      </nav>

      <main className="flex-grow pt-24 overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex flex-col">
          <div className="flex-grow">
            <Outlet />
          </div>

          <footer className="glass border-t border-border py-12 px-6 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-2">
                <h2 className="text-2xl font-bold mb-4">RKS</h2>
                <p className="text-text-secondary max-w-sm">
                  Empowering the next generation of professionals with AI-driven career tools and industry insights.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white">Platform</h3>
                <div className="flex flex-col gap-2 text-text-secondary">
                  <Link to="/pricing">Pricing Plans</Link>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                  <Link to="/app/resume">Resume Analyzer</Link>
                  <Link to="/app/interview">Mock Interview</Link>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white">Company</h3>
                <div className="flex flex-col gap-2 text-text-secondary">
                  <Link to="/about">About Us</Link>
                  <Link to="/contact">Contact</Link>
                  <Link to="/privacy">Privacy Policy</Link>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-text-muted text-sm">
              © {new Date().getFullYear()} RKS. All rights reserved.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

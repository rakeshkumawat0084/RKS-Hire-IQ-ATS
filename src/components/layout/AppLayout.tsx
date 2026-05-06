import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Mic2, 
  Briefcase, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Compass,
  GraduationCap,
  Sparkles,
  PanelsTopLeft,
  Globe,
  Users,
  Menu,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useState, useEffect, type FormEvent } from 'react';
import { useUserStore } from '../../store';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationPanel } from '../ui/NotificationPanel';
import { BackButton } from '../ui/BackButton';

export default function AppLayout() {
  const { user, isAdmin, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(() => localStorage.getItem('hireiq-sound') !== 'off');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    localStorage.setItem('hireiq-sound', next ? 'on' : 'off');
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/app/insights?search=${encodeURIComponent(query)}`);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/app/dashboard' },
    { icon: <Globe size={18} />, label: 'Main Site', path: '/' },
  ];

  const platformItems = [
    { icon: <FileText size={18} />, label: 'Resume Analyzer', path: '/app/resume' },
    { icon: <Sparkles size={18} />, label: 'Resume Maker', path: '/app/resume-maker' },
    { icon: <Mic2 size={18} />, label: 'Mock Interview', path: '/app/interview' },
    { icon: <Compass size={18} />, label: 'Career Path', path: '/app/career' },
    { icon: <GraduationCap size={18} />, label: 'Skills Lab', path: '/app/skills' },
    { icon: <Sparkles size={18} />, label: 'AI Roadmap', path: '/app/roadmap' },
    { icon: <PanelsTopLeft size={18} />, label: 'Portfolio Builder', path: '/app/portfolio' },
    { icon: <Globe size={18} />, label: 'Company Insights', path: '/app/insights' },
    { icon: <Users size={18} />, label: 'Networking', path: '/app/networking' },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium ${
      isActive 
        ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_1px_0_0_rgba(99,102,241,0.2)]' 
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }`;

  const getPlatformNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-sm font-medium ${
      isActive 
        ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_1px_0_0_rgba(99,102,241,0.2)] pl-6' 
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary pl-6'
    }`;

  const SidebarContent = () => (
    <>
      <div className="p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/15 blur-2xl rounded-full" />
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <h1 className="text-2xl font-black tracking-tighter text-text-primary flex items-center gap-2">
            <span className="premium-ai-pulse px-2 py-1 bg-gradient-to-br from-accent to-cyan-400 rounded-lg text-xs text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)] rotate-[-4deg]">RKS</span>
            <span className="drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]">HIREIQ</span>
          </h1>
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mt-2 font-bold">Career Coach OS</p>
      </div>

      <nav className="flex-1 min-h-0 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={getNavLinkClass}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <button 
            onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}
            aria-expanded={isPlatformsOpen}
            className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-accent" />
              <span>Platforms</span>
            </div>
            <motion.div
              animate={{ rotate: isPlatformsOpen ? 180 : 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <ChevronDown size={12} />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{ height: isPlatformsOpen ? 'auto' : 0, opacity: isPlatformsOpen ? 1 : 0 }}
            className="overflow-hidden space-y-1 mt-1"
          >
            {platformItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={getPlatformNavLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <div className={isActive ? 'text-accent' : 'text-text-muted'}>
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-platform-dot"
                        className="w-1 h-1 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </motion.div>
        </div>

        <NavLink
          to="/app/profile"
          className={getNavLinkClass}
        >
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="p-6 mt-auto space-y-2 shrink-0">
        <div className="career-coach-card p-4 rounded-2xl border border-border text-center mb-4">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-accent via-cyan-400 to-emerald-400 shadow-[0_18px_45px_rgba(99,102,241,0.25)] flex items-center justify-center text-white rotate-3">
            <Briefcase size={20} />
          </div>
          <div className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Pro Account</div>
          <div className="text-text-primary font-bold text-sm">Active Plan</div>
          <Link 
            to="/app/settings"
            className="mt-3 block w-full bg-accent/10 border border-accent/20 text-accent text-xs py-2 rounded-lg hover:bg-accent/20 transition-colors"
          >
            Settings
          </Link>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:text-white hover:bg-red-500/80 hover:border-red-500/20 active:scale-95 transition-all text-xs font-black uppercase tracking-widest group/logout"
        >
          <LogOut size={14} className="group-hover/logout:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-bg-primary text-text-primary font-sans flex overflow-hidden app-career-shell premium-motion-scope">
      <div className="premium-ambient-layer" aria-hidden="true" />
      {/* Sidebar for Desktop */}
      <aside className="w-64 h-full bg-bg-secondary/90 backdrop-blur-2xl border-r border-border flex flex-col fixed left-0 top-0 z-40 hidden lg:flex" aria-label="Sidebar Navigation">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-bg-secondary z-[60] lg:hidden border-r border-border flex flex-col"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={24} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-transparent lg:ml-64 h-screen relative">
        {/* HEADER */}
        <header className="h-16 md:h-20 border-b border-border flex items-center justify-between px-4 md:px-8 bg-bg-primary/72 backdrop-blur-2xl z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-accent transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <BackButton />
              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-bg-card px-4 py-2 rounded-full border border-border w-64 lg:w-96 group focus-within:border-accent/40 transition-all">
                <Search className="w-4 h-4 text-text-muted group-focus-within:text-accent" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search companies, roles, prep..." 
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 text-text-primary w-full outline-none placeholder:text-text-muted"
                />
              </form>
            </div>
            <Link to="/" className="lg:hidden">
               <span className="px-2 py-1 bg-accent rounded text-[10px] text-white font-black">RKS</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl glass hover:bg-bg-hover transition-colors flex items-center justify-center border-border"
              aria-label={isSoundOn ? 'Turn sound off' : 'Turn sound on'}
            >
              {isSoundOn ? <Volume2 size={18} className="text-accent" /> : <VolumeX size={18} className="text-text-muted" />}
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative cursor-pointer hover:scale-110 transition-transform outline-none p-1"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-text-secondary hover:text-text-primary" />
              <span className="premium-ai-pulse absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-bg-primary"></span>
            </button>
            
            <button
              onClick={() => navigate('/app/profile')}
              className="flex items-center gap-3 bg-bg-card pl-1 md:pl-2 pr-3 md:pr-4 py-1 md:py-1.5 rounded-full border border-border hover:border-accent/20 transition-colors cursor-pointer group"
              aria-label="Open profile"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-accent to-pink-500 flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-lg shadow-accent/20">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="text-xs md:text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors hidden sm:block">
                {user?.email?.split('@')[0].substring(0, 10) || 'User'}
              </span>
            </button>
          </div>
        </header>

        {/* SCROLL CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col relative">
          <div className="pointer-events-none absolute inset-0 career-coach-bg" />
          <div key={location.pathname} className="flex-1 motion-page-enter">
            <Outlet />
          </div>
          
          <footer className="mt-32 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-text-muted text-[10px] md:text-xs pb-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded font-black text-[9px] border border-accent/20 tracking-tighter">RKS</span>
              <p>© {new Date().getFullYear()} RKS. v1.0.4 • Career coach experience.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 uppercase font-bold tracking-widest text-[9px]">
              <Link to="/app/resume" className="hover:text-text-primary transition-colors">Resume Analyzer</Link>
              <Link to="/app/interview" className="hover:text-text-primary transition-colors">Mock Interview</Link>
              <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
              <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            </div>
          </footer>
        </div>

        {/* MOBILE NAV (Bottom) */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-bg-card/80 backdrop-blur-xl border border-border rounded-2xl flex items-center justify-around px-4 shadow-2xl z-50">
          {[navItems[0], platformItems[3], platformItems[4], platformItems[6], platformItems[7]].map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `p-2 rounded-xl transition-all ${isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {item.icon}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="text-accent-soft p-2" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </nav>
      </main>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}

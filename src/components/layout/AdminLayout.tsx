import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Mail, 
  Settings, 
  LogOut,
  Bell,
  ShieldCheck,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationPanel } from '../ui/NotificationPanel';
import { BackButton } from '../ui/BackButton';

export default function AdminLayout() {
  const { logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Zap size={20} />, label: 'Leads', path: '/admin/leads' },
    { icon: <MessageSquare size={20} />, label: 'Contacts', path: '/admin/contacts' },
    { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
    { icon: <Mail size={20} />, label: 'Email Center', path: '/admin/replies' },
  ];

  const SidebarContent = () => (
    <>
      <Link to="/" className="text-xl sm:text-2xl font-bold mb-6 sm:mb-12 flex items-center gap-2 group text-text-primary" aria-label="Home">
        <span className="hidden sm:inline">RKS</span><span className="sm:hidden">RK</span> <span className="text-xs bg-accent px-2 py-0.5 rounded text-white font-black group-hover:scale-110 transition-transform">ADMIN</span>
      </Link>

      <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all relative group text-sm sm:text-base ${
                isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`absolute left-0 w-1 bg-accent transition-all duration-300 rounded-r-full ${isActive ? 'h-6' : 'h-0 group-hover:h-4'}`}></div>
                <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-accent group-hover:text-accent'}`}>{item.icon}</div>
                <span className={`${isActive ? 'font-bold' : 'font-medium'} truncate`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 sm:pt-6 border-t border-border space-y-2">
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => 
            `flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base ${
              isActive 
                ? 'bg-bg-hover text-text-primary shadow-lg shadow-black/5' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={20} className="flex-shrink-0" />
              <span className={`${isActive ? 'font-bold' : 'font-medium'} truncate`}>Settings</span>
            </>
          )}
        </NavLink>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-accent/10 transition-all text-accent-soft text-left text-sm sm:text-base"
          aria-label="Logout"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-bg-secondary border-r border-border flex-col p-6 fixed h-full z-40 transition-all duration-300">
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
              className="fixed inset-y-0 left-0 w-80 bg-bg-secondary p-6 z-[60] lg:hidden border-r border-border flex flex-col"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden lg:ml-72 transition-all duration-300">
        <header className="h-16 md:h-20 glass border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-accent outline-none"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <BackButton />
            <div className="hidden sm:flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
               <span className="text-[10px] md:text-sm font-bold text-text-secondary tracking-widest uppercase truncate max-w-[120px] md:max-w-none">System Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <ThemeToggle />
            <div className="hidden xs:flex items-center gap-2 px-3 py-1 bg-bg-secondary rounded-full border border-border">
               <ShieldCheck size={14} className="text-success" />
               <span className="text-[10px] font-bold text-text-primary uppercase">ROOT</span>
            </div>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="text-text-secondary hover:text-accent transition-colors relative outline-none p-2"
              aria-label="View notifications"
            >
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-bg-secondary"></span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-10 flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}

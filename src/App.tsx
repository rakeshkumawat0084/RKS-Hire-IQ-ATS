import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import Pricing from './pages/public/Pricing';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import UserDashboard from './pages/user/Dashboard';
import ResumeAnalyzer from './pages/user/ResumeAnalyzer';
import ResumeMaker from './pages/user/ResumeMaker';
import MockInterview from './pages/user/MockInterview';
import UserProfile from './pages/user/Profile';
import UserHistory from './pages/user/History';
import CareerPath from './pages/user/CareerPath';
import SkillsLab from './pages/user/SkillsLab';
import SubjectLab from './pages/user/SubjectLab';
import AIRoadmap from './pages/user/AIRoadmap';
import PortfolioBuilder from './pages/user/PortfolioBuilder';
import CompanyInsights from './pages/user/CompanyInsights';
import Networking from './pages/user/Networking';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLeads from './pages/admin/Leads';
import AdminUsers from './pages/admin/Users';
import AdminContacts from './pages/admin/Contacts';
import AdminEmailCenter from './pages/admin/EmailCenter';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import { useUserStore } from './store';

import UserSettings from './pages/user/Settings';
import AdminSettings from './pages/admin/Settings';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isAdmin } = useUserStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/app/dashboard" replace />;
  
  return <>{children}</>;
}

function RouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { user } = useUserStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<RouteWrapper><Home /></RouteWrapper>} />
          <Route path="/contact" element={<RouteWrapper><Contact /></RouteWrapper>} />
          <Route path="/about" element={<RouteWrapper><About /></RouteWrapper>} />
          <Route path="/pricing" element={<RouteWrapper><Pricing /></RouteWrapper>} />
          <Route path="/privacy" element={<RouteWrapper><PrivacyPolicy /></RouteWrapper>} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<RouteWrapper><Login /></RouteWrapper>} />
        <Route path="/register" element={<RouteWrapper><Register /></RouteWrapper>} />
        <Route path="/forgot-password" element={<RouteWrapper><ForgotPassword /></RouteWrapper>} />
        <Route path="/reset-password/:token" element={<RouteWrapper><ResetPassword /></RouteWrapper>} />

        {/* User Protected Routes */ }
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RouteWrapper><UserDashboard /></RouteWrapper>} />
          <Route path="resume" element={<RouteWrapper><ResumeAnalyzer /></RouteWrapper>} />
          <Route path="resume-maker" element={<RouteWrapper><ResumeMaker /></RouteWrapper>} />
          <Route path="interview" element={<RouteWrapper><MockInterview /></RouteWrapper>} />
          <Route path="interview/:id" element={<RouteWrapper><MockInterview /></RouteWrapper>} />
          <Route path="history" element={<RouteWrapper><UserHistory /></RouteWrapper>} />
          <Route path="career" element={<RouteWrapper><CareerPath /></RouteWrapper>} />
          <Route path="skills" element={<RouteWrapper><SkillsLab /></RouteWrapper>} />
          <Route path="lab/:subjectName" element={<RouteWrapper><SubjectLab /></RouteWrapper>} />
          <Route path="roadmap" element={<RouteWrapper><AIRoadmap /></RouteWrapper>} />
          <Route path="portfolio" element={<RouteWrapper><PortfolioBuilder /></RouteWrapper>} />
          <Route path="insights" element={<RouteWrapper><CompanyInsights /></RouteWrapper>} />
          <Route path="networking" element={<RouteWrapper><Networking /></RouteWrapper>} />
          <Route path="profile" element={<RouteWrapper><UserProfile /></RouteWrapper>} />
          <Route path="settings" element={<RouteWrapper><UserSettings /></RouteWrapper>} />
          <Route index element={<Navigate to="/app/dashboard" replace />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RouteWrapper><AdminDashboard /></RouteWrapper>} />
          <Route path="leads" element={<RouteWrapper><AdminLeads /></RouteWrapper>} />
          <Route path="contacts" element={<RouteWrapper><AdminContacts /></RouteWrapper>} />
          <Route path="users" element={<RouteWrapper><AdminUsers /></RouteWrapper>} />
          <Route path="replies" element={<RouteWrapper><AdminEmailCenter /></RouteWrapper>} />
          <Route path="settings" element={<RouteWrapper><AdminSettings /></RouteWrapper>} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 - Page Not Found</div>} />
      </Routes>
    </AnimatePresence>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button if we are on the home page or auth pages
  const hideOnPaths = ['/', '/login', '/signup', '/register'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-card hover:bg-bg-hover border border-border text-text-secondary hover:text-text-primary transition-all text-xs font-bold group"
      aria-label="Go back"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>Back</span>
    </motion.button>
  );
};

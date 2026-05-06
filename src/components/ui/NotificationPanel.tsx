import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Resume Analyzed',
    message: 'Your resume has been successfully analyzed with a score of 85%.',
    type: 'success',
    time: '2 mins ago',
    read: false,
  },
  {
    id: '2',
    title: 'Career Path Generated',
    message: 'Your new AI career path for Software Engineering is ready.',
    type: 'info',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Interview Reminder',
    message: 'Your mock interview is scheduled for tomorrow at 10 AM.',
    type: 'info',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    title: 'System Update',
    message: 'We\'ve added new interactive practice labs to the Skills Lab.',
    type: 'warning',
    time: 'Yesterday',
    read: true,
  },
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-bg-secondary border-l border-white/10 shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Bell size={20} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    notif.read 
                      ? 'bg-transparent border-white/5 opacity-60' 
                      : 'bg-white/5 border-white/10 hover:border-accent/40'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {notif.type === 'success' && <CheckCircle size={18} className="text-success" />}
                      {notif.type === 'info' && <Info size={18} className="text-accent" />}
                      {notif.type === 'warning' && <AlertTriangle size={18} className="text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-white group-hover:text-accent transition-colors">
                          {notif.title}
                        </h4>
                        <span className="flex items-center gap-1 text-[10px] text-text-muted font-medium">
                          <Clock size={10} /> {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/5">
              <button
                onClick={() => setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

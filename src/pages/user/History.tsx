import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Mic2, 
  Briefcase, 
  Clock, 
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_HISTORY = [
  { id: 1, title: 'Resume Analyzed', description: 'Advanced AI Resume Scan', date: 'Oct 24, 2023', time: '2:30 PM', type: 'resume', status: '85%' },
  { id: 2, title: 'Interview Completed', description: 'Software Engineer Mock Session', date: 'Oct 23, 2023', time: '11:00 AM', type: 'interview', status: '9.2/10' },
  { id: 3, title: 'Job Application', description: 'Senior Frontend Developer at Stripe', date: 'Oct 22, 2023', time: '4:15 PM', type: 'job', status: 'Sent' },
];

export default function UserHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const localHistory = JSON.parse(localStorage.getItem('rks-activity-history') || '[]');
    // Adjust local history items for consistency
    const formattedLocal = localHistory.map((item: any) => ({
      ...item,
      title: item.title || (item.type === 'interview' ? 'Interview Completed' : 'Activity'),
      description: item.description || (item.type === 'interview' ? `${item.role} Mock Session` : 'Details updated')
    }));
    
    setHistory([...formattedLocal, ...MOCK_HISTORY]);
  }, []);

  const handleDelete = (id: number | string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    
    // Also update localStorage
    const localHistory = JSON.parse(localStorage.getItem('rks-activity-history') || '[]');
    const newLocal = localHistory.filter((item: any) => item.id !== id);
    localStorage.setItem('rks-activity-history', JSON.stringify(newLocal));
  };

  const exportHistory = () => {
    const rows = filteredHistory.map((item) => ({
      title: item.title,
      description: item.description,
      date: item.date,
      time: item.time,
      status: item.status,
    }));
    const header = ['Title', 'Description', 'Date', 'Time', 'Status'];
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [row.title, row.description, row.date, row.time, row.status]
          .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hireiq-activity-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/app/dashboard')}
          className="p-2 hover:bg-white/5 rounded-xl transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
          <p className="text-text-secondary mt-1">Manage and review your past career activities.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-card border border-white/5 rounded-xl md:rounded-2xl pl-12 pr-4 py-3.5 md:py-3 outline-none focus:border-accent/50 transition-all text-sm"
          />
        </div>
        <button
          onClick={exportHistory}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95 shadow-sm"
        >
          <Filter size={18} />
          Export Results
        </button>
      </div>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Activity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Result</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((item, i) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        {item.type === 'resume' && <FileText size={18} className="text-accent" />}
                        {item.type === 'interview' && <Mic2 size={18} className="text-green-500" />}
                        {item.type === 'job' && <Briefcase size={18} className="text-yellow-500" />}
                        {item.type === 'profile' && <Clock size={18} className="text-purple-500" />}
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-xs text-text-muted">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-medium text-white">{item.date}</div>
                    <div className="text-xs text-text-muted">{item.time}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-wider">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredHistory.length === 0 && (
          <div className="py-20 text-center">
            <Clock size={48} className="mx-auto mb-4 text-text-muted opacity-20" />
            <p className="text-text-muted italic">No activities found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

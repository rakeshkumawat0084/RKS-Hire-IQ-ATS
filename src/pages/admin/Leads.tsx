import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Reply,
  X,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/admin/leads');
      setLeads(response.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status });
      setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/admin/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
      alert('Lead deleted successfully');
    } catch (err: any) {
      console.error("Failed to delete lead", err);
      alert(err.response?.data?.error || 'Failed to delete lead');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !replyingTo) return;

    setSendingReply(true);
    try {
      await api.post(`/admin/leads/${replyingTo._id}/reply`, { message: replyMessage });
      setLeads(leads.map(l => 
        l._id === replyingTo._id 
          ? { ...l, replyMessage, repliedAt: new Date(), status: 'contacted' } 
          : l
      ));
      setReplyingTo(null);
      setReplyMessage('');
      alert('Reply sent successfully!');
    } catch (err) {
      console.error("Failed to send reply", err);
      alert('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredLeads = leads
    .filter(l => 
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortNewestFirst ? bTime - aTime : aTime - bTime;
    });

  const exportCSV = () => {
    if (filteredLeads.length === 0) return alert('No data to export');
    
    const headers = ["Name", "Email", "Phone", "Company", "Status", "Date"];
    const csvData = filteredLeads.map(l => [
      l.name,
      l.email,
      l.phone || '',
      l.company || '',
      l.status,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + csvData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rks_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* Background Glows */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-500/5 blur-[130px] rounded-full pointer-events-none"></div>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Lead Registry</h1>
          <p className="text-text-secondary text-sm font-bold uppercase text-[10px] tracking-widest opacity-60">Global inquiry tracking & communications</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <button 
             onClick={exportCSV}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-bg-secondary/40 backdrop-blur-md text-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-bg-hover transition-all active:scale-95 shadow-lg"
           >
             <Download size={16} /> Export CSV
           </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between card-modern p-4 rounded-2xl relative z-10 border border-white/5">
        <div className="relative w-full lg:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search lead matrix..."
            className="w-full bg-bg-primary/50 border border-white/5 text-text-primary pl-12 pr-4 py-3.5 rounded-xl outline-none input-glow font-bold italic text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setSortNewestFirst((value) => !value)}
            className="w-full sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-bg-primary/50 text-text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-white/5 hover:bg-bg-hover transition-all group"
          >
            <Filter size={16} className="group-hover:rotate-180 transition-transform duration-500" /> {sortNewestFirst ? 'Newest First' : 'Oldest First'}
          </button>
          <div className="h-10 w-px bg-white/5 hidden lg:block"></div>
          <div className="w-full sm:flex-initial flex items-center justify-center px-6 py-3 bg-bg-primary/30 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">
            Total {filteredLeads.length} Nodes
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="card-modern rounded-[2.5rem] overflow-hidden relative z-10 border border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-bg-secondary/40 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-white/5 italic">
              <tr>
                <th className="px-4 py-4 sm:px-6 sm:py-5">Identity / Entity</th>
                <th className="px-4 py-4 sm:px-6 sm:py-5">Communication Vector</th>
                <th className="px-4 py-4 sm:px-6 sm:py-5">Interaction state</th>
                <th className="px-4 py-4 sm:px-6 sm:py-5">Priority</th>
                <th className="px-4 py-4 sm:px-6 sm:py-5">Timestamp</th>
                <th className="px-4 py-4 sm:px-6 sm:py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-20 sm:px-6 sm:py-32 text-center text-text-muted italic font-black uppercase tracking-widest opacity-40">Decrypting registry data...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-20 sm:px-6 sm:py-32 text-center text-text-muted italic font-black uppercase tracking-widest opacity-40">Zero vectors found in current scope.</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-accent/5 transition-all group">
                  <td className="px-4 py-5 sm:px-6 sm:py-8">
                    <div className="font-black text-text-primary group-hover:text-accent transition-colors italic text-base uppercase tracking-tight">{lead.name}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">{lead.company || 'Private Node'}</div>
                  </td>
                  <td className="px-4 py-5 sm:px-6 sm:py-8">
                    <div className="text-sm font-bold text-text-primary mb-1">{lead.email}</div>
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-tighter opacity-50">{lead.phone || 'NO PHONE'}</div>
                  </td>
                  <td className="px-4 py-5 sm:px-6 sm:py-8">
                    <select 
                      defaultValue={lead.status}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full outline-none border border-white/10 transition-all cursor-pointer shadow-sm italic ${
                        lead.status === 'new' ? 'bg-accent/20 text-accent' : 
                        lead.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-success/20 text-success'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-4 py-5 sm:px-6 sm:py-8">
                    <div className={`text-[9px] font-black px-3 py-1 rounded-full inline-block border italic tracking-[0.2em] shadow-sm ${
                      lead.priority === 'high' ? 'bg-accent/10 border-accent/40 text-accent shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-text-muted'
                    }`}>
                      {lead.priority?.toUpperCase() || 'NORMAL'}
                    </div>
                  </td>
                  <td className="px-4 py-5 sm:px-6 sm:py-8">
                    <div className="flex items-center gap-2 text-text-muted opacity-60">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{lead.createdAt ? formatDate(new Date(lead.createdAt)) : 'Recent'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 sm:px-6 sm:py-8 text-right">
                    <div className="flex justify-end gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setReplyingTo(lead)}
                        className="p-3 bg-white/5 text-text-secondary border border-white/5 rounded-xl hover:text-accent hover:border-accent hover:bg-accent/5 transition-all shadow-md"
                        title="Reply"
                      >
                        <Reply size={18} />
                      </button>
                      <button
                        onClick={() => { window.location.href = `mailto:${lead.email}`; }}
                        className="p-3 bg-white/5 text-text-secondary border border-white/5 rounded-xl hover:text-text-primary hover:border-white/20 transition-all shadow-md"
                        title="Open email client"
                      >
                        <Mail size={18} />
                      </button>
                      <button onClick={() => deleteLead(lead._id)} className="p-3 bg-white/5 text-text-secondary border border-white/5 rounded-xl hover:text-accent-soft hover:border-accent-soft/20 transition-all shadow-md"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setReplyingTo(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl card-modern rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">Response Console</h2>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">To: <span className="text-text-primary underline decoration-accent decoration-2 underline-offset-4">{replyingTo.email}</span></p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-3 hover:bg-white/5 rounded-2xl text-text-primary transition-all hover:rotate-90"><X size={24}/></button>
              </div>

              <form onSubmit={handleReply} className="p-10 space-y-8">
                {replyingTo.message && (
                  <div className="bg-accent/5 p-8 rounded-[2rem] border border-accent/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <p className="text-[10px] font-black uppercase text-accent mb-3 tracking-[0.2em] italic">Original Core Inquiry</p>
                    <p className="text-sm font-bold italic text-text-secondary leading-relaxed relative z-10">"{replyingTo.message}"</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black mb-4 uppercase tracking-[0.3em] text-text-muted italic">Neural Response Buffer</label>
                  <textarea 
                    autoFocus
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full h-56 bg-bg-secondary/40 border border-white/5 text-text-primary rounded-3xl p-8 outline-none input-glow font-bold italic text-base resize-none"
                    placeholder="Formulate your interaction sequence..."
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex-1 py-5 bg-bg-secondary/60 text-text-primary border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-bg-hover transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={sendingReply}
                    className="flex-[2] py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] disabled:opacity-50"
                  >
                    {sendingReply ? 'TRANSMITTING...' : <><Send size={18} /> Initiate Transmission</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 card-modern px-10 py-6 rounded-3xl border border-white/5 shadow-2xl relative z-10">
         <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-60">Mapping 1 to {filteredLeads.length} nodes in registry</div>
         <div className="flex gap-3">
            <button className="bg-white/5 p-3 border border-white/10 rounded-xl text-text-muted hover:text-accent hover:border-accent disabled:opacity-20 transition-all shadow-md" disabled><ChevronLeft size={18}/></button>
            <button className="bg-white/5 p-3 border border-white/10 rounded-xl text-text-muted hover:text-accent hover:border-accent disabled:opacity-20 transition-all shadow-md" disabled><ChevronRight size={18}/></button>
         </div>
      </div>
    </div>
  );
}

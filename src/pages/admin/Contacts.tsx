import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  Search, 
  MessageSquare, 
  Trash2, 
  ExternalLink,
  Mail,
  CheckCircle,
  Clock,
  Send,
  X,
  Reply
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/admin/leads');
      const filtered = response.data.filter((item: any) => item.source === 'contact_form' || !item.source);
      setContacts(filtered);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status });
      setContacts(contacts.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !replyingTo) return;

    setSendingReply(true);
    try {
      await api.post(`/admin/leads/${replyingTo._id}/reply`, { message: replyMessage });
      setContacts(contacts.map(c => 
        c._id === replyingTo._id 
          ? { ...c, replyMessage, repliedAt: new Date(), status: 'contacted' } 
          : c
      ));
      setReplyingTo(null);
      setReplyMessage('');
      alert('Reply sent successfully! (Check server console for log)');
    } catch (err) {
      console.error("Failed to send reply", err);
      alert('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/admin/leads/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
      alert('Message deleted successfully');
    } catch (err: any) {
      console.error("Failed to delete contact", err);
      alert(err.response?.data?.error || 'Failed to delete message');
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-10 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="relative z-10">
        <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Human Uplinks</h1>
        <p className="text-text-secondary text-sm font-bold uppercase tracking-[0.2em] opacity-60 italic">Inbound support signals & vector communications</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between card-modern p-6 rounded-[2.5rem] border border-white/5 relative z-10 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-accent brightness-150" />
          <input 
            type="text"
            placeholder="FILTER SIGNAL BY ATTRIBUTE..."
            className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary pl-16 pr-6 py-5 rounded-2xl outline-none input-glow font-black italic tracking-widest text-[10px] placeholder:opacity-40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40">
          Detected Signals: {filteredContacts.length}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 card-modern animate-pulse rounded-[2.5rem] border-white/5"></div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="card-modern p-32 text-center rounded-[3rem] border-white/5 italic text-text-muted font-black uppercase tracking-[0.3em] opacity-40 relative z-10">
          Zero inbound signals detected in current vector.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
          {filteredContacts.map((contact, idx) => (
            <motion.div 
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-bg-secondary/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/40 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-[1.01] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-all duration-500">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-text-primary group-hover:text-accent transition-colors italic uppercase tracking-tighter text-lg">{contact.name}</h3>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-text-secondary opacity-60 uppercase">{contact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {contact.repliedAt ? (
                     <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-success/10 text-success px-4 py-1.5 rounded-full border border-success/30 italic shadow-sm">
                       <CheckCircle size={10} /> Sync Complete
                     </span>
                   ) : contact.status === 'new' ? (
                     <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-accent-soft/10 text-accent-soft px-4 py-1.5 rounded-full border border-accent-soft/30 italic shadow-sm animate-pulse">
                       <Clock size={10} /> Active Signal
                     </span>
                   ) : (
                     <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white/5 text-text-muted px-4 py-1.5 rounded-full border border-white/10 italic opacity-60 shadow-sm">
                       <CheckCircle size={10} /> Decrypted
                     </span>
                   )}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-[0.3em] opacity-40 italic ml-2">Context Header</p>
                <p className="font-black text-text-primary mb-4 italic uppercase tracking-tight text-base px-2">{contact.subject}</p>
                <div className="text-sm text-text-secondary italic font-bold bg-bg-card/30 p-6 rounded-[1.5rem] border border-white/10 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all leading-relaxed shadow-inner">
                  {contact.message}
                </div>
              </div>

              {contact.replyMessage && (
                <div className="mb-8 bg-accent/10 p-6 rounded-[1.5rem] border border-accent/20 relative shadow-lg overflow-hidden group/reply">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 blur-2xl rounded-full"></div>
                  <p className="text-[10px] font-black text-accent mb-3 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Reply size={12} className="brightness-125" /> Uplink Response ({formatDate(new Date(contact.repliedAt))})
                  </p>
                  <p className="text-sm text-text-primary italic font-black leading-relaxed relative z-10">
                    "{contact.replyMessage}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-[10px] font-black text-text-muted opacity-40 uppercase tracking-[0.2em] italic">{formatDate(new Date(contact.createdAt))}</span>
                <div className="flex gap-3">
                   <button 
                     onClick={() => deleteContact(contact._id)}
                     className="p-3 bg-white/5 border border-white/5 rounded-xl text-text-secondary hover:text-accent-soft hover:bg-accent-soft/10 hover:border-accent-soft/30 transition-all shadow-md active:scale-90"
                   >
                     <Trash2 size={16} />
                   </button>
                   <button 
                     onClick={() => setReplyingTo(contact)}
                     className="px-6 py-3 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 shadow-[0_10px_25px_rgba(99,102,241,0.3)]"
                   >
                     <Reply size={16} /> {contact.repliedAt ? 'Sync Again' : 'Transmit Response'}
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setReplyingTo(null)}
               className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-bg-primary/90 card-modern rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(99,102,241,0.25)] overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">Respond to Vector</h2>
                  <p className="text-text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">TARGET: {replyingTo.email}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-3 hover:bg-white/5 rounded-2xl text-text-primary hover:rotate-90 transition-all"><X size={24}/></button>
              </div>

              <form onSubmit={handleReply} className="p-10 space-y-8">
                <div className="bg-bg-secondary/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full"></div>
                   <p className="text-[10px] font-black uppercase text-text-muted mb-3 tracking-[0.3em] italic opacity-40">Original Signal Source</p>
                   <p className="text-base font-black italic text-text-secondary leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">"{replyingTo.message}"</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-40">Response Formulation</label>
                  <textarea 
                    autoFocus
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full h-56 bg-bg-secondary/40 border border-white/5 text-text-primary rounded-[2rem] p-8 outline-none input-glow font-black italic text-lg transition-all resize-none shadow-inner"
                    placeholder="Input transmission content sequence..."
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex-1 py-5 bg-bg-secondary/60 text-text-primary border border-white/5 rounded-2xl font-black uppercase tracking-[0.2em] italic text-[10px] hover:bg-bg-hover transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={sendingReply}
                    className="flex-[2] py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] disabled:opacity-50 italic"
                  >
                    {sendingReply ? 'SYNCHRONIZING...' : <><Send size={20} /> Deploy Uplink</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

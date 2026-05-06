import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  ChevronRight,
  X,
  Eye,
  Edit2,
  Trash2,
  User,
  Reply
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';

export default function AdminEmailCenter() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'logs'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, tempRes, leadRes] = await Promise.all([
        api.get('/admin/campaigns'),
        api.get('/admin/templates'),
        api.get('/admin/leads')
      ]);
      setCampaigns(campRes.data);
      setTemplates(tempRes.data);
      setLogs(leadRes.data);
    } catch (err) {
      console.error("Failed to fetch email center data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign forever?')) return;
    try {
      await api.delete(`/admin/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
      alert('Campaign deleted');
    } catch (err) {
      console.error("Failed to delete campaign", err);
      alert('Failed to delete campaign');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/admin/templates/${id}`);
      setTemplates(prev => prev.filter(t => t._id !== id));
      alert('Template deleted');
    } catch (err) {
      console.error("Failed to delete template", err);
      alert('Failed to delete template');
    }
  };

  const deleteLog = async (id: string) => {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await api.delete(`/admin/leads/${id}`);
      setLogs(prev => prev.filter(l => l._id !== id));
      alert('Log deleted');
    } catch (err) {
      console.error("Failed to delete log", err);
      alert('Failed to delete log');
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Email Nexus</h1>
          <p className="text-text-secondary text-sm font-bold uppercase tracking-[0.2em] opacity-60 italic">Communications matrix & sequence management</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 hover:scale-[1.05] active:scale-95 transition-all"
        >
          <Plus size={20} /> Deploy Campaign
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { label: 'Campaigns', value: campaigns.length, color: 'text-text-primary', glow: 'bg-white/5' },
          { label: 'Templates', value: templates.length, color: 'text-accent', glow: 'bg-accent/5' },
          { label: 'Logs', value: logs.length, color: 'text-blue-400', glow: 'bg-blue-500/5' },
          { label: 'Unreplied', value: logs.filter(l => !l.repliedAt).length, color: 'text-accent-soft', glow: 'bg-accent-soft/5' },
        ].map((stat, i) => (
          <div key={i} className={`card-modern p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.glow} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`}></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 italic opacity-60">{stat.label}</p>
            <p className={`text-3xl md:text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar relative z-10">
        {(['campaigns', 'templates', 'logs'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-5 font-black uppercase tracking-[0.2em] text-[10px] italic transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-accent' : 'text-text-muted hover:text-text-primary opacity-60 hover:opacity-100'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6 relative z-10">
        {loading ? (
          <div className="p-32 text-center card-modern rounded-[2.5rem] border-white/5 animate-pulse text-text-muted font-black uppercase tracking-[0.3em] italic opacity-40">Decrypting Nexus Data...</div>
        ) : (
          <>
            {activeTab === 'campaigns' && <CampaignList campaigns={campaigns} onUpdate={fetchData} onView={setSelectedCampaign} onDelete={deleteCampaign} />}
            {activeTab === 'templates' && <TemplateList templates={templates} onUpdate={fetchData} onDelete={deleteTemplate} />}
            {activeTab === 'logs' && <LogList logs={logs} onUpdate={fetchData} onDelete={deleteLog} />}
          </>
        )}
      </div>

      <CreateCampaignModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={fetchData}
        templates={templates}
      />

      <CampaignDetailsModal 
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
}

function CampaignList({ campaigns, onUpdate, onView, onDelete }: { campaigns: any[], onUpdate: () => void, onView: (c: any) => void, onDelete: (id: string) => void }) {
  if (campaigns.length === 0) return (
    <div className="card-modern p-20 text-center rounded-[2.5rem] border-white/5 italic text-text-muted font-black uppercase tracking-[0.2em] opacity-40">
      Zero transmission logs recorded.
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {campaigns.map((c, i) => (
        <div 
          key={c._id} 
          onClick={() => onView(c)}
          className="bg-bg-secondary/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-accent/5 hover:border-accent/30 transition-all group cursor-pointer shadow-xl gap-4"
        >
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110 ${
              c.status === 'sent' ? 'bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
              c.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
              'bg-white/5 text-text-muted border-white/10'
            }`}>
              <Send size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-text-primary group-hover:text-accent transition-colors truncate text-base uppercase italic tracking-tighter">{c.title}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary truncate opacity-70">{c.subject}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-12 w-full sm:w-auto px-2">
            <div className="text-left">
              <p className="text-[9px] font-black uppercase text-text-muted mb-1 tracking-[0.2em] opacity-50 italic">Nodes Targeted</p>
              <p className="font-black text-sm text-text-primary italic tracking-tight">{c.recipientsCount || 0}</p>
            </div>
            <div className="w-24 text-left">
              <p className="text-[9px] font-black uppercase text-text-muted mb-1 tracking-[0.2em] opacity-50 italic">State</p>
              <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border italic tracking-widest shadow-sm ${
                c.status === 'sent' ? 'bg-success/10 border-success/30 text-success' :
                c.status === 'scheduled' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                'bg-white/5 border-white/10 text-text-muted opacity-60'
              }`}>
                {c.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(c._id); }}
                className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-accent-soft/10 text-text-secondary hover:text-accent-soft transition-all shadow-md group-hover:border-accent-soft/30"
              >
                <Trash2 size={18} />
              </button>
              <div className="hidden sm:block p-3 bg-white/5 border border-white/5 rounded-xl transition-all text-text-muted group-hover:text-accent group-hover:border-accent/30 shadow-md">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplateList({ templates, onUpdate, onDelete }: { templates: any[], onUpdate: () => void, onDelete: (id: string) => void }) {
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  if (templates.length === 0) return (
    <div className="card-modern p-20 text-center rounded-[2.5rem] border-white/5 italic text-text-muted font-black uppercase tracking-[0.2em] opacity-40">
      Zero blueprint matrices detected.
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {templates.map((template, i) => (
        <div 
          key={template._id} 
          onClick={() => setEditingTemplate(template)}
          className="card-modern p-6 rounded-[2rem] border border-white/5 hover:border-accent/40 transition-all group cursor-pointer shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors"></div>
          
          <div className="aspect-video bg-bg-secondary/40 backdrop-blur-md rounded-2xl mb-6 p-6 border border-white/5 group-hover:bg-accent/5 transition-all overflow-hidden relative shadow-inner">
             <div className="text-[10px] text-text-muted leading-relaxed whitespace-pre-wrap truncate h-full italic opacity-60 font-medium">
               {template.body}
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/80 to-transparent"></div>
          </div>
          <h3 className="font-black text-text-primary mb-4 italic uppercase tracking-tighter text-lg">{template.name}</h3>
          <div className="flex items-center justify-between text-[10px] text-text-muted font-black uppercase tracking-widest italic opacity-60">
            <span>Last Sync: {formatDate(new Date(template.updatedAt))}</span>
            <div className="flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); }}
                className="hover:text-accent transition-colors flex items-center gap-1 group-hover:opacity-100"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(template._id); }}
                className="hover:text-accent-soft transition-colors flex items-center gap-1 group-hover:opacity-100"
              >
                <Trash2 size={12} /> Wipe
              </button>
            </div>
          </div>
        </div>
      ))}

      <EditTemplateModal 
        template={editingTemplate} 
        onClose={() => setEditingTemplate(null)} 
        onSuccess={onUpdate}
      />
    </div>
  );
}

function LogList({ logs, onUpdate, onDelete }: { logs: any[], onUpdate: () => void, onDelete: (id: string) => void }) {
  const [replyingTo, setReplyingTo] = useState<any>(null);

  return (
    <div className="card-modern rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative z-10">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-bg-secondary/40 backdrop-blur-md">
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-text-primary">Historical Interaction Logs</h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 italic">Global Vector Log</span>
      </div>
      <div className="divide-y divide-white/10 bg-bg-card/20">
        {logs.map((log, i) => (
          <div 
            key={log._id} 
            onClick={() => setReplyingTo(log)}
            className="p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-accent/5 gap-6 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${
                log.repliedAt ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20 group-hover:bg-accent group-hover:text-white'
              }`}>
                {log.repliedAt ? <CheckCircle size={20} /> : <Clock size={20} />}
              </div>
              <div className="min-w-0">
                <p className="font-black text-text-primary tracking-tighter group-hover:text-accent transition-colors text-base italic uppercase">{log.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border italic ${
                    log.source === 'contact_form' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-text-muted border-white/10'
                  }`}>
                    {log.source === 'contact_form' ? 'Inbound inquiry' : 'System automated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 hidden xl:block min-w-0">
              <p className="text-sm text-text-secondary italic opacity-60 group-hover:opacity-100 transition-opacity truncate font-bold">"{log.message}"</p>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-2 text-text-muted opacity-50">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{formatDate(new Date(log.createdAt))}</span>
              </div>
              <div className="flex gap-2">
                {!log.repliedAt ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setReplyingTo(log); }}
                    className="px-6 py-2.5 bg-accent text-white border border-accent rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <Reply size={14} /> Respond
                  </button>
                ) : (
                  <span className="text-[10px] text-success font-black uppercase tracking-[0.2em] italic flex items-center gap-2 bg-success/10 px-4 py-2.5 rounded-xl border border-success/20">
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(log._id); }}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl text-text-secondary hover:text-accent-soft hover:border-accent-soft transition-all shadow-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReplyModal 
        log={replyingTo} 
        onClose={() => setReplyingTo(null)} 
        onSuccess={onUpdate} 
      />
    </div>
  );
}

// --- MODALS ---

function CampaignDetailsModal({ campaign, onClose }: any) {
  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-3xl card-modern rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">{campaign.title}</h2>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">Status: <span className="text-accent underline decoration-2 underline-offset-4 decoration-accent shadow-sm">{campaign.status.toUpperCase()}</span></p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 text-text-primary rounded-2xl transition-all hover:rotate-90"><X size={24}/></button>
        </div>
        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-bg-secondary/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full"></div>
                <p className="text-[10px] font-black uppercase text-text-muted mb-2 tracking-widest opacity-60 italic">Propagation Nodes</p>
                <p className="text-3xl font-black italic text-text-primary tracking-tighter shadow-sm">{campaign.recipientsCount || 0}</p>
             </div>
             <div className="bg-bg-secondary/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full"></div>
                <p className="text-[10px] font-black uppercase text-text-muted mb-2 tracking-widest opacity-60 italic">Deployment Date</p>
                <p className="text-xl font-bold italic text-text-primary tracking-tighter">{formatDate(new Date(campaign.createdAt))}</p>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Transmission Header (Subject)</p>
             <p className="text-lg font-black italic p-6 bg-accent/5 rounded-[2rem] border border-accent/20 text-text-primary shadow-sm">{campaign.subject}</p>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Content Visualization</p>
             <div className="bg-bg-secondary/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-md whitespace-pre-wrap font-sans text-text-secondary leading-relaxed italic font-bold">
               {campaign.content}
             </div>
          </div>
        </div>
        <div className="p-10 border-t border-white/5 bg-bg-secondary/60 backdrop-blur-md flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.05] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)]">Close Matrix</button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateCampaignModal({ isOpen, onClose, onSuccess, templates }: any) {
  const [formData, setFormData] = useState({ title: '', subject: '', content: '', templateId: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/campaigns', {
        ...formData,
        status: 'sent',
        recipientsCount: Math.floor(Math.random() * 5000) + 1000 // Mocking recipient count
      });
      onSuccess();
      onClose();
      alert('Campaign sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (e: any) => {
    const template = templates.find((t: any) => t._id === e.target.value);
    if (template) {
      setFormData({
        ...formData,
        templateId: template._id,
        subject: template.subject,
        content: template.body
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-2xl card-modern rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(99,102,241,0.25)] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">Create Transmission</h2>
          <button onClick={onClose} className="p-3 hover:bg-white/5 text-text-primary rounded-2xl transition-all hover:rotate-90"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Internal Matrix Label</label>
            <input 
              required
              className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary p-5 rounded-2xl outline-none input-glow font-black italic tracking-tight"
              placeholder="e.g. CORE_DISCOUNT_OMEGA"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Blueprint Selection</label>
            <select 
              className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary p-5 rounded-2xl outline-none input-glow font-bold italic cursor-pointer appearance-none"
              onChange={handleTemplateSelect}
              value={formData.templateId}
            >
              <option value="">Blank Canvas (Manual formulation)</option>
              {templates.map((t: any) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Transmission Header</label>
            <input 
              required
              className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary p-5 rounded-2xl outline-none input-glow font-bold italic"
              placeholder="Primary attention catalyst..."
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Data Payload (Raw Message)</label>
            <textarea 
              required
              className="w-full h-64 bg-bg-secondary/40 border border-white/5 text-text-primary p-8 rounded-3xl outline-none input-glow resize-none font-mono text-sm leading-relaxed"
              placeholder="Formulate your transmission sequence here..."
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {loading ? 'TRANSMITTING...' : <><Send size={18} /> Initiate Global Blast</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function EditTemplateModal({ template, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) setFormData({ name: template.name, subject: template.subject, body: template.body });
  }, [template]);

  if (!template) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/admin/templates/${template._id}`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-2xl card-modern rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">Modify Blueprint</h2>
          <button onClick={onClose} className="p-3 hover:bg-white/5 text-text-primary rounded-2xl transition-all hover:rotate-90"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Blueprint Label</label>
            <input 
              required
              className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary p-5 rounded-2xl outline-none input-glow font-black italic"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Default Header</label>
            <input 
              required
              className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary p-5 rounded-2xl outline-none input-glow font-bold italic"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Structural Data</label>
            <textarea 
              required
              className="w-full h-64 bg-bg-secondary/40 border border-white/5 text-text-primary p-8 rounded-3xl outline-none input-glow resize-none font-mono text-sm leading-relaxed"
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {loading ? 'SYNCING...' : 'Commit Blueprint Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ReplyModal({ log, onClose, onSuccess }: any) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!log) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/admin/leads/${log._id}/reply`, { message });
      onSuccess();
      onClose();
      alert('Reply sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-2xl card-modern rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-bg-secondary/60 backdrop-blur-sm">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gradient">Respond to Vector</h2>
          <button onClick={onClose} className="p-3 hover:bg-white/5 text-text-primary rounded-2xl transition-all hover:rotate-90"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="bg-accent/5 p-8 rounded-[2rem] border border-accent/20 relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <p className="text-[10px] uppercase font-black tracking-[0.2em] text-accent mb-4 italic">Original Core Inquiry</p>
             <p className="text-sm italic font-bold text-text-secondary leading-relaxed relative z-10">"{log.message}"</p>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-text-muted ml-2 tracking-[0.3em] italic opacity-60">Neural Response Context</label>
            <textarea 
              autoFocus
              required
              className="w-full h-56 bg-bg-secondary/40 border border-white/5 text-text-primary p-8 rounded-[2rem] outline-none input-glow resize-none font-bold italic text-base backdrop-blur-md"
              placeholder="Formulate your response transmission..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 bg-bg-secondary/60 text-text-primary border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-bg-hover transition-all italic"
            >
              Abort
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] disabled:opacity-50 italic"
            >
              {loading ? 'TRANSMITTING...' : <><Send size={18} /> Deploy Response</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

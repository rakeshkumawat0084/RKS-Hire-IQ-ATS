import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    analysisModel: 'gemini-2.5-flash',
    systemPrompt: '',
    brandColor: '#6366f1',
    platformName: 'RKS HireIQ'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings(response.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error("Failed to save settings", err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 relative">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">System Configuration</h1>
          <p className="text-text-secondary text-sm font-bold uppercase tracking-widest opacity-60 italic">Global parameters & neural parameters</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-accent text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Syncing...' : 'Commit Changes'}
        </button>
      </header>

      <div className="card-modern p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative z-10 shadow-2xl space-y-10 md:space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
             <h3 className="text-xl font-black italic uppercase tracking-widest text-text-primary">AI Core Diagnostics</h3>
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60 ml-2">Neural Analysis Model</label>
                <select 
                  value={settings.analysisModel}
                  onChange={(e) => setSettings({ ...settings, analysisModel: e.target.value })}
                  className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-2xl px-6 py-4 outline-none input-glow font-bold italic text-sm backdrop-blur-md cursor-pointer"
                >
                   <option value="gemini-2.5-flash">gemini-2.5-flash (Best Performance)</option>
                   <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (Fastest)</option>
                   <option value="gemini-2.5-pro">gemini-2.5-pro (Max Precision)</option>
                   <option value="gemini-2.0-flash">gemini-2.0-flash (Legacy Stable)</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60 ml-2">Global System Heuristics</label>
                <textarea 
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                  className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-2xl p-8 outline-none h-48 md:h-64 input-glow font-bold italic line-relaxed text-sm resize-none backdrop-blur-md"
                  placeholder="Define the primary AI persona and behavioral constraints..."
                />
             </div>
          </div>
        </section>

        <section className="pt-10 md:pt-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
             <h3 className="text-xl font-black italic uppercase tracking-widest text-text-primary">Aura & Attribution</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60 ml-2">Primary Aura (Brand Color)</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-14 h-14 shrink-0 shadow-lg hover:scale-110 transition-transform">
                    <input 
                      type="color" 
                      value={settings.brandColor}
                      onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                      className="absolute inset-0 w-full h-full bg-transparent border-none cursor-pointer rounded-2xl overflow-hidden opacity-0 z-10" 
                    />
                    <div 
                      className="w-full h-full rounded-2xl border-2 border-white/10 shadow-inner"
                      style={{ backgroundColor: settings.brandColor }}
                    ></div>
                  </div>
                  <input 
                    type="text"
                    value={settings.brandColor}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-2xl px-6 py-4 outline-none input-glow font-mono font-bold italic text-sm backdrop-blur-md"
                    placeholder="#HEX_CODE"
                  />
                </div>
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60 ml-2">Platform Identity</label>
                <input 
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-2xl px-6 py-4 outline-none input-glow font-bold italic text-sm backdrop-blur-md" 
                  placeholder="Specify system name..."
                />
             </div>
          </div>
        </section>

        <div className="mt-4 p-6 bg-accent/5 rounded-3xl border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                <Loader2 size={18} className="text-accent" />
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest italic opacity-70">Configuration persists globally across the entire matrix.</p>
           </div>
           <span className="text-[10px] font-black uppercase tracking-tighter text-accent bg-accent/10 px-3 py-1 rounded-full">LIVE_PRODUCTION_ENV</span>
        </div>
      </div>
    </div>
  );
}

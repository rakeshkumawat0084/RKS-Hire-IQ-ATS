import { ChangeEvent, useRef, useState } from 'react';
import { useUserStore } from '../../store';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Save, 
  Camera,
  Plus,
  X
} from 'lucide-react';
import api from '../../lib/api';
import { AI_MODELS, setPreferredAIModel } from '../../services/aiService';

const compressProfilePhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not load the selected image.'));
      image.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image compression is not available in this browser.'));
          return;
        }

        canvas.width = size;
        canvas.height = size;
        const sourceSize = Math.min(image.width, image.height);
        const sx = (image.width - sourceSize) / 2;
        const sy = (image.height - sourceSize) / 2;
        context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

export default function UserProfile() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    targetRole: user?.targetRole || '',
    skills: user?.skills || ['React', 'Node.js', 'TypeScript'],
    preferredModel: user?.preferredModel || 'gemini-2.5-flash',
    avatarDataUrl: user?.avatarDataUrl || ''
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/user/profile', formData);
      setUser(response.data);
      setPreferredAIModel(response.data.preferredModel || formData.preferredModel);
      alert('Profile updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skill) });
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarDataUrl = await compressProfilePhoto(file);
      setFormData({ ...formData, avatarDataUrl });
    } catch (err: any) {
      alert(err.message || 'Failed to compress profile photo');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-text-secondary text-sm">Manage your personal information and industry skills.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto bg-accent px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-accent/20 text-white"
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-border h-fit text-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 group">
            <div className="w-full h-full rounded-[2rem] bg-accent/20 flex items-center justify-center text-3xl md:text-4xl font-bold text-accent border border-accent/30 overflow-hidden">
               {formData.avatarDataUrl ? (
                <img src={formData.avatarDataUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                formData.fullName?.[0] || '?'
               )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-accent rounded-xl text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Change profile photo"
            >
              <Camera size={16} />
            </button>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-1">{formData.fullName}</h2>
          <p className="text-text-secondary text-xs md:text-sm mb-6">{formData.targetRole || 'Professional'}</p>
          
          <div className="pt-6 border-t border-border">
             <div className="flex justify-between text-[10px] mb-2 uppercase font-black tracking-widest">
                <span className="text-text-muted">Profile Strength</span>
                <span className="text-accent">75%</span>
             </div>
             <div className="h-1.5 w-full bg-bg-hover rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-accent"></motion.div>
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="glass p-6 md:p-8 rounded-3xl border border-border space-y-6">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 border-b border-border pb-4 mb-2">
              <User className="text-accent w-4.5 h-4.5 md:w-5 md:h-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Full Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                   <input 
                    className="w-full bg-bg-secondary border border-border rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent/40 text-sm"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                   <input 
                    className="w-full bg-bg-secondary border border-white/5 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent/40 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                   <input 
                    className="w-full bg-bg-secondary border border-white/5 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent/40 text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 000 000 0000"
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Location</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                   <input 
                    className="w-full bg-bg-secondary border border-white/5 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent/40 text-sm"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Rajasthan, India"
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 md:p-8 rounded-3xl border border-border space-y-6">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 border-b border-border pb-4 mb-2">
              <Briefcase className="text-accent w-4.5 h-4.5 md:w-5 md:h-5" /> Professional Profile
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Target Role / Designation</label>
                <input 
                  className="w-full bg-bg-secondary border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent/40 text-sm"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-bold uppercase tracking-widest">Preferred AI Model</label>
                <select
                  className="w-full bg-bg-secondary border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent/40 text-sm"
                  value={formData.preferredModel}
                  onChange={(e) => {
                    setFormData({...formData, preferredModel: e.target.value});
                    setPreferredAIModel(e.target.value);
                  }}
                >
                  {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.label} - {model.hint}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-4 font-bold uppercase tracking-widest">Core Skills</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map(skill => (
                    <span key={skill} className="bg-accent/10 text-accent-soft px-3 py-1.5 rounded-full text-xs font-bold border border-accent/20 flex items-center gap-2">
                       {skill} <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                   <input 
                    className="grow bg-bg-secondary border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent/40 text-sm"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill..."
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                   />
                   <button 
                    onClick={addSkill}
                    className="p-3 bg-bg-hover rounded-xl hover:bg-bg-secondary transition-all border border-border text-text-primary"
                   >
                     <Plus size={20} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

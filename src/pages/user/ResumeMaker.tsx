import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import html2pdf from 'html2pdf.js';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Layout,
  Compass
} from 'lucide-react';
import { generateResume, autofillResumeData, PolishedResume, parseAIError } from '../../services/aiService';
import { useResumeStore } from '../../store';
import PowerSidebar from '../../components/resume-templates/PowerSidebar';
import ModernExecutive from '../../components/resume-templates/ModernExecutive';
import CreativeMinimalist from '../../components/resume-templates/CreativeMinimalist';
import { ResumePreview } from '../../components/resume-architect/ResumePreview';
import { LAYOUTS, THEMES } from '../../components/resume-architect/constants';
import { ResumeData } from '../../components/resume-architect/types';

type Step = 'template' | 'personal' | 'experience' | 'education' | 'skills' | 'review' | 'result';

export default function ResumeMaker() {
  const [step, setStep] = useState<Step>('template');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polishedResume, setPolishedResume] = useState<PolishedResume | null>(null);
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [resumeScale, setResumeScale] = useState(1);
  const wrapperRef  = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const RESUME_W = 794;
  const RESUME_H = 1123;

  const updateResumeScale = useCallback((node: HTMLDivElement) => {
    const availableWidth = node.clientWidth - 48;
    const availableHeight = node.clientHeight - 48;
    const widthScale = availableWidth / RESUME_W;
    const heightScale = availableHeight / RESUME_H;
    const newScale = Math.min(1, widthScale, heightScale);

    setResumeScale(prev => {
      const next = Math.max(0.25, Number(newScale.toFixed(4)));
      return prev === next ? prev : next;
    });
  }, []);

  // useCallback ref: fires the moment the element is attached to the DOM
  const setWrapperRef = useCallback((node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    if (!node) return;
    const calc = () => updateResumeScale(node);
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(node);
    observerRef.current = ro;
  }, [updateResumeScale]);

  // Also recalculate on window resize
  useEffect(() => {
    const onResize = () => {
      if (!wrapperRef.current) return;
      updateResumeScale(wrapperRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateResumeScale]);

  const [formData, setFormData] = useState({
    templateId: 'executive',
    colorScheme: 'indigo', // Default blue from THEMES
    photoUrl: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    experience: [
      { company: '', role: '', duration: '', description: '' }
    ],
    education: [
      { school: '', degree: 'Bachelors', duration: '', details: '' }
    ],
    skills: [
      { category: 'Technical Skills', list: '' },
      { category: 'Soft Skills', list: '' }
    ]
  });

  const degreeTypes = [
    'Bachelors', 'Masters', 'PhD', 'Associate', 'Diploma', 'Certification', 'High School'
  ];

  const skillCategories = [
    'Technical Skills', 'Soft Skills', 'Programming Languages', 'Tools & Frameworks', 'Design', 'Management', 'Languages'
  ];

  const handleStepChange = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const removeExperience = (index: number) => {
    const newExp = [...formData.experience];
    newExp.splice(index, 1);
    setFormData({ ...formData, experience: newExp });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: '', degree: '', duration: '', details: '' }]
    });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...formData.education];
    newEdu.splice(index, 1);
    setFormData({ ...formData, education: newEdu });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        links: [
          formData.linkedin ? `LinkedIn: ${formData.linkedin}` : null,
          formData.github ? `GitHub: ${formData.github}` : null,
          formData.portfolio ? `Portfolio: ${formData.portfolio}` : null
        ].filter(Boolean)
      };
      const result = await generateResume(payload);
      setPolishedResume(result);
      setStep('result');
      // ─── Publish to global resume pipeline ───────────────────────────────────
      // Now every feature (Analyzer, SkillsLab, CareerPath) can read this resume.
      const { setResumeData } = useResumeStore.getState();
      const flatText = [
        result.fullName,
        result.contact?.email, result.contact?.phone, result.contact?.location,
        result.summary,
        ...(result.experience || []).map((e: any) => `${e.role} at ${e.company}: ${e.description}`),
        ...(result.education || []).map((e: any) => `${e.degree} from ${e.institution}`),
        ...(result.skills || []).map((s: any) => `${s.category}: ${s.list?.join(', ')}`)
      ].filter(Boolean).join('\n');
      setResumeData(
        flatText,
        result.experience?.[0]?.role || '',
        (result.skills || []).flatMap((s: any) => s.list || []).join(', '),
        (result.education || []).map((e: any) => e.degree).join(', ')
      );
    } catch (err) {
      setError(parseAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = async () => {
    // If user hasn't typed a role in the first experience block, prompt them
    const role = formData.experience[0]?.role;
    if (!role) {
      setError("Please enter a Target Role in the Experience section first (e.g. 'Software Engineer') so AI knows what to generate.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await autofillResumeData(role);
      setFormData(prev => ({
        ...prev,
        summary: data.summary || prev.summary,
        experience: data.experience?.length ? data.experience : prev.experience,
        education: data.education?.length ? data.education : prev.education,
        skills: data.skills?.length ? data.skills : prev.skills
      }));
    } catch (err) {
      setError("Failed to autofill data from AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    // The previous library (html2pdf/html2canvas) crashes the browser when rendering 
    // modern CSS properties like backdrop-blur-md, causing the UI to hang.
    // By fixing the print CSS with @page { margin: 0; }, we can use the native 
    // browser print (Save as PDF) which creates true ATS-readable PDFs without hanging.
    window.print();
  };

  const handleDownloadText = () => {
    if (!polishedResume) return;

    const content = `
${polishedResume.fullName.toUpperCase()}
${polishedResume.contact.email} | ${polishedResume.contact.phone} | ${polishedResume.contact.location}
${polishedResume.contact.links?.join(' | ') || ''}

PROFESSIONAL SUMMARY
${polishedResume.summary}

WORK EXPERIENCE
${polishedResume.experience.map(exp => `
${exp.company.toUpperCase()} | ${exp.role}
${exp.duration}
${exp.highlights.map(h => `- ${h}`).join('\n')}
`).join('\n')}

EDUCATION
${polishedResume.education.map(edu => `
${edu.school.toUpperCase()}
${edu.degree} | ${edu.duration}
${edu.details}
`).join('\n')}

SKILLS
${polishedResume.skills.map(skill => `${skill.category}: ${skill.list.join(', ')}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${polishedResume.fullName || 'resume'}_polished.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStepIndicator = () => {
    const steps: { key: Step; label: string; icon: any }[] = [
      { key: 'template', label: 'Style', icon: <Sparkles size={14} /> },
      { key: 'personal', label: 'Info', icon: <User size={14} /> },
      { key: 'experience', label: 'Work', icon: <Briefcase size={14} /> },
      { key: 'education', label: 'Education', icon: <GraduationCap size={14} /> },
      { key: 'skills', label: 'Skills', icon: <Layout size={14} /> },
      { key: 'review', label: 'Review', icon: <FileText size={14} /> }
    ];

    if (step === 'result') return null;

    return (
      <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto px-4">
        {steps.map((s, idx) => {
          const isActive = step === s.key;
          const isPast = steps.findIndex(st => st.key === step) > idx;
          
          return (
            <div key={s.key} className="flex flex-col items-center gap-2 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-110' : 
                  isPast ? 'bg-green-500 text-white' : 'bg-bg-secondary text-text-muted border border-border'
                }`}
              >
                {isPast ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-text-muted opacity-50'}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-5 left-10 w-[calc(100vw/5-40px)] max-w-[80px] h-0.5 ${isPast ? 'bg-green-500/30' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const mappedData: ResumeData = {
    personalInfo: {
      fullName: polishedResume?.fullName || formData.fullName,
      email: polishedResume?.contact?.email || formData.email,
      phone: polishedResume?.contact?.phone || formData.phone,
      location: polishedResume?.contact?.location || formData.location,
      summary: polishedResume?.summary || formData.summary,
      website: formData.portfolio,
      profilePicture: formData.photoUrl
    },
    education: (polishedResume?.education || formData.education).map(edu => ({
      school: edu.school,
      degree: edu.degree,
      year: edu.duration || (edu as any).year,
      description: edu.details || (edu as any).description || ''
    })),
    experience: (polishedResume?.experience || formData.experience).map(exp => ({
      company: exp.company,
      role: exp.role,
      duration: exp.duration,
      description: (exp as any).highlights ? (exp as any).highlights.join('\n') : exp.description
    })),
    skills: polishedResume?.skills 
      ? polishedResume.skills.flatMap((s: any) => s.list) 
      : formData.skills.flatMap(s => s.list.split(',').map(v => v.trim()).filter(Boolean)),
    templateId: formData.templateId,
    colorTheme: formData.colorScheme
  };

  return (
    <div className={`${step === 'result' ? 'max-w-7xl' : 'max-w-5xl'} mx-auto pb-32`}>
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-gradient">
          Resume Nexus
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl font-medium italic opacity-80">
          Craft an industry-standard, ATS-optimized resume using our executive-level AI writer.
        </p>
      </header>

      {renderStepIndicator()}

      <div className={`${step === 'result' ? 'rounded-[2.5rem] border border-border/60 bg-transparent p-0 md:p-0 shadow-none' : 'card-modern rounded-[2.5rem] border border-border p-8 md:p-12'} relative overflow-hidden min-h-[500px] mb-12`}>
        {step !== 'result' && (
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        )}
        
        <AnimatePresence mode="wait">
          {step === 'template' && (
            <motion.div 
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Layout size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Aesthetic Selection</h2>
                  <p className="text-text-muted text-sm font-medium">Choose a template to begin (you can change this later)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {LAYOUTS.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setFormData({...formData, templateId: tpl.id})}
                    className={`rounded-2xl border-2 text-left transition-all flex flex-col overflow-hidden p-4 ${formData.templateId === tpl.id ? 'border-accent shadow-[0_0_30px_rgba(var(--color-accent),0.3)] scale-[1.02] ring-4 ring-accent/20 bg-accent/5' : 'border-border bg-bg-secondary hover:border-accent/50 hover:scale-[1.02]'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black uppercase tracking-wider text-sm text-text-primary">{tpl.name}</h3>
                      {formData.templateId === tpl.id && <CheckCircle2 size={16} className="text-accent" />}
                    </div>
                    <p className="text-[10px] text-text-muted font-medium">{tpl.description}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 bg-bg-secondary/50 p-6 rounded-2xl border border-border">
                <h3 className="font-black italic uppercase tracking-widest text-text-muted text-xs">Theme Color</h3>
                <div className="flex flex-wrap gap-4">
                  {THEMES.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setFormData({...formData, colorScheme: color.id})}
                      className={`w-12 h-12 rounded-full border-4 transition-all relative ${formData.colorScheme === color.id ? 'border-bg-primary shadow-xl scale-110 ring-2 ring-white/20' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: color.primary }}
                      title={color.name}
                    >
                      {formData.colorScheme === color.id && (
                        <CheckCircle2 size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => handleStepChange('personal')}
                  className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  Start Building <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'personal' && (
            <motion.div 
              key="personal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Personal Matrix</h2>
                  <p className="text-text-muted text-sm font-medium">Your primary identification data</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-bg-secondary p-6 rounded-2xl border border-border">
                <div className="relative w-24 h-32 bg-bg-primary border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden shrink-0 group">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-text-muted opacity-50 flex flex-col items-center">
                      <User size={24} className="mb-2" />
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2">Passport Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer text-white text-xs font-bold uppercase tracking-wider text-center p-2">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({...formData, photoUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="text-sm text-text-muted">
                  <h3 className="font-bold text-text-primary mb-1">Professional Headshot</h3>
                  <p className="mb-2">Upload a standard passport-size photo (35x45mm ratio recommended). This will be used in templates that support photos.</p>
                  {formData.photoUrl && (
                    <button 
                      onClick={() => setFormData({...formData, photoUrl: ''})}
                      className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input 
                      type="text"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-text-primary"
                      placeholder="e.g. Alexander Pierce"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Primary Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input 
                      type="email"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-text-primary"
                      placeholder="alex@nexus.ai"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Mobile Connection</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input 
                      type="tel"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-text-primary"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Base Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input 
                      type="text"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-text-primary"
                      placeholder="New York, NY"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60 flex items-center gap-2">
                  <ExternalLink size={12} /> Social Matrix
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0077B5] opacity-80">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </div>
                    <input 
                      type="url"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-sm text-text-primary"
                      placeholder="LinkedIn Profile"
                      value={formData.linkedin}
                      onChange={e => setFormData({...formData, linkedin: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary opacity-80">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                    <input 
                      type="url"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-sm text-text-primary"
                      placeholder="GitHub URL"
                      value={formData.github}
                      onChange={e => setFormData({...formData, github: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-80" size={18} />
                    <input 
                      type="url"
                      className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent/40 input-glow font-bold italic transition-all text-sm text-text-primary"
                      placeholder="Portfolio / Blog"
                      value={formData.portfolio}
                      onChange={e => setFormData({...formData, portfolio: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button 
                  onClick={() => handleStepChange('experience')}
                  className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'experience' && (
            <motion.div 
              key="experience"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Work Experience</h2>
                    <p className="text-text-muted text-sm font-medium">Historical professional deployments</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAutoFill}
                    disabled={loading}
                    className="bg-accent text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    <Sparkles size={16} /> 
                    {loading ? 'Generating...' : 'Auto-fill via AI'}
                  </button>
                  <button 
                    onClick={addExperience}
                    className="bg-accent/10 text-accent px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-accent/20 transition-all border border-accent/20"
                  >
                    <Plus size={16} /> Add Position
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="bg-bg-secondary/30 border border-border p-6 rounded-3xl relative group hover:border-accent/20 transition-all">
                    {formData.experience.length > 1 && (
                      <button 
                        onClick={() => removeExperience(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Company / Organization</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. Google"
                          value={exp.company}
                          onChange={e => {
                            const newExp = [...formData.experience];
                            newExp[idx].company = e.target.value;
                            setFormData({...formData, experience: newExp});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Role / Designation</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. Senior Software Engineer"
                          value={exp.role}
                          onChange={e => {
                            const newExp = [...formData.experience];
                            newExp[idx].role = e.target.value;
                            setFormData({...formData, experience: newExp});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Duration (From - To)</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. Jan 2021 - Present"
                          value={exp.duration}
                          onChange={e => {
                            const newExp = [...formData.experience];
                            newExp[idx].duration = e.target.value;
                            setFormData({...formData, experience: newExp});
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Key Responsibilities & Achievements (Draft)</label>
                      <textarea 
                        className="w-full h-32 bg-bg-secondary border border-border rounded-2xl p-6 outline-none focus:border-accent/40 font-medium italic resize-none text-text-primary"
                        placeholder="List your results here. Don't worry about wording yet, our AI will polish it."
                        value={exp.description}
                        onChange={e => {
                          const newExp = [...formData.experience];
                          newExp[idx].description = e.target.value;
                          setFormData({...formData, experience: newExp});
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button 
                  onClick={() => handleStepChange('personal')}
                  className="text-text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-text-primary transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => handleStepChange('education')}
                  className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'education' && (
            <motion.div 
              key="education"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Academic Matrix</h2>
                    <p className="text-text-muted text-sm font-medium">Your educational background</p>
                  </div>
                </div>
                <button 
                  onClick={addEducation}
                  className="bg-accent/10 text-accent px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-accent/20 transition-all border border-accent/20"
                >
                  <Plus size={16} /> Add Education
                </button>
              </div>

              <div className="space-y-6">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="bg-bg-secondary/30 border border-border p-6 rounded-3xl relative group hover:border-accent/20 transition-all">
                    {formData.education.length > 1 && (
                      <button 
                        onClick={() => removeEducation(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Institution Name</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. Stanford University"
                          value={edu.school}
                          onChange={e => {
                            const newEdu = [...formData.education];
                            newEdu[idx].school = e.target.value;
                            setFormData({...formData, education: newEdu});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Degree Type</label>
                        <select 
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic appearance-none cursor-pointer text-text-primary"
                          value={edu.degree}
                          onChange={e => {
                            const newEdu = [...formData.education];
                            newEdu[idx].degree = e.target.value;
                            setFormData({...formData, education: newEdu});
                          }}
                        >
                          {degreeTypes.map(type => (
                            <option key={type} value={type} className="bg-bg-secondary text-text-primary">{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Duration (From - To)</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. 2016 - 2020"
                          value={edu.duration}
                          onChange={e => {
                            const newEdu = [...formData.education];
                            newEdu[idx].duration = e.target.value;
                            setFormData({...formData, education: newEdu});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Details (GPA, Honors, Minor)</label>
                        <input 
                          type="text"
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic text-text-primary"
                          placeholder="e.g. 3.9 GPA, Cum Laude"
                          value={edu.details}
                          onChange={e => {
                            const newEdu = [...formData.education];
                            newEdu[idx].details = e.target.value;
                            setFormData({...formData, education: newEdu});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button 
                  onClick={() => handleStepChange('experience')}
                  className="text-text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-text-primary transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => handleStepChange('skills')}
                  className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'skills' && (
            <motion.div 
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Layout size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Skillset Inventory</h2>
                    <p className="text-text-muted text-sm font-medium">Your technical and soft capabilities</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFormData({...formData, skills: [...formData.skills, { category: '', list: '' }]})}
                  className="bg-accent/10 text-accent px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-accent/20 transition-all border border-accent/20"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="bg-bg-secondary/30 border border-border p-6 rounded-3xl relative group hover:border-accent/20 transition-all">
                    {formData.skills.length > 2 && (
                      <button 
                        onClick={() => {
                          const newSkills = [...formData.skills];
                          newSkills.splice(idx, 1);
                          setFormData({...formData, skills: newSkills});
                        }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Category Name</label>
                        <select 
                          className="w-full bg-bg-secondary border border-border rounded-xl py-3 px-6 outline-none focus:border-accent/40 font-bold italic appearance-none cursor-pointer text-text-primary"
                          value={skill.category}
                          onChange={e => {
                            const newSkills = [...formData.skills];
                            newSkills[idx].category = e.target.value;
                            setFormData({...formData, skills: newSkills});
                          }}
                        >
                          {skillCategories.map(cat => (
                            <option key={cat} value={cat} className="bg-bg-secondary text-text-primary">{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 italic opacity-60">Capabilities (Comma separated)</label>
                        <textarea 
                          className="w-full h-24 bg-bg-secondary border border-border rounded-xl p-4 outline-none focus:border-accent/40 font-medium italic resize-none text-text-primary"
                          placeholder="React, TypeScript, Node.js, AWS..."
                          value={skill.list}
                          onChange={e => {
                            const newSkills = [...formData.skills];
                            newSkills[idx].list = e.target.value;
                            setFormData({...formData, skills: newSkills});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button 
                  onClick={() => handleStepChange('education')}
                  className="text-text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-text-primary transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => handleStepChange('review')}
                  className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Final Review & Generation</h2>
                  <p className="text-text-muted text-sm font-medium">Ready to deploy AI optimization</p>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 p-8 rounded-3xl">
                <h3 className="font-black italic uppercase tracking-widest text-accent mb-4 text-sm">AI Configuration</h3>
                <ul className="space-y-4">
                  {[
                    "Improve wording professionally for corporate environment",
                    "Inject high-impact action verbs across all experiences",
                    "Optimize structure for ATS (Applicant Tracking Systems)",
                    "Rewrite results to be outcome-driven rather than task-driven"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium italic text-text-primary">
                      <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={16} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass rounded-3xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4 text-text-muted">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Note</span>
                </div>
                <p className="text-sm italic text-text-secondary">
                  The generation process may take 10-20 seconds. We'll analyze your input against thousands of top-tier resumes to ensure yours stands out.
                </p>
              </div>

              <div className="flex justify-between pt-8">
                <button 
                  onClick={() => handleStepChange('skills')}
                  className="text-text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-text-primary transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-accent text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/40 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Optimizing Matrix...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} /> Generate Polished Resume
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 'result' && polishedResume && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* ── Top action bar ──────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 border border-green-500/20">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-base font-black italic uppercase tracking-tight text-gradient leading-none">Resume Finalized</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Optimized &amp; Ready for Deployment</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleStepChange('personal')}
                    className="px-4 py-2 rounded-xl border border-border bg-bg-secondary text-[10px] font-black uppercase tracking-widest hover:bg-bg-hover transition-all">
                    Edit Input
                  </button>
                  <button onClick={handleDownloadText}
                    className="px-4 py-2 bg-bg-secondary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-bg-hover transition-all">
                    <FileText size={13} /> Export TXT
                  </button>
                  <button onClick={handleDownload} disabled={downloading}
                    className="px-5 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50">
                    {downloading
                      ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Preparing…</>
                      : <><Download size={13} /> Download PDF</>}
                  </button>
                </div>
              </div>

              {/* ── Reference layout: left sidebar + right full preview ── */}
              <div
                className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-8 rounded-[2rem] border border-border bg-slate-50 p-6 md:p-8 shadow-[0_24px_70px_rgba(2,6,23,0.22)]"
                style={{ minHeight: '78vh' }}
              >

                {/* LEFT: template + color controls (fixed 200px, scrollable) */}
                <aside className="no-print rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <div className="space-y-7">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-2">Resume Architect</p>
                      <h3 className="text-2xl font-serif font-bold leading-none text-slate-950">Refine your professional identity.</h3>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Layout Style</p>
                      <div className="grid grid-cols-2 gap-2">
                        {LAYOUTS.map(tpl => (
                          <button key={tpl.id}
                            onClick={() => setFormData({ ...formData, templateId: tpl.id })}
                            className={`min-h-10 rounded-xl border px-3 py-2 text-left text-[10px] font-bold transition-all
                              ${formData.templateId === tpl.id
                                ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'}`}
                          >{tpl.name}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Accent Color</p>
                      <div className="flex flex-wrap gap-3">
                        {THEMES.map(color => (
                          <button key={color.id}
                            onClick={() => setFormData({ ...formData, colorScheme: color.id })}
                            title={color.name}
                            style={{ backgroundColor: color.primary }}
                            className={`w-9 h-9 rounded-full border-4 transition-all ${formData.colorScheme === color.id ? 'border-white scale-110 ring-2 ring-slate-300 shadow-md' : 'border-white hover:scale-105'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setStep('personal')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-950 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800">
                      New Resume
                    </button>
                  </div>
                </aside>

                {/* RIGHT: fitted preview area */}
                <div
                  ref={setWrapperRef}
                  className="min-h-[640px] overflow-hidden rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-white p-6 flex items-center justify-center"
                  style={{ maxHeight: '78vh' }}
                >
                  {/*
                    The resume is always 794px wide.
                    We scale it by width and height so the whole page stays visible without scrollbars.
                  */}
                  <div style={{
                    width:  `${RESUME_W * resumeScale}px`,
                    height: `${RESUME_H * resumeScale}px`,
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <div
                      id="resume-scaler"
                      style={{
                        width: `${RESUME_W}px`,
                        height: `${RESUME_H}px`,
                        transform: `scale(${resumeScale})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0, left: 0
                      }}
                    >
                      <div
                        id="resume-final"
                        ref={resumeRef}
                        style={{
                          width: `${RESUME_W}px`,
                          minHeight: `${RESUME_H}px`,
                          background: 'white',
                          boxShadow: '0 30px 80px rgba(15,23,42,0.16)'
                        }}
                      >
                        <ResumePreview data={mappedData} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Print CSS: full A4, reset scale ─────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          html,
          body {
            width: auto !important;
            min-height: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Hide everything */
          body > * { visibility: hidden; }
          #resume-final, #resume-final * { visibility: visible; }
          /* Reset JS scale */
          #resume-scaler {
            width: 100% !important;
            height: auto !important;
            transform: none !important;
            position: static !important;
          }
          /* Fit inside Chrome's printable area instead of bleeding under its margins */
          #resume-final {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 190mm !important;
            min-height: 277mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}

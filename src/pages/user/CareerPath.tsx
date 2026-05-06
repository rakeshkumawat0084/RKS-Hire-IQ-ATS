import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  Target, 
  Map, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  ChevronRight,
  LineChart,
  GraduationCap,
  Wrench,
  Heart,
  Globe,
  IndianRupee,
  Clock,
  ExternalLink,
  Milestone,
  RotateCcw,
  Youtube,
  X,
  Maximize2,
  Landmark,
  Building2,
  ShieldCheck,
  Palette,
  Database,
  Atom
} from 'lucide-react';
import { generateCareerPath, CareerPathOutput } from '../../services/aiService';
import api from '../../lib/api';
import { useUserStore, useResumeStore } from '../../store';

export default function CareerPath() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);
  const [careerPathData, setCareerPathData] = useState<CareerPathOutput | null>(null);
  const [activeResource, setActiveResource] = useState<{ name: string; url: string; channel?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useUserStore();
  
  const [formData, setFormData] = useState({
    education: '',
    skills: '',
    interests: '',
    location: ''
  });

  // Auto-populate from global resume pipeline
  const { resumeSkills, resumeEducation, resumeRole, hasResume } = useResumeStore();
  useEffect(() => {
    if (hasResume) {
      setFormData(prev => ({
        education: resumeEducation || prev.education,
        skills: resumeSkills || prev.skills,
        interests: resumeRole ? `${resumeRole}, Professional Growth` : prev.interests,
        location: prev.location
      }));
    }
  }, [hasResume, resumeEducation, resumeRole, resumeSkills]);

  const OPTIONS = {
    education: [
      "B.Tech in Computer Science",
      "BCA (Bachelor of Computer Applications)",
      "MCA (Master of Computer Applications)",
      "B.Sc in Information Technology",
      "M.Tech in Software Engineering",
      "B.Com with Tally",
      "MBA in Marketing",
      "Diploma in Mechanical Engineering"
    ],
    skills: [
      "React, TypeScript, Tailwind CSS",
      "Python, Django, Machine Learning",
      "Node.js, Express, MongoDB",
      "Java, Spring Boot, Microservices",
      "UI/UX Design, Figma, Adobe XD",
      "Digital Marketing, SEO, SEM",
      "Data Analysis, SQL, Power BI",
      "AWS, Docker, Kubernetes"
    ],
    interests: [
      "AI & Machine Learning Research",
      "Full Stack Web Development",
      "Mobile App Development (Flutter/React Native)",
      "Cybersecurity & Ethical Hacking",
      "FinTech & Blockchain Technology",
      "E-commerce Strategy & Growth",
      "Cloud Architecture",
      "Game Development & AR/VR"
    ],
    locations: [
      "Bangalore, Karnataka",
      "Hyderabad, Telangana",
      "Pune, Maharashtra",
      "Mumbai, Maharashtra",
      "Gurugram, Haryana",
      "Noida, Uttar Pradesh",
      "Chennai, Tamil Nadu",
      "Remote (Work from Home)"
    ]
  };

  const professionCards = [
    {
      icon: <Atom size={22} />,
      title: 'AI Product Architect',
      tone: 'from-cyan-400 to-blue-600',
      focus: 'Model strategy, product thinking, automation systems',
      outlook: 'Fast growing'
    },
    {
      icon: <Database size={22} />,
      title: 'Data Intelligence Lead',
      tone: 'from-emerald-400 to-teal-700',
      focus: 'Analytics, BI, decision science, forecasting',
      outlook: 'High demand'
    },
    {
      icon: <ShieldCheck size={22} />,
      title: 'Cybersecurity Consultant',
      tone: 'from-amber-300 to-stone-700',
      focus: 'Risk audits, cloud security, compliance readiness',
      outlook: 'Resilient'
    },
    {
      icon: <Palette size={22} />,
      title: 'Experience Design Strategist',
      tone: 'from-rose-300 to-slate-800',
      focus: 'UX research, service design, visual systems',
      outlook: 'Premium roles'
    }
  ];

  const handleAppend = (field: 'skills' | 'interests', value: string) => {
    const current = formData[field];
    if (current.includes(value)) return;
    const newVal = current ? `${current}, ${value}` : value;
    setFormData({ ...formData, [field]: newVal });
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      try {
        const res = await api.get('/career-path');
        if (res.data) {
          setCareerPathData(res.data.result as CareerPathOutput);
          setFormData(res.data.formData);
          setShowResult(true);
        }
      } catch (error) {
        console.error('Failed to load career path history:', error);
      }
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            return prev;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.education || !formData.skills || !formData.interests || !formData.location) {
      setErrorMessage('Complete all four profile fields before generating your profession strategy.');
      return;
    }
    if (!user?.uid) {
      setErrorMessage('Your session is missing user details. Please sign in again before generating a strategy.');
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const result = await generateCareerPath({
        ...formData,
        userId: user.uid
      });
      setCareerPathData(result);
      setProgress(100);

      // Save to MongoDB
      await api.post('/career-path', {
        formData,
        result
      });

      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
      }, 500);
    } catch (error) {
      console.error("Failed to generate career path:", error);
      setIsGenerating(false);
      setProgress(0);
      setErrorMessage(error instanceof Error ? error.message : 'Career strategy generation failed. Please try again.');
    }
  };

  const openResource = (name: string, url: string, channel?: string) => {
    // Robust YouTube embed conversion
    let embedUrl = url;
    let targetUrl = url.trim();

    if (targetUrl && !targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      if (targetUrl.includes('youtube.com/') || targetUrl.includes('youtu.be/')) {
        let videoId = '';
        if (targetUrl.includes('watch?v=')) {
          const urlObj = new URL(targetUrl);
          videoId = urlObj.searchParams.get('v') || '';
        } else if (targetUrl.includes('youtu.be/')) {
          videoId = targetUrl.split('/').pop()?.split('?')[0] || '';
        } else if (targetUrl.includes('embed/')) {
          videoId = targetUrl.split('embed/')[1]?.split('?')[0] || '';
        }

        if (videoId) {
          // Use standard youtube.com/embed/ for best compatibility
          // Adding rel=0, modestbranding=1, and enablejsapi=1
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
        }
      }
    } catch (e) {
      console.warn("URL conversion failed for:", targetUrl);
    }
    setActiveResource({ name, url: embedUrl, channel });
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
        {/* Header Section */}
        <header className="relative overflow-hidden rounded-[1.5rem] border border-border bg-[#f8f5ef] text-slate-950 shadow-[0_24px_90px_rgba(15,23,42,0.14)]">
          <div className="absolute inset-0 professions-engraved-bg" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-6 lg:gap-8 p-5 sm:p-6 lg:p-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-slate-950 text-amber-200 flex items-center justify-center shadow-[10px_14px_30px_rgba(15,23,42,0.25)]">
                  <Compass size={21} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.28em] text-slate-600">Professions Atelier</span>
              </div>

              <div className="space-y-3 max-w-2xl">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-normal text-slate-950">
                  Choose a profession with quiet confidence.
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  A classic career advisory room for modern students and professionals. Compare fit, market direction, learning path, and role readiness before you commit.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-xl">
                {[
                  { label: 'Market Fit', value: '92%' },
                  { label: 'Role Lenses', value: '500+' },
                  { label: 'Roadmaps', value: '3x' }
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-slate-300/70 bg-white/60 p-3">
                    <div className="font-serif text-xl sm:text-2xl text-slate-950">{item.value}</div>
                    <div className="mt-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[300px] professions-3d-stage">
              <div className="absolute inset-x-8 bottom-3 h-16 rounded-[50%] bg-slate-950/15 blur-2xl" />
              <div className="professions-ledger-card">
                <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">Advisory Dossier</p>
                    <h2 className="mt-1 font-serif text-xl text-slate-950">Career Fit Index</h2>
                  </div>
                  <Landmark className="text-slate-700" size={24} />
                </div>
                <div className="mt-4 space-y-3">
                  {['Aptitude', 'Market Demand', 'Portfolio Proof'].map((label, index) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                        <span>{label}</span>
                        <span>{[88, 94, 76][index]}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-slate-950" style={{ width: `${[88, 94, 76][index]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {professionCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24, rotateX: 12 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`profession-float-card profession-float-card-${index + 1}`}
                >
                  <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${card.tone} text-white flex items-center justify-center shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm sm:text-base text-slate-950 leading-tight">{card.title}</h3>
                    <p className="mt-1 text-[10px] text-slate-600 leading-snug">{card.focus}</p>
                    <div className="mt-2 inline-flex rounded-full bg-slate-950 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-100">
                      {card.outlook}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResult && !isGenerating ? (
            <motion.div
              key="pre-gen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6 items-start"
            >
              {/* Input Form */}
              <div className="bg-[#fbfaf7] text-slate-950 p-5 sm:p-6 rounded-[1.25rem] border border-slate-300/80 shadow-[0_20px_70px_rgba(15,23,42,0.12)] space-y-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-slate-800" size={20} />
                  <h2 className="font-serif text-2xl text-slate-950 tracking-normal">Begin your profession brief</h2>
                </div>
                
                <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <GraduationCap size={14} className="text-slate-900" /> Academic Foundation
                    </label>
                    <input 
                      type="text"
                      required
                      list="education-options"
                      placeholder="e.g., B.Tech in Computer Science, 3rd Year"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="w-full bg-white/80 border border-slate-300 rounded-md px-4 py-3 text-slate-950 focus:border-slate-950 outline-none transition-all placeholder:text-slate-400"
                    />
                    <datalist id="education-options">
                      {OPTIONS.education.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {OPTIONS.education.slice(0, 3).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({...formData, education: opt})}
                          className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-slate-950 text-slate-500 hover:text-slate-950 transition-all"
                        >
                          + {opt.split('(')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Wrench size={14} className="text-slate-900" /> Core Competencies
                    </label>
                    <input 
                      type="text"
                      required
                      list="skills-options"
                      placeholder="e.g., React, Python, UI Design, Public Speaking"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full bg-white/80 border border-slate-300 rounded-md px-4 py-3 text-slate-950 focus:border-slate-950 outline-none transition-all placeholder:text-slate-400"
                    />
                    <datalist id="skills-options">
                      {OPTIONS.skills.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {OPTIONS.skills.slice(0, 5).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAppend('skills', opt)}
                          className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-slate-950 text-slate-500 hover:text-slate-950 transition-all"
                        >
                          + {opt.split(',')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Heart size={14} className="text-slate-900" /> Professional Interests
                    </label>
                    <input 
                      type="text"
                      required
                      list="interests-options"
                      placeholder="e.g., AI Research, FinTech, Creative Direction"
                      value={formData.interests}
                      onChange={(e) => setFormData({...formData, interests: e.target.value})}
                      className="w-full bg-white/80 border border-slate-300 rounded-md px-4 py-3 text-slate-950 focus:border-slate-950 outline-none transition-all placeholder:text-slate-400"
                    />
                    <datalist id="interests-options">
                      {OPTIONS.interests.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {OPTIONS.interests.slice(0, 5).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAppend('interests', opt)}
                          className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-slate-950 text-slate-500 hover:text-slate-950 transition-all"
                        >
                          + {opt.split('&')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Globe size={14} className="text-slate-900" /> Operational Base
                    </label>
                    <input 
                      type="text"
                      required
                      list="location-options"
                      placeholder="e.g., Bangalore, Remote, Pune"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-white/80 border border-slate-300 rounded-md px-4 py-3 text-slate-950 focus:border-slate-950 outline-none transition-all placeholder:text-slate-400"
                    />
                    <datalist id="location-options">
                      {OPTIONS.locations.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {OPTIONS.locations.slice(0, 3).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({...formData, location: opt})}
                          className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-slate-950 text-slate-500 hover:text-slate-950 transition-all"
                        >
                          + {opt.split(',')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="mt-2 px-8 py-4 bg-slate-950 text-amber-100 rounded-md font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-[0_18px_42px_rgba(15,23,42,0.18)] flex items-center justify-center gap-4"
                  >
                    Generate Strategic Roadmap <ArrowRight size={18} />
                  </button>
                </form>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    icon: <Target className="text-accent" />, 
                    title: "Best-Fit Matching", 
                    desc: "Our AI evaluates over 500+ career variables to suggest the paths where you have the highest probability of success."
                  },
                  { 
                    icon: <LineChart className="text-success" />, 
                    title: "Indian Market Focus", 
                    desc: "Updated with current hiring trends and salary scales specifically for major tech and creative hubs in India."
                  },
                  { 
                    icon: <Milestone className="text-accent" />, 
                    title: "End-to-End Roadmap", 
                    desc: "From your first tutorial to your first senior role, we map out every certification, project, and skill needed."
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-bg-card/80 p-5 sm:p-6 rounded-[1.25rem] border border-border flex gap-5 sm:gap-6 items-center hover:border-accent/20 transition-all group shadow-xl"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-text-primary italic">{item.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass p-10 sm:p-20 rounded-[2rem] sm:rounded-[3rem] border border-accent/20 flex flex-col items-center text-center space-y-12"
            >
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-border flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-accent/30 animate-ping opacity-20" />
                  <Loader2 className="absolute animate-spin text-accent" size={40} />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-[10px] font-black text-white rounded-full uppercase tracking-widest whitespace-nowrap">
                  AI ANALYZING
                </div>
              </div>
              
              <div className="space-y-4 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-text-primary italic">Generating Potential Realities</h2>
                <p className="text-text-secondary text-sm italic">Synthesizing market data, salary benchmarks, and roadmap protocols for your specific profile...</p>
              </div>

              <div className="w-full max-w-xl space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase text-accent tracking-[0.2em]">
                  <span>Building Roadmap</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-bg-hover rounded-full overflow-hidden border border-border">
                  <motion.div 
                    className="h-full bg-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              {/* Top Analysis Meta */}
              <div className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-border flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between">
                 <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                      <Award size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl sm:text-2xl font-black text-text-primary italic uppercase tracking-tight">Strategy Generated</h3>
                      <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest italic">UID: {careerPathData?.user_id} • {careerPathData?.generated_at}</p>
                   </div>
                 </div>
                 
                 <div className="flex flex-wrap justify-center lg:justify-end gap-6 sm:gap-8">
                    {[
                      { label: "Status", value: careerPathData?.admin_meta.status, color: "text-success" },
                      { label: "AI Model", value: "Gemini 2.5 Flash", color: "text-accent" },
                      { label: "Region", value: careerPathData?.location, color: "text-text-primary" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1 text-right">
                         <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">{item.label}</p>
                         <p className={`font-black italic ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Career Options */}
              <div className="grid grid-cols-1 gap-24">
                {careerPathData?.careers.map((career, index) => (
                  <div key={index} className="space-y-12">
                     <div className="flex flex-col lg:flex-row gap-12 items-start">
                       <div className="lg:w-1/3 space-y-8">
                          <div className="space-y-4">
                            <div className="text-accent font-black text-4xl sm:text-6xl italic opacity-10">0{index+1}</div>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary italic -mt-6 sm:-mt-8">{career.title}</h2>
                            <div className="p-4 sm:p-6 bg-bg-secondary/30 rounded-2xl sm:rounded-3xl border border-border italic text-text-secondary leading-relaxed text-sm sm:base">
                              "{career.why_this_career}"
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                             <div className="p-6 bg-success/5 border border-success/10 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-success tracking-widest mb-2 flex items-center gap-2">
                                  <IndianRupee size={12} /> Salary Benchmark (India)
                                </p>
                                <p className="text-2xl font-black text-text-primary italic">{career.salary_in_india}</p>
                             </div>
                             <div className="p-6 bg-accent/5 border border-accent/10 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-2 flex items-center gap-2">
                                  <TrendingUp size={12} /> Future Outlook
                                </p>
                                <p className="text-sm font-bold text-text-secondary italic leading-snug">{career.future_scope}</p>
                             </div>
                          </div>
                          
                          {/* YouTube Classes */}
                          <div className="space-y-4 lg:hidden">
                             <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                               <Youtube size={14} className="text-red-500" /> Top YouTube Classes
                             </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {career.youtube_resources.map((yt, i) => (
                                     <button
                                       key={i}
                                       onClick={() => openResource(yt.title, yt.url, yt.channelName)}
                                       className="flex flex-col gap-3 p-5 bg-bg-hover border border-border rounded-2xl hover:border-red-500/40 transition-all group text-left w-full overflow-hidden"
                                     >
                                       <div className="text-[10px] font-black uppercase text-red-500 tracking-widest border-b border-red-500/10 pb-2 mb-2 w-full">
                                         {yt.channelName || 'YouTube Class'}
                                       </div>
                                       <div className="flex items-start gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                           <Youtube size={16} />
                                         </div>
                                         <h5 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-3 italic leading-tight break-words">
                                           {yt.title}
                                         </h5>
                                       </div>
                                     </button>
                                   ))}
                                </div>
                          </div>
                       </div>

                       <div className="flex-1 w-full space-y-10">
                          <div className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/10 space-y-12">
                             <h3 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] flex items-center gap-3">
                               <Milestone size={16} /> Phase-Based Roadmap
                             </h3>

                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative text-center sm:text-left">
                               {[
                                 { label: "Beginner", items: career.roadmap.beginner_level, color: "text-text-primary" },
                                 { label: "Intermediate", items: career.roadmap.intermediate_level, color: "text-accent" },
                                 { label: "Advanced", items: career.roadmap.advanced_level, color: "text-success" }
                               ].map((phase, i) => (
                                 <div key={i} className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                       <div className={`w-2 h-2 rounded-full ${phase.color.replace('text-', 'bg-')}`} />
                                       <span className={`text-xs font-black uppercase tracking-widest ${phase.color}`}>{phase.label}</span>
                                    </div>
                                    <div className="space-y-3">
                                       {phase.items.map((item, idx) => (
                                         <div key={idx} className="flex justify-center sm:justify-start gap-3 text-sm italic text-text-secondary">
                                            <ChevronRight size={14} className="mt-1 flex-shrink-0 text-text-muted hidden sm:block" />
                                            <span>{item}</span>
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                               ))}
                             </div>

                             <div className="pt-10 border-t border-border space-y-8">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Required Skillset</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {career.required_skills.map(skill => (
                                      <span key={skill} className="px-5 py-2 bg-bg-hover border border-border rounded-xl text-[10px] font-black text-text-secondary uppercase tracking-tighter">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                     <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Free Learning Ecosystem</h4>
                                     <div className="space-y-2">
                                        {career.free_resources.map((res, i) => (
                                          <button 
                                            key={i} 
                                            onClick={() => openResource(res.name, res.url)}
                                            className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold text-accent italic hover:text-text-primary cursor-pointer transition-colors text-left w-full sm:w-auto"
                                          >
                                            <ExternalLink size={12} className="flex-shrink-0" /> <span className="line-clamp-1">{res.name}</span>
                                          </button>
                                        ))}
                                     </div>
                                  </div>
                                  <div className="space-y-4">
                                     <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Market Opportunities</h4>
                                     <div className="space-y-2">
                                        {career.job_opportunities.map((op, i) => (
                                          <div key={i} className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold text-success italic">
                                            <CheckCircle2 size={12} className="flex-shrink-0" /> {op}
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                </div>
                             </div>

                             {/* YouTube Classes Desk row */}
                             <div className="hidden lg:block pt-10 border-t border-border space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                  <Youtube size={14} className="text-red-500" /> Professional YouTube Classes
                                 </h4>
                                 <div className="grid grid-cols-3 gap-4">
                                    {career.youtube_resources.map((yt, i) => (
                                      <button
                                        key={i}
                                        onClick={() => openResource(yt.title, yt.url, yt.channelName)}
                                        className="flex flex-col gap-3 p-5 bg-bg-hover border border-border rounded-2xl hover:border-red-500/40 transition-all group text-left h-full overflow-hidden"
                                      >
                                        <div className="text-[10px] font-black uppercase text-red-500 tracking-widest border-b border-red-500/10 pb-2 mb-2 w-full">
                                          {yt.channelName || 'Official Channel'}
                                        </div>
                                        <div className="flex items-start gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                            <Youtube size={20} />
                                          </div>
                                          <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors line-clamp-3 italic leading-tight break-words">
                                            {yt.title}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                 </div>
                             </div>
                          </div>
                       </div>
                     </div>
                     {index < careerPathData.careers.length - 1 && <div className="h-px w-full bg-white/5" />}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 pt-12">
                 <button 
                   onClick={() => setShowResult(false)}
                   className="group px-12 py-5 bg-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-accent-soft transition-all shadow-2xl flex items-center gap-4"
                 >
                   Re-Generate Career Analysis <RotateCcw size={18} />
                 </button>
                 <p className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">Strategy v1.0 • Verified for Admin Panel Storage</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resource Viewer Modal */}
      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveResource(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl aspect-video bg-bg-card border border-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-bg-card/95 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Globe size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 mb-1">
                      {activeResource.channel && (
                        <div className="flex">
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase rounded-sm italic whitespace-nowrap">
                            {activeResource.channel}
                          </span>
                        </div>
                      )}
                      <h3 className="text-sm sm:text-base md:text-lg font-black text-text-primary italic leading-tight break-words">{activeResource.name}</h3>
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest truncate italic opacity-60">{activeResource.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={activeResource.url.replace('embed/', 'watch?v=')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 text-text-muted hover:text-text-primary transition-colors hidden sm:block"
                    title="Open in new tab"
                  >
                    <Maximize2 size={20} />
                  </a>
                  <button 
                    onClick={() => setActiveResource(null)}
                    className="p-3 text-text-muted hover:text-text-primary transition-colors hover:rotate-90 transition-transform"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-black relative">
                <iframe 
                  src={activeResource.url} 
                  className="w-full h-full border-none"
                  title="Resource Viewer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

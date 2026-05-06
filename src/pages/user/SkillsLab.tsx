import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Code, 
  Database, 
  Globe, 
  Cpu, 
  PenTool, 
  Play, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  BrainCircuit, 
  Trophy, 
  Target, 
  Compass,
  Milestone,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Terminal
} from 'lucide-react';
import { generateSkillsLab, SkillsLabOutput } from '../../services/aiService';
import api from '../../lib/api';
import { useUserStore, useResumeStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export default function SkillsLab() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillsLabData, setSkillsLabData] = useState<SkillsLabOutput | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(true);
  const { user } = useUserStore();
  const { resumeSkills, resumeEducation, resumeRole, hasResume } = useResumeStore();

  const [formData, setFormData] = useState({
    education: '',
    skills: '',
    interests: '',
    location: ''
  });

  // Auto-populate from global resume pipeline
  useState(() => {
    if (hasResume) {
      setFormData(prev => ({
        ...prev,
        skills: resumeSkills || prev.skills,
        education: resumeEducation || prev.education,
        interests: resumeRole ? `${resumeRole}, Career Growth` : prev.interests,
      }));
    }
  });

  // Load existing data and enrollments
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        // Load latest generation result
        const res = await api.get('/skills-lab');
        if (res.data) {
          setSkillsLabData(res.data.result as SkillsLabOutput);
          setFormData(res.data.formData);
          setShowInput(false);
        }

        // Load enrollments
        const enrollRes = await api.get('/enrollments');
        const enrolledIds = enrollRes.data.map((enroll: any) => enroll.courseId);
        setEnrolledCourses(enrolledIds);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const result = await generateSkillsLab(formData);
      setSkillsLabData(result);
      setShowInput(false);

      // Save to MongoDB
      await api.post('/skills-lab', {
        formData,
        result
      });
    } catch (error) {
      console.error("Skills Lab generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    if (!enrolledCourses.includes(courseId)) {
      if (!user) {
        alert("Please sign in to enroll");
        return;
      }

      setEnrolledCourses(prev => [...prev, courseId]);

      try {
        await api.post('/enrollments', {
          courseId,
          courseTitle
        });
      } catch (error) {
        console.error('Failed to enroll:', error);
      }
    }
  };

  const OPTIONS = {
    education: ["B.Tech CS", "BCA", "MCA", "M.Tech", "Self-Taught", "B.Sc IT", "Diploma", "Other"],
    skills: ["React", "TypeScript", "Node.js", "Python", "MongoDB", "Java", "Tailwind CSS", "Next.js", "AWS", "Docker"],
    interests: ["Full Stack", "AI/ML", "DevOps", "Cybersecurity", "Blockchain", "Data Science", "App Dev", "UI/UX"],
    locations: ["Bangalore", "Pune", "Hyderabad", "Delhi/NCR", "Mumbai", "Chennai", "Remote"]
  };

  const handleAppend = (field: 'skills' | 'interests', value: string) => {
    const current = formData[field];
    if (current.includes(value)) return;
    const newVal = current ? `${current}, ${value}` : value;
    setFormData({ ...formData, [field]: newVal });
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-40">
      <AnimatePresence mode="wait">
        {showInput ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            {/* Hero Header */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="w-16 h-16 rounded-[1.5rem] bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                  <BrainCircuit size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent italic">Personalized Academy</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary italic">
                AI Skills <span className="text-text-muted not-italic">Lab</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl italic">
                Our Senior Architects utilize Gemini to craft a learning platform tailored specifically to your profile. Industry-standard roadmaps, projects, and certifications.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form Card */}
              <div className="glass p-6 sm:p-10 rounded-[2rem] border border-border space-y-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-accent" size={20} />
                  <h2 className="text-xl font-black text-text-primary italic uppercase tracking-wider">Learning Context</h2>
                </div>

                <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-4 italic px-2 bg-bg-main relative z-10 w-fit">Current Education</label>
                    <input 
                      required
                      list="education-options"
                      placeholder="e.g., BCA Final Year, Self-Taught"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="w-full bg-bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-text-primary focus:border-accent/40 outline-none transition-all italic"
                    />
                    <datalist id="education-options">
                      {OPTIONS.education.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {OPTIONS.education.slice(0, 4).map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData({...formData, education: opt})} className="text-[9px] font-bold px-3 py-1 rounded-full bg-bg-secondary/50 border border-border hover:border-accent/40 text-text-muted hover:text-text-primary transition-all italic">+ {opt}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-4 italic px-2 bg-bg-main relative z-10 w-fit">Your Skills</label>
                    <input 
                      required
                      list="skills-options"
                      placeholder="e.g., HTML, CSS, JavaScript"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full bg-bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-text-primary focus:border-accent/40 outline-none transition-all italic"
                    />
                    <datalist id="skills-options">
                      {OPTIONS.skills.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {OPTIONS.skills.slice(0, 5).map(opt => (
                        <button key={opt} type="button" onClick={() => handleAppend('skills', opt)} className="text-[9px] font-bold px-3 py-1 rounded-full bg-bg-secondary/50 border border-border hover:border-accent/40 text-text-muted hover:text-text-primary transition-all italic">+ {opt}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-4 italic px-2 bg-bg-main relative z-10 w-fit">Learning Goals</label>
                    <input 
                      required
                      list="interests-options"
                      placeholder="e.g., Scalability, Security, AI Agents"
                      value={formData.interests}
                      onChange={(e) => setFormData({...formData, interests: e.target.value})}
                      className="w-full bg-bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-text-primary focus:border-accent/40 outline-none transition-all italic"
                    />
                     <datalist id="interests-options">
                      {OPTIONS.interests.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {OPTIONS.interests.slice(0, 5).map(opt => (
                        <button key={opt} type="button" onClick={() => handleAppend('interests', opt)} className="text-[9px] font-bold px-3 py-1 rounded-full bg-bg-secondary/50 border border-border hover:border-accent/40 text-text-muted hover:text-text-primary transition-all italic">+ {opt}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-4 italic px-2 bg-bg-main relative z-10 w-fit">Location</label>
                    <input 
                      required
                      list="location-options"
                      placeholder="e.g., Bangalore, Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-text-primary focus:border-accent/40 outline-none transition-all italic"
                    />
                     <datalist id="location-options">
                      {OPTIONS.locations.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {OPTIONS.locations.slice(0, 4).map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData({...formData, location: opt})} className="text-[9px] font-bold px-3 py-1 rounded-full bg-bg-secondary/50 border border-border hover:border-accent/40 text-text-muted hover:text-text-primary transition-all italic">+ {opt}</button>
                      ))}
                    </div>
                  </div>

                  <button 
                    disabled={isGenerating}
                    className="mt-4 px-10 py-5 bg-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-accent-soft transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <><Loader2 className="animate-spin" size={18} /> INITIALIZING ARCHITECTS...</>
                    ) : (
                      <><Compass size={18} /> POWER UP SKILLS LAB <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              </div>

              {/* Info Column */}
              <div className="grid grid-cols-1 gap-6">
                {[
                  { title: "Course Generation", desc: "Enterprise-grade module structures based on your unique skill gaps.", icon: <BookOpen className="text-accent" /> },
                  { title: "Personalized Roadmap", desc: "Beginner to Advanced progression synced with market demands.", icon: <Milestone className="text-accent" /> },
                  { title: "Certificate System", desc: "Unique verifiable IDs automatically generated upon course completion.", icon: <Trophy className="text-secondary" /> }
                ].map((item, i) => (
                  <div key={i} className="glass p-8 rounded-[2.5rem] border border-border flex gap-8 items-center hover:border-accent/20 transition-all group">
                    <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-text-primary italic">{item.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : skillsLabData && (
          <motion.div
            key="result-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-16"
          >
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-between glass p-8 sm:p-12 rounded-[2.5rem] border border-border">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success animate-pulse">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-text-primary italic uppercase tracking-tight">Personalized Academy Ready</h2>
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest italic pt-1">Architecture v4.2 • Verified for {skillsLabData.user_profile.education}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInput(true)}
                className="px-8 py-3 bg-bg-hover border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-bg-secondary transition-all"
              >
                Change Context
              </button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 gap-12">
              {skillsLabData.recommended_courses.map((course, idx) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="glass p-8 sm:p-12 rounded-[3.5rem] border border-border hover:border-accent/30 transition-all relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12">
                      {/* Course Meta */}
                      <div className="lg:w-1/3 space-y-8">
                        <div className="space-y-4">
                          <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-lg">{course.category}</span>
                          <h3 className="text-3xl font-black text-text-primary italic leading-tight">{course.title}</h3>
                          <div className="flex items-center gap-6 text-[10px] font-black text-text-muted uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={12} className="text-accent" /> {course.duration}</span>
                            <span className="flex items-center gap-1"><Target size={12} className="text-secondary" /> {course.level}</span>
                          </div>
                        </div>

                        <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 italic text-sm text-text-secondary leading-relaxed">
                          "{course.why_this_course}"
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Skills Gained</h4>
                          <div className="flex flex-wrap gap-2">
                            {course.skills_gained.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-bg-hover border border-border rounded-full text-[9px] font-bold text-text-primary italic">{skill}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {enrolledCourses.includes(course.course_id) ? (
                            <>
                              <button 
                                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 bg-success/10 text-success border border-success/20 cursor-default"
                              >
                                <CheckCircle2 size={16} /> Enrolled
                              </button>
                              <button 
                                onClick={() => navigate(`/app/lab/${encodeURIComponent(course.title)}`)}
                                className="w-full py-5 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent-soft transition-all flex items-center justify-center gap-3 shadow-xl"
                              >
                                <Terminal size={16} /> Enter Practice Lab
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleEnroll(course.course_id, course.title)}
                              className="w-full py-5 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent-soft transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                              <Play size={16} fill="currentColor" /> Enroll & Unlock Labs
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Course Roadmap */}
                      <div className="flex-1 space-y-12 bg-bg-hover p-8 sm:p-12 rounded-[2.5rem] border border-border">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2">
                             <Milestone size={14} /> Modular Roadmap
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { label: "Beginner", items: course.roadmap.beginner, color: "text-text-primary" },
                            { label: "Intermediate", items: course.roadmap.intermediate, color: "text-accent" },
                            { label: "Advanced", items: course.roadmap.advanced, color: "text-success" }
                          ].map((phase, i) => (
                            <div key={i} className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${phase.color.replace('text-', 'bg-')}`} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${phase.color}`}>{phase.label}</span>
                              </div>
                              <div className="space-y-3">
                                {phase.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-3 items-start group/item">
                                    <ChevronRight size={12} className="mt-1 text-text-muted flex-shrink-0 group-hover/item:text-accent transition-colors" />
                                    <span className="text-xs text-text-secondary italic group-hover/item:text-text-primary transition-colors">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Projects */}
                        <div className="pt-8 border-t border-border space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Real-World Projects</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {course.projects.map((proj, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-bg-hover border border-border rounded-2xl">
                                   <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                      {i === 0 ? <Code size={18} /> : <Database size={18} />}
                                   </div>
                                   <div className="space-y-0.5">
                                      <span className="text-[10px] font-black uppercase text-accent/60">Module {i+1}</span>
                                      <p className="text-xs font-bold text-text-primary italic leading-tight">{proj}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Admin & System Overview (Static Context) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass p-10 rounded-[3rem] border border-border space-y-6">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-accent" />
                    <h3 className="text-xl font-black text-text-primary italic uppercase">Certification System</h3>
                  </div>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    Personalized certificates are generated with a unique cryptographic hash upon 100% completion. Verified fields include: {Array.isArray(skillsLabData.certificate_system.certificate_fields) ? skillsLabData.certificate_system.certificate_fields.join(", ") : "Full Name, Course Title, Completion Date"}.
                  </p>
               </div>
               <div className="glass p-10 rounded-[3rem] border border-border space-y-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-secondary" />
                    <h3 className="text-xl font-black text-text-primary italic uppercase">Admin Analytics</h3>
                  </div>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    This instance is synchronized with a real-time admin panel tracking course management, user progress, and predictive learning analytics.
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

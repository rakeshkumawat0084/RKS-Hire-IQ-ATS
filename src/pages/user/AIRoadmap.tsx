import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  Clock,
  Compass,
  Target,
  ChevronDown,
  Briefcase,
  ExternalLink,
  BookOpen,
  Milestone
} from 'lucide-react';
import { generateRoadmap, RoadmapOutput } from '../../services/aiService';
import { useUserStore } from '../../store';

export default function AIRoadmap() {
  const { user } = useUserStore();
  const [roadmapData, setRoadmapData] = useState<RoadmapOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Frontend Developer');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const ROLES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Engineer',
    'Mobile App Developer',
    'AI & Machine Learning Engineer',
    'Data Scientist',
    'DevOps Engineer',
    'Cybersecurity Analyst',
    'Cloud Architect',
    'Product Manager',
    'UI/UX Designer',
    'Blockchain Developer',
    'Game Developer',
    'Embedded Systems Engineer',
    'Digital Marketing Specialist',
    'Business Analyst',
    'Software Tester (QA)',
    'Type Your Own Subject...'
  ];

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const target = (showCustom && customSubject) ? customSubject : role;
      if (target === 'Type Your Own Subject...' && !customSubject) {
        alert('Please type a subject first');
        setLoading(false);
        return;
      }
      const data = await generateRoadmap({
        education: user?.education || 'B.Tech CS',
        skills: Array.isArray(user?.skills) ? user.skills.join(', ') : 'React, TypeScript',
        interests: Array.isArray(user?.interests) ? user.interests.join(', ') : 'Web Development',
        location: user?.location || 'India',
        goal: target
      });
      setRoadmapData(data);
      localStorage.setItem('rks-personalized-roadmap-v2', JSON.stringify(data));
      localStorage.setItem('rks-last-target', target);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('rks-personalized-roadmap-v2');
    if (saved) {
      setRoadmapData(JSON.parse(saved));
      const lastTarget = localStorage.getItem('rks-last-target');
      if (lastTarget) {
        if (ROLES.includes(lastTarget)) {
          setRole(lastTarget);
        } else {
          setRole('Type Your Own Subject...');
          setCustomSubject(lastTarget);
          setShowCustom(true);
        }
      }
    }
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Sparkles className="text-accent" size={32} />
            Skill Roadmap
          </h1>
          <p className="text-text-secondary text-lg">AI-powered learning paths optimized for your professional growth.</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative group min-w-[240px]">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} />
              <select 
                value={showCustom ? 'Type Your Own Subject...' : role}
                onChange={(e) => {
                  if (e.target.value === 'Type Your Own Subject...') {
                    setShowCustom(true);
                  } else {
                    setShowCustom(false);
                    setRole(e.target.value);
                  }
                }}
                className="w-full bg-bg-card border border-border rounded-xl pl-11 pr-10 py-3 outline-none focus:border-accent/40 text-sm font-semibold text-text-primary appearance-none cursor-pointer hover:bg-bg-hover transition-all"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            </div>

            {showCustom && (
              <motion.input
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                type="text"
                placeholder="Enter Subject (e.g. Flutter, Rust, SEO)"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="bg-bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-accent/40 text-sm font-semibold text-text-primary min-w-[240px] shadow-inner"
              />
            )}

            <button 
              onClick={fetchRoadmap}
              disabled={loading}
              className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              {roadmapData ? 'Regenerate' : 'Generate Roadmap'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
         <div className="glass p-8 rounded-[2rem] border border-white/5 flex gap-5 items-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Compass size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Target</div>
            <div className="text-lg font-bold tracking-tight uppercase truncate max-w-[150px]">
              {showCustom && customSubject ? customSubject : role}
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex gap-5 items-center">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <Target size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Readiness</div>
            <div className="text-lg font-bold tracking-tight uppercase">
              {roadmapData?.user_analysis.level || 'Assessment'}
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex gap-5 items-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Estimate</div>
            <div className="text-lg font-bold tracking-tight uppercase">8-12 Weeks</div>
          </div>
        </div>
      </div>

      {roadmapData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 border border-accent/10 rounded-[2.5rem] p-10 mb-12"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-3">
            <Sparkles className="text-accent" />
            AI Profile Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-text-secondary leading-relaxed">
                {roadmapData.user_analysis.reason}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Suggested Domain</div>
                <div className="text-text-primary font-bold">{roadmapData.user_analysis.suggested_domain}</div>
              </div>
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Expected Salary (India)</div>
                <div className="text-text-primary font-bold">{roadmapData.career_outcome.expected_salary_india}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass p-8 md:p-16 rounded-[4rem] border border-border relative overflow-hidden bg-gradient-to-br from-bg-card to-transparent shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none rotate-12 scale-150">
          <Sparkles size={400} />
        </div>

        <div className="space-y-16 relative z-10">
          <AnimatePresence mode="popLayout">
            {roadmapData ? (
              roadmapData.roadmap.map((step, i) => (
                <motion.div 
                  key={step.phase + i}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 md:gap-12 items-start group"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all shadow-xl bg-bg-secondary border border-border text-text-muted group-hover:border-accent/40`}>
                      <span className="text-xl font-bold text-text-primary">{i + 1}</span>
                    </div>
                    {i !== roadmapData.roadmap.length - 1 && (
                      <div className={`w-0.5 min-h-[150px] my-4 rounded-full bg-border shadow-inner`}></div>
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className={`text-2xl md:text-3xl font-bold tracking-tight text-text-primary`}>
                        {step.phase}
                      </h3>
                      <span className="text-[10px] font-bold px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20 text-accent uppercase tracking-widest">
                        {step.duration}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
                          <Compass size={14} className="text-accent" />
                          Topics to Master
                        </div>
                        <ul className="space-y-2">
                          {step.topics.map((t, idx) => (
                            <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
                          <CheckCircle size={14} className="text-success" />
                          Skills Gained
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {step.skills_learned.map((s, idx) => (
                            <span key={idx} className="text-[10px] bg-success/5 border border-success/10 text-success-foreground px-2 py-1 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                          <Milestone size={14} className="text-accent" />
                          Practical Projects
                        </div>
                        {step.projects.map((p, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm text-text-secondary">
                            {p}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                          <BookOpen size={14} className="text-purple-500" />
                          Curated Resources
                        </div>
                        {step.resources.map((res, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-sm text-text-secondary">
                            {res}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 text-text-muted">
                <Compass className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Click "Generate Roadmap" to create your personalized path.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {roadmapData && (
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="glass p-10 rounded-[3rem] border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-6">Career Outcome</h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-text-muted uppercase mb-3">Job Roles</div>
                <div className="flex flex-wrap gap-2">
                  {roadmapData.career_outcome.job_roles.map((role, i) => (
                    <span key={i} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-text-muted uppercase mb-3">Future Scope</div>
                <p className="text-sm text-text-secondary italic">"{roadmapData.career_outcome.future_scope}"</p>
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-6">AI Next Step Suggestions</h3>
            <div className="space-y-4">
              {roadmapData.ai_next_step_suggestions.map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-bg-secondary p-4 rounded-2xl border border-border">
                  <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-text-secondary italic">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

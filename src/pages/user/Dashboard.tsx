import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store';
import { useState, useEffect, type ReactNode } from 'react';
import api from '../../lib/api';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  Globe,
  GraduationCap,
  Layers3,
  Mic2,
  PanelsTopLeft,
  Route,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const momentumData = [
  { name: 'Mon', score: 42, prep: 34 },
  { name: 'Tue', score: 54, prep: 48 },
  { name: 'Wed', score: 58, prep: 51 },
  { name: 'Thu', score: 68, prep: 62 },
  { name: 'Fri', score: 74, prep: 70 },
  { name: 'Sat', score: 82, prep: 76 },
  { name: 'Sun', score: 88, prep: 84 },
];

const radarData = [
  { skill: 'ATS', value: 68 },
  { skill: 'Interview', value: 48 },
  { skill: 'Skills', value: 62 },
  { skill: 'Portfolio', value: 44 },
  { skill: 'Market', value: 72 },
];

const pathwayBars = [
  { name: 'Resume', value: 68, color: '#6366f1' },
  { name: 'Career', value: 54, color: '#14b8a6' },
  { name: 'Proof', value: 42, color: '#f59e0b' },
  { name: 'Network', value: 38, color: '#ec4899' },
];

type AppNode = {
  label: string;
  path: string;
  icon: ReactNode;
  status: string;
  angle: number;
  accent: string;
};

const appNodes: AppNode[] = [
  { label: 'Resume Analyzer', path: '/app/resume', icon: <FileText size={18} />, status: 'Find ATS gaps', angle: 0, accent: 'text-blue-400' },
  { label: 'Resume Maker', path: '/app/resume-maker', icon: <Sparkles size={18} />, status: 'Build polished proof', angle: 40, accent: 'text-cyan-400' },
  { label: 'Mock Interview', path: '/app/interview', icon: <Mic2 size={18} />, status: 'Practice answers', angle: 80, accent: 'text-violet-400' },
  { label: 'Career Path', path: '/app/career', icon: <Compass size={18} />, status: 'Choose direction', angle: 120, accent: 'text-emerald-400' },
  { label: 'Skills Lab', path: '/app/skills', icon: <GraduationCap size={18} />, status: 'Close skill gaps', angle: 160, accent: 'text-lime-400' },
  { label: 'AI Roadmap', path: '/app/roadmap', icon: <Route size={18} />, status: 'Plan the climb', angle: 200, accent: 'text-orange-400' },
  { label: 'Portfolio Builder', path: '/app/portfolio', icon: <PanelsTopLeft size={18} />, status: 'Show your work', angle: 240, accent: 'text-pink-400' },
  { label: 'Company Insights', path: '/app/insights', icon: <Globe size={18} />, status: 'Pick targets', angle: 280, accent: 'text-sky-400' },
  { label: 'Networking', path: '/app/networking', icon: <Users size={18} />, status: 'Open doors', angle: 320, accent: 'text-fuchsia-400' },
];

export default function UserDashboard() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [realStats, setRealStats] = useState<any>(null);
  const [activities, setActivities] = useState([
    { id: 1, title: 'Resume Analyzed', time: '2 hours ago', status: 'Success', type: 'resume', path: '/app/resume' },
    { id: 2, title: 'Interview Completed', time: '5 hours ago', status: '8.5/10', type: 'interview', path: '/app/interview' },
    { id: 3, title: 'Target List Opened', time: 'Yesterday', status: 'Company Insights', type: 'job', path: '/app/insights' },
    { id: 4, title: 'Profile Updated', time: '2 days ago', status: 'Updated', type: 'profile', path: '/app/profile' },
  ]);

  const handleDeleteActivity = (id: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resumes, interviews] = await Promise.all([
          api.get('/resumes'),
          api.get('/interviews'),
        ]);

        const avgScore = resumes.data.length > 0
          ? Math.round(resumes.data.reduce((acc: number, r: any) => acc + (r.score || 0), 0) / resumes.data.length)
          : 0;

        setRealStats({
          avgScore,
          resumeCount: resumes.data.length,
          interviewCount: interviews.data.length,
          jobMatches: 48,
          profileStrength: user?.profileStrength || 25,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchStats();
  }, [user]);

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Architect';
  const avgScore = realStats?.avgScore || 0;
  const interviewCount = realStats?.interviewCount || 0;
  const profileStrength = realStats?.profileStrength || 25;
  const jobMatches = realStats?.jobMatches || 48;
  const readiness = Math.round((avgScore * 0.35) + (Math.min(interviewCount, 5) * 8) + (profileStrength * 0.25) + 18);
  const nextMove = avgScore < 60 ? 'Analyze resume' : interviewCount < 2 ? 'Run mock interview' : profileStrength < 70 ? 'Complete profile' : 'Target companies';
  const nextPath = avgScore < 60 ? '/app/resume' : interviewCount < 2 ? '/app/interview' : profileStrength < 70 ? '/app/profile' : '/app/insights';

  const summaryCards = [
    { label: 'Readiness', value: `${Math.min(readiness, 96)}%`, note: 'Career launch signal', icon: <Target size={20} />, path: nextPath },
    { label: 'ATS Average', value: `${avgScore}%`, note: `${realStats?.resumeCount || 0} resumes tracked`, icon: <FileText size={20} />, path: '/app/resume' },
    { label: 'Interview Loops', value: interviewCount.toString(), note: 'Practice rounds finished', icon: <Mic2 size={20} />, path: '/app/interview' },
    { label: 'Market Matches', value: jobMatches.toString(), note: 'Live target signals', icon: <Briefcase size={20} />, path: '/app/insights' },
  ];

  return (
    <div className="space-y-8 pb-32">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-bg-card/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.28),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(99,102,241,0.34),transparent_28%),radial-gradient(circle_at_55%_85%,rgba(236,72,153,0.18),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent mb-5">
              <Zap size={13} />
              Live career overview
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-text-primary">
              {firstName} is the center.
            </h1>
            <p className="mt-5 max-w-xl text-text-secondary text-base md:text-lg leading-relaxed">
              Every tool in HIREIQ now points back to your progress: resume proof, interview confidence, skill gaps, target companies, portfolio, and leader outreach.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(nextPath)}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-accent px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_18px_50px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] active:scale-95"
              >
                {nextMove}
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/app/roadmap')}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-border bg-bg-card/70 px-7 py-4 text-xs font-black uppercase tracking-widest text-text-primary transition-all hover:border-accent/40 hover:bg-bg-hover"
              >
                Build full roadmap
                <Route size={16} />
              </button>
            </div>
          </div>

          <div className="relative min-h-[430px]">
            <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 bg-accent/5 shadow-[0_0_80px_rgba(99,102,241,0.18)]" />
            <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 animate-pulse" />
            <motion.button
              onClick={() => navigate('/app/profile')}
              whileHover={{ scale: 1.04 }}
              className="premium-ai-pulse absolute left-1/2 top-1/2 z-20 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-bg-primary/95 text-center shadow-2xl"
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-cyan-400 text-white">
                <UserIcon size={22} />
              </div>
              <span className="text-sm font-black text-text-primary">{firstName}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">main node</span>
            </motion.button>

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 430" aria-hidden="true">
              <defs>
                <marker id="dashArrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 z" fill="#818cf8" />
                </marker>
              </defs>
              {appNodes.map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const x = 260 + Math.cos(rad) * 177;
                const y = 215 + Math.sin(rad) * 146;
                return (
                  <motion.line
                    key={node.label}
                    x1="260"
                    y1="215"
                    x2={x}
                    y2={y}
                    stroke="rgba(129,140,248,0.48)"
                    strokeWidth="1.5"
                    strokeDasharray="8 9"
                    markerEnd="url(#dashArrow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: node.angle / 550 }}
                  />
                );
              })}
            </svg>

            {appNodes.map((node, index) => {
              const rad = (node.angle * Math.PI) / 180;
              const left = 50 + Math.cos(rad) * 34;
              const top = 50 + Math.sin(rad) * 34;
              return (
                <motion.button
                  key={node.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => navigate(node.path)}
                  className="absolute z-10 w-[145px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-card/95 p-3 text-left shadow-xl transition-all hover:-translate-y-[calc(50%+4px)] hover:border-accent/50 hover:bg-bg-hover"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-bg-secondary ${node.accent}`}>
                    {node.icon}
                  </div>
                  <div className="text-xs font-black text-text-primary leading-tight">{node.label}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-text-muted">{node.status}</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((stat, index) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(stat.path)}
            className="group text-left rounded-[2rem] border border-border bg-bg-card p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-accent/40"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                {stat.icon}
              </div>
              <ArrowUpRight size={18} className="text-text-muted transition-colors group-hover:text-accent" />
            </div>
            <div className="text-3xl font-black italic text-text-primary">{stat.value}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stat.label}</div>
            <p className="mt-3 text-sm text-text-secondary">{stat.note}</p>
          </motion.button>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="rounded-[2.5rem] border border-border bg-bg-card p-6 md:p-8 shadow-xl">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black italic uppercase text-text-primary">
                <TrendingUp className="text-accent" />
                Momentum Graph
              </h2>
              <p className="mt-1 text-sm text-text-secondary">A summarized view of what is happening with your preparation this week.</p>
            </div>
            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-success">
              Progress rising
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumData}>
                <defs>
                  <linearGradient id="scoreFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prepFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="prep" stroke="#14b8a6" strokeWidth={2} fill="url(#prepFlow)" />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#scoreFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="rounded-[2.5rem] border border-border bg-bg-card p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-xl font-black italic uppercase text-text-primary">
              <BarChart3 className="text-accent" />
              Readiness Shape
            </h2>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.34} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-border bg-bg-card p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-xl font-black italic uppercase text-text-primary">
              <Layers3 className="text-accent" />
              Pathway Load
            </h2>
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pathwayBars}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {pathwayBars.map(bar => <Cell key={bar.name} fill={bar.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-border bg-bg-card p-6 md:p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black italic uppercase text-text-primary">
                <BookOpenCheck className="text-accent" />
                What Happens Next
              </h2>
              <p className="mt-1 text-sm text-text-secondary">A practical path based on the signals above.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Now', text: nextMove, path: nextPath, icon: <Zap size={18} /> },
              { title: 'Then', text: 'Convert progress into a visible portfolio', path: '/app/portfolio', icon: <PanelsTopLeft size={18} /> },
              { title: 'Finally', text: 'Use insights and leaders to choose where to apply', path: '/app/networking', icon: <Users size={18} /> },
            ].map((step, index) => (
              <button
                key={step.title}
                onClick={() => navigate(step.path)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bg-secondary/60 p-5 text-left transition-all hover:border-accent/40 hover:bg-bg-hover"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{step.icon}</div>
                  <div className="text-4xl font-black text-text-muted/20">0{index + 1}</div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-accent">{step.title}</div>
                <p className="mt-2 text-base font-black text-text-primary">{step.text}</p>
                <ArrowRight size={16} className="mt-5 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-border bg-bg-card p-6 md:p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle2 className="text-accent" />
            <h2 className="text-xl font-black italic uppercase text-text-primary">Recent Signals</h2>
          </div>
          <div className="space-y-5">
            {activities.length > 0 ? activities.map(activity => (
              <div key={activity.id} className="group flex items-start gap-4">
                <button
                  onClick={() => navigate(activity.path)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/10 bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white"
                >
                  {activity.type === 'resume' ? <FileText size={18} /> : activity.type === 'interview' ? <Mic2 size={18} /> : <ClockIcon />}
                </button>
                <button onClick={() => navigate(activity.path)} className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-black text-text-primary transition-colors group-hover:text-accent">{activity.title}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{activity.time} | {activity.status}</div>
                </button>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="rounded-lg p-1.5 text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                  title="Delete activity"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )) : (
              <p className="py-8 text-center text-sm italic text-text-muted">No recent activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ClockIcon() {
  return <ArrowUpRight size={18} />;
}

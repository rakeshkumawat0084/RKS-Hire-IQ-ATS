import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpenCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  DollarSign,
  ExternalLink,
  Filter,
  Globe,
  GraduationCap,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import api from '../../lib/api';
import { useResumeStore } from '../../store';

type HiringStatus = 'High' | 'Moderate' | 'Low';
type PrepIntensity = 'Target now' | 'Build first' | 'Stretch target';

interface PrepResource {
  label: string;
  url: string;
  source: string;
}

interface InterviewRound {
  title: string;
  focus: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  rating: number;
  growth: string;
  employees: string;
  location: string;
  salaryRange: string;
  hiringStatus: HiringStatus;
  ranking: number;
  description: string;
  cultureSummary: string;
  bestRoles: string[];
  careerGrowth: string;
  logoColor: string;
  targetProfile: string;
  keywords: string[];
  prepIntensity: PrepIntensity;
  prepFocus: string[];
  interviewRounds: InterviewRound[];
  dsaQuestions: string[];
  interviewQuestions: string[];
  projectIdeas: string[];
  resources: PrepResource[];
}

interface TrendSnapshot {
  updatedAt: string;
  refreshIntervalSeconds: number;
  marketIndex: {
    label: string;
    value: string;
    direction: 'up' | 'down';
  };
  companySignals: Array<{
    id: string;
    growth: string;
    hiringStatus: HiringStatus;
    rating: number;
  }>;
  marketTrends: Array<{
    label: string;
    value: string;
    direction: 'up' | 'down';
  }>;
  salaryBenchmarks: Array<{
    label: string;
    value: string;
    sector: string;
  }>;
}

const COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Google',
    industry: 'Tech',
    rating: 4.8,
    growth: '+12%',
    employees: '150k+',
    location: 'Mountain View, CA',
    salaryRange: '$150k - $350k',
    hiringStatus: 'Moderate',
    ranking: 1,
    description: "Google's engineering bar rewards clean problem solving, product intuition, and strong fundamentals.",
    cultureSummary: "Innovation-heavy, high engineering standards, and strong peer review culture.",
    bestRoles: ['Software Engineer', 'Site Reliability Engineer', 'AI Researcher'],
    careerGrowth: 'Excellent internal mobility across product, infrastructure, SRE, and AI teams.',
    logoColor: 'from-blue-500 via-red-500 to-yellow-500',
    targetProfile: 'Strong DSA, systems basics, communication, and projects that show scale or ML awareness.',
    keywords: ['react', 'typescript', 'python', 'java', 'dsa', 'system design', 'machine learning', 'cloud'],
    prepIntensity: 'Stretch target',
    prepFocus: ['Graph traversal', 'dynamic programming', 'distributed systems basics', 'STAR stories'],
    interviewRounds: [
      { title: 'Online assessment', focus: 'Two medium coding problems under time pressure.' },
      { title: 'Technical screens', focus: 'DSA with clear explanation and edge-case handling.' },
      { title: 'Onsite loop', focus: 'Coding, system design for experienced candidates, and Googliness/behavioral.' },
    ],
    dsaQuestions: ['Number of Islands', 'LRU Cache', 'Word Ladder', 'Meeting Rooms II', 'Longest Substring Without Repeating Characters'],
    interviewQuestions: [
      'Tell me about a time you improved a system with measurable impact.',
      'How would you design search autocomplete for millions of users?',
      'Explain a project where you handled ambiguity.',
    ],
    projectIdeas: ['Build a searchable knowledge base with ranking', 'Add observability to a full-stack app', 'Ship a small ML-powered feature'],
    resources: [
      { label: 'Google interview prep', source: 'Google Careers', url: 'https://careers.google.com/how-we-hire/interview/' },
      { label: 'DSA practice set', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/data-structures' },
      { label: 'Patterns roadmap', source: 'NeetCode', url: 'https://neetcode.io/roadmap' },
    ],
  },
  {
    id: '2',
    name: 'Stripe',
    industry: 'Fintech',
    rating: 4.9,
    growth: '+45%',
    employees: '8k+',
    location: 'San Francisco, CA',
    salaryRange: '$180k - $400k',
    hiringStatus: 'High',
    ranking: 3,
    description: 'Stripe looks for product-minded engineers who can reason about correctness, APIs, and business impact.',
    cultureSummary: 'Writing-intensive, precise, ownership-heavy, and customer-focused.',
    bestRoles: ['Full Stack Engineer', 'Product Engineer', 'Backend Developer'],
    careerGrowth: 'High ownership environment with strong growth for engineers who can connect product and systems.',
    logoColor: 'from-indigo-500 to-purple-600',
    targetProfile: 'API design, backend reliability, product sense, database modeling, and clear written reasoning.',
    keywords: ['node', 'react', 'typescript', 'api', 'backend', 'sql', 'mongodb', 'payments'],
    prepIntensity: 'Target now',
    prepFocus: ['API design', 'hash maps', 'queues', 'database transactions', 'product trade-offs'],
    interviewRounds: [
      { title: 'Coding screen', focus: 'Practical implementation with clean data modeling.' },
      { title: 'Bug bash or integration', focus: 'Debug an existing codebase and communicate trade-offs.' },
      { title: 'Manager/product round', focus: 'Ownership, writing clarity, and customer thinking.' },
    ],
    dsaQuestions: ['Design HashMap', 'Merge Intervals', 'Top K Frequent Elements', 'Valid Parentheses', 'Task Scheduler'],
    interviewQuestions: [
      'How would you design a payment retry system?',
      'Tell me about a time you made a product simpler for users.',
      'What are the failure modes of a checkout API?',
    ],
    projectIdeas: ['Create a payments dashboard clone', 'Build idempotent API endpoints', 'Write technical docs for your portfolio project'],
    resources: [
      { label: 'Stripe engineering culture', source: 'Stripe', url: 'https://stripe.com/jobs' },
      { label: 'SQL tutorial refresh', source: 'W3Schools', url: 'https://www.w3schools.com/sql/' },
      { label: 'Interview kit practice', source: 'HackerRank', url: 'https://www.hackerrank.com/interview/interview-preparation-kit' },
    ],
  },
  {
    id: '3',
    name: 'Airbnb',
    industry: 'Travel',
    rating: 4.5,
    growth: '-2%',
    employees: '6k+',
    location: 'San Francisco, CA',
    salaryRange: '$140k - $320k',
    hiringStatus: 'Low',
    ranking: 12,
    description: 'Airbnb favors engineers with product taste, frontend depth, marketplace thinking, and collaboration skills.',
    cultureSummary: 'Design-led, collaborative, user empathy focused, and quality oriented.',
    bestRoles: ['Frontend Engineer', 'Product Designer', 'iOS Developer'],
    careerGrowth: 'Best for candidates who can show polished product work and cross-functional collaboration.',
    logoColor: 'from-rose-500 to-pink-500',
    targetProfile: 'Frontend/product engineering, accessibility, data-driven marketplace decisions, and strong UX judgment.',
    keywords: ['react', 'frontend', 'design', 'typescript', 'css', 'mobile', 'ux'],
    prepIntensity: 'Build first',
    prepFocus: ['Frontend architecture', 'arrays and strings', 'accessibility', 'product critique'],
    interviewRounds: [
      { title: 'Frontend coding', focus: 'Build a clean interactive UI with state and edge cases.' },
      { title: 'Product thinking', focus: 'Reason about marketplace trust, conversion, and user needs.' },
      { title: 'Behavioral loop', focus: 'Collaboration with design, quality, and ownership.' },
    ],
    dsaQuestions: ['Insert Interval', 'Group Anagrams', 'Clone Graph', 'Debounce Function', 'Flatten Nested List Iterator'],
    interviewQuestions: [
      'How would you improve the booking flow for trust?',
      'Describe a time you worked closely with design.',
      'How would you make a listing page faster?',
    ],
    projectIdeas: ['Build a responsive listing marketplace', 'Add skeleton loading and optimistic UI', 'Create an accessibility audit report'],
    resources: [
      { label: 'React tutorial refresh', source: 'W3Schools', url: 'https://www.w3schools.com/react/' },
      { label: 'Frontend coding practice', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript' },
      { label: 'Web accessibility basics', source: 'web.dev', url: 'https://web.dev/learn/accessibility/' },
    ],
  },
  {
    id: '4',
    name: 'Apple',
    industry: 'Consumer Electronics',
    rating: 4.6,
    growth: '+8%',
    employees: '160k',
    location: 'Cupertino, CA',
    salaryRange: '$160k - $380k',
    hiringStatus: 'Moderate',
    ranking: 2,
    description: 'Apple rewards deep craft, product quality, privacy awareness, and precise technical communication.',
    cultureSummary: 'Detail-focused, confidential, product-led, and quality obsessed.',
    bestRoles: ['Hardware Engineer', 'Software Engineer', 'Product Manager'],
    careerGrowth: 'Strong brand value and technical depth, especially for platform and product specialists.',
    logoColor: 'from-gray-500 to-gray-800',
    targetProfile: 'Polished products, OS/mobile fundamentals, performance, privacy, and excellent debugging instincts.',
    keywords: ['swift', 'ios', 'mobile', 'performance', 'react', 'typescript', 'systems'],
    prepIntensity: 'Stretch target',
    prepFocus: ['Performance debugging', 'trees', 'binary search', 'OS fundamentals', 'product detail'],
    interviewRounds: [
      { title: 'Team screen', focus: 'Role-specific depth and project discussion.' },
      { title: 'Technical loop', focus: 'Coding, debugging, and systems fundamentals.' },
      { title: 'Craft round', focus: 'Product quality, privacy, and attention to detail.' },
    ],
    dsaQuestions: ['Binary Tree Maximum Path Sum', 'Search in Rotated Sorted Array', 'Min Stack', 'Serialize and Deserialize Binary Tree', 'K Closest Points'],
    interviewQuestions: [
      'Tell me about a bug that was hard to reproduce.',
      'How would you reduce app startup time?',
      'What trade-offs matter in privacy-first analytics?',
    ],
    projectIdeas: ['Profile and optimize a React app', 'Build a mobile-first offline notes app', 'Write a performance case study'],
    resources: [
      { label: 'Apple jobs and teams', source: 'Apple', url: 'https://www.apple.com/careers/' },
      { label: 'Algorithm practice', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/algorithms' },
      { label: 'System design primer', source: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
  },
  {
    id: '5',
    name: 'NVIDIA',
    industry: 'Semiconductors',
    rating: 4.7,
    growth: '+210%',
    employees: '27k',
    location: 'Santa Clara, CA',
    salaryRange: '$170k - $420k',
    hiringStatus: 'High',
    ranking: 5,
    description: 'NVIDIA is ideal for candidates with AI, systems, performance, GPU, or ML infrastructure interest.',
    cultureSummary: 'Technically intense, research aware, and focused on hard infrastructure problems.',
    bestRoles: ['DL Engineer', 'GPU Architect', 'AI Software Engineer'],
    careerGrowth: 'Excellent upside for AI software, accelerated computing, and ML systems careers.',
    logoColor: 'from-green-500 to-emerald-700',
    targetProfile: 'Python/C++, ML fundamentals, linear algebra awareness, parallel systems, and strong experimentation.',
    keywords: ['python', 'machine learning', 'ai', 'c++', 'cuda', 'pytorch', 'data', 'systems'],
    prepIntensity: 'Target now',
    prepFocus: ['Matrices', 'graphs', 'heaps', 'ML fundamentals', 'parallel computing basics'],
    interviewRounds: [
      { title: 'Coding and math screen', focus: 'Algorithms plus role-specific ML or systems basics.' },
      { title: 'Deep technical round', focus: 'Projects, performance, model training, or GPU concepts.' },
      { title: 'Team fit', focus: 'Research curiosity, persistence, and collaboration.' },
    ],
    dsaQuestions: ['Kth Largest Element', 'Course Schedule', 'Matrix Spiral Traversal', 'Minimum Window Substring', 'Dijkstra Shortest Path'],
    interviewQuestions: [
      'Explain a model or AI feature you built end to end.',
      'How would you optimize a slow data pipeline?',
      'What makes GPU acceleration useful for deep learning?',
    ],
    projectIdeas: ['Train and deploy a small vision model', 'Benchmark CPU vs GPU style workloads', 'Build an AI portfolio demo with metrics'],
    resources: [
      { label: 'NVIDIA careers', source: 'NVIDIA', url: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
      { label: 'Python tutorial refresh', source: 'W3Schools', url: 'https://www.w3schools.com/python/' },
      { label: 'AI coding practice', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/ai' },
    ],
  },
  {
    id: '6',
    name: 'Notion',
    industry: 'Software',
    rating: 4.4,
    growth: '+25%',
    employees: '500+',
    location: 'San Francisco, CA',
    salaryRange: '$130k - $280k',
    hiringStatus: 'High',
    ranking: 45,
    description: 'Notion is a strong target for product engineers who can build thoughtful UI and ship quickly.',
    cultureSummary: 'Product-led, writing-friendly, craft-oriented, and fast-moving.',
    bestRoles: ['Product Engineer', 'Growth Engineer', 'UI Specialist'],
    careerGrowth: 'High visibility at a scaling company for engineers with taste and execution speed.',
    logoColor: 'from-black to-zinc-700',
    targetProfile: 'React depth, product thinking, editor-like UI, collaboration, and strong portfolio storytelling.',
    keywords: ['react', 'typescript', 'frontend', 'product', 'ui', 'node', 'collaboration'],
    prepIntensity: 'Target now',
    prepFocus: ['UI state management', 'strings', 'trees', 'collaborative editing concepts', 'portfolio polish'],
    interviewRounds: [
      { title: 'Practical coding', focus: 'Build or modify a product feature with clean UX.' },
      { title: 'Product engineering', focus: 'Discuss trade-offs, metrics, and user experience.' },
      { title: 'Culture round', focus: 'Ownership, taste, writing, and collaboration.' },
    ],
    dsaQuestions: ['Implement Trie', 'Nested List Weight Sum', 'Text Justification', 'Design Add and Search Words', 'Lowest Common Ancestor'],
    interviewQuestions: [
      'How would you design block-based document editing?',
      'Tell me about a product detail you are proud of.',
      'How would you measure activation for a productivity tool?',
    ],
    projectIdeas: ['Build a block editor mini-app', 'Create a polished dashboard with keyboard shortcuts', 'Write a product teardown'],
    resources: [
      { label: 'Notion careers', source: 'Notion', url: 'https://www.notion.com/careers' },
      { label: 'TypeScript basics', source: 'W3Schools', url: 'https://www.w3schools.com/typescript/' },
      { label: 'DSA patterns', source: 'NeetCode', url: 'https://neetcode.io/roadmap' },
    ],
  },
];

const FALLBACK_MARKET_TRENDS = [
  { label: 'AI Engineering Demand', value: '+145%', direction: 'up' as const },
  { label: 'Product Engineering Roles', value: '+16%', direction: 'up' as const },
  { label: 'Remote Software Roles', value: '+24%', direction: 'up' as const },
  { label: 'SaaS Funding Caution', value: '-12%', direction: 'down' as const },
];

const FALLBACK_SALARY_BENCHMARKS = [
  { label: 'Senior Frontend Dev', value: '$140k - $220k', sector: 'US-West' },
  { label: 'AI/ML Scientist', value: '$180k - $310k', sector: 'US-Remote' },
  { label: 'Product Engineer', value: '$130k - $240k', sector: 'Global' },
];

const GENERAL_PREP_RESOURCES: PrepResource[] = [
  { label: 'Interview Preparation Kit', source: 'HackerRank', url: 'https://www.hackerrank.com/interview/interview-preparation-kit' },
  { label: 'DSA Roadmap', source: 'NeetCode', url: 'https://neetcode.io/roadmap' },
  { label: 'Coding Practice', source: 'LeetCode', url: 'https://leetcode.com/problemset/' },
  { label: 'HTML/CSS/JS Refresh', source: 'W3Schools', url: 'https://www.w3schools.com/' },
  { label: 'System Design Primer', source: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer' },
];

function parseGrowth(growth: string) {
  return Number(growth.replace('%', '').replace('+', '')) || 0;
}

function statusScore(status: HiringStatus) {
  if (status === 'High') return 16;
  if (status === 'Moderate') return 9;
  return 2;
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

export default function CompanyInsights() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [trendSnapshot, setTrendSnapshot] = useState<TrendSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);
  const { resumeRole, resumeSkills, resumeEducation, hasResume } = useResumeStore();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const profileText = useMemo(
    () => normalizeText(`${resumeRole} ${resumeSkills} ${resumeEducation}`),
    [resumeRole, resumeSkills, resumeEducation]
  );

  const loadTrendSnapshot = async (refresh = false) => {
    try {
      setIsRefreshing(true);
      const response = await api.get<TrendSnapshot>('/company-insights/trends', {
        params: refresh ? { refresh: 'true' } : undefined,
      });
      setTrendSnapshot(response.data);
      setTrendError(null);
    } catch (err) {
      setTrendError('Using built-in prep intelligence until live company trends reconnect.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrendSnapshot(false);
    const id = window.setInterval(() => loadTrendSnapshot(true), (trendSnapshot?.refreshIntervalSeconds || 5) * 1000);
    return () => window.clearInterval(id);
  }, [trendSnapshot?.refreshIntervalSeconds]);

  const liveCompanies = useMemo(() => {
    const signals = new Map((trendSnapshot?.companySignals || []).map(signal => [signal.id, signal]));
    return COMPANIES.map(company => {
      const signal = signals.get(company.id);
      return signal ? { ...company, ...signal } : company;
    });
  }, [trendSnapshot]);

  const companiesWithFit = useMemo(() => {
    return liveCompanies
      .map(company => {
        const matchedKeywords = company.keywords.filter(keyword => profileText.includes(keyword));
        const base = 48;
        const fitScore = Math.min(
          98,
          base + matchedKeywords.length * 7 + statusScore(company.hiringStatus) + Math.max(0, Math.min(parseGrowth(company.growth), 40)) / 4
        );
        return { ...company, fitScore: Math.round(fitScore), matchedKeywords };
      })
      .sort((a, b) => b.fitScore - a.fitScore);
  }, [liveCompanies, profileText]);

  const industries = ['All', ...Array.from(new Set(companiesWithFit.map(c => c.industry)))];

  const filteredCompanies = useMemo(() => {
    return companiesWithFit.filter(company => {
      const query = normalizeText(searchTerm);
      const matchesSearch =
        normalizeText(company.name).includes(query) ||
        normalizeText(company.industry).includes(query) ||
        company.bestRoles.some(role => normalizeText(role).includes(query));
      const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [companiesWithFit, searchTerm, selectedIndustry]);

  const topTarget = companiesWithFit[0];
  const marketTrends = trendSnapshot?.marketTrends || FALLBACK_MARKET_TRENDS;
  const salaryBenchmarks = trendSnapshot?.salaryBenchmarks || FALLBACK_SALARY_BENCHMARKS;

  const lastUpdated = trendSnapshot
    ? new Date(trendSnapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'loading';

  const selectedCompanyFit = selectedCompany
    ? companiesWithFit.find(company => company.id === selectedCompany.id)
    : null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 px-4 md:px-0">
      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="glass rounded-[2rem] border border-border p-6 md:p-8 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-emerald-400 to-yellow-400" />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {isRefreshing ? 'Refreshing Targets' : 'Company Targeting AI'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary flex items-center gap-3">
                    <Target className="text-accent" size={36} />
                    Company Insights
                  </h1>
                  <p className="text-text-secondary text-base md:text-lg mt-3 max-w-2xl">
                    Find which companies to target, why they fit you, and exactly what to prepare before applying.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-text-muted">
                <div className="flex items-center gap-2 px-4 py-2 bg-bg-card rounded-xl border border-border">
                  <Activity size={14} className={trendSnapshot?.marketIndex.direction === 'down' ? 'text-red-500' : 'text-success'} />
                  <span>{trendSnapshot?.marketIndex.label || 'Tech Talent Index'}</span>
                  <span className={trendSnapshot?.marketIndex.direction === 'down' ? 'text-red-500' : 'text-success'}>
                    {trendSnapshot?.marketIndex.value || '+1%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Best Target', value: topTarget?.name || 'Loading', icon: <Award size={18} className="text-yellow-500" /> },
                { label: 'Fit Score', value: `${topTarget?.fitScore || 0}%`, icon: <Sparkles size={18} className="text-accent" /> },
                { label: 'Prep Mode', value: topTarget?.prepIntensity || 'Target now', icon: <Clock size={18} className="text-success" /> },
              ].map(item => (
                <div key={item.label} className="bg-bg-secondary/60 border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    {item.icon}
                    <span className="text-[10px] uppercase tracking-widest font-black text-text-muted">{item.label}</span>
                  </div>
                  <div className="text-2xl font-black text-text-primary">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">
              <span>Last trend snapshot: {lastUpdated}</span>
              {trendError && <span className="text-orange-400">{trendError}</span>}
              {hasResume ? (
                <span className="text-success">Personalized using resume pipeline</span>
              ) : (
                <span className="text-accent">Analyze or build a resume for sharper matching</span>
              )}
            </div>
          </div>
        </div>

        <aside className="glass rounded-[2rem] border border-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="text-accent" size={24} />
            <div>
              <h2 className="text-xl font-black text-text-primary">Prep Stack</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Use these across all targets</p>
            </div>
          </div>
          <div className="space-y-3">
            {GENERAL_PREP_RESOURCES.map(resource => (
              <a
                key={resource.label}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-4 bg-bg-secondary/60 border border-border rounded-2xl hover:border-accent/40 hover:bg-bg-hover transition-all group"
              >
                <div>
                  <p className="text-sm font-black text-text-primary group-hover:text-accent transition-colors">{resource.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{resource.source}</p>
                </div>
                <ExternalLink size={16} className="text-text-muted group-hover:text-accent" />
              </a>
            ))}
          </div>
        </aside>
      </section>

      <section className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent" size={22} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, role, or industry..."
            className="w-full bg-bg-card border border-border rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-accent/40 shadow-xl transition-all text-base text-text-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <Filter size={18} className="text-text-muted flex-shrink-0" />
          {industries.map(industry => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-5 py-3 rounded-xl border transition-all text-sm font-bold whitespace-nowrap ${
                selectedIndustry === industry
                  ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                  : 'bg-bg-card text-text-secondary border-border hover:border-accent/40'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCompanies.map((company, i) => (
            <motion.button
              key={company.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCompany(company)}
              className="text-left glass p-6 rounded-[2rem] border border-border hover:border-accent/40 transition-all group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={20} className="text-accent" />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.logoColor} p-[1px]`}>
                  <div className="w-full h-full rounded-2xl bg-bg-primary flex items-center justify-center">
                    <span className="text-sm font-black tracking-tighter opacity-80">{company.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${company.growth.startsWith('+') ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>
                    {company.growth}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    {company.rating}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black mb-1 group-hover:text-accent transition-colors text-text-primary">{company.name}</h3>
                  <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-black">{company.industry}</p>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center">
                    <span className="text-lg font-black text-text-primary">{company.fitScore}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Your Fit Score</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {company.matchedKeywords.length > 0
                        ? `Matched: ${company.matchedKeywords.slice(0, 3).join(', ')}`
                        : company.targetProfile}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Hiring</p>
                    <p className="text-xs font-black text-text-primary">{company.hiringStatus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Prep</p>
                    <p className="text-xs font-black text-text-primary">{company.prepIntensity}</p>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[2rem] border border-border">
            <Search size={44} className="mx-auto text-text-muted mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No company matched that search</h3>
            <button
              onClick={() => { setSearchTerm(''); setSelectedIndustry('All'); }}
              className="mt-4 px-6 py-3 bg-bg-secondary border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-bg-hover transition-all text-text-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-border shadow-xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-text-primary">
            <Activity className="text-accent" /> Market Signals
          </h2>
          <div className="space-y-3">
            {marketTrends.map((trend, i) => {
              const color = trend.direction === 'down' ? 'text-red-500' : 'text-success';
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border">
                  <span className="text-sm font-bold text-text-secondary">{trend.label}</span>
                  <span className={`font-black ${color}`}>{trend.direction === 'down' ? 'Down' : 'Up'} {trend.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-[2rem] border border-border shadow-xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-text-primary">
            <DollarSign className="text-accent" /> Salary Benchmarks
          </h2>
          <div className="space-y-3">
            {salaryBenchmarks.map((salary, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border">
                <div>
                  <span className="text-sm font-bold text-text-secondary block">{salary.label}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{salary.sector}</span>
                </div>
                <span className="text-text-primary font-black">{salary.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedCompany && selectedCompanyFit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCompany(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="relative w-full max-w-6xl max-h-[88vh] glass rounded-[2rem] border border-border shadow-2xl overflow-y-auto overflow-x-hidden custom-scrollbar"
            >
              <div className="sticky top-0 z-10 bg-bg-card/95 backdrop-blur-xl border-b border-border p-5 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedCompany.logoColor} p-[1px] shrink-0`}>
                    <div className="w-full h-full rounded-2xl bg-bg-primary flex items-center justify-center text-sm font-black">
                      {selectedCompany.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-black text-text-primary truncate">{selectedCompany.name}</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Rank #{selectedCompany.ranking} in {selectedCompany.industry}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-3 bg-bg-secondary hover:bg-bg-hover rounded-full transition-colors text-text-primary border border-border"
                  aria-label="Close company details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
                  <div className="space-y-6">
                    <div className="bg-accent/5 rounded-[2rem] border border-accent/20 p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-accent mb-2">Recommendation</p>
                          <h3 className="text-2xl md:text-4xl font-black text-text-primary">{selectedCompany.prepIntensity}</h3>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-bg-card border border-border flex flex-col items-center justify-center shrink-0">
                          <span className="text-3xl font-black text-text-primary">{selectedCompanyFit.fitScore}</span>
                          <span className="text-[9px] uppercase tracking-widest font-black text-text-muted">Fit</span>
                        </div>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{selectedCompany.targetProfile}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Location', value: selectedCompany.location, icon: <MapPin size={18} className="text-accent" /> },
                        { label: 'Team Size', value: selectedCompany.employees, icon: <Users size={18} className="text-accent" /> },
                        { label: 'Salary', value: selectedCompany.salaryRange, icon: <DollarSign size={18} className="text-accent" /> },
                      ].map(item => (
                        <div key={item.label} className="bg-bg-secondary/60 border border-border rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            {item.icon}
                            <span className="text-[10px] uppercase tracking-widest font-black text-text-muted">{item.label}</span>
                          </div>
                          <p className="text-sm font-black text-text-primary">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] border border-border p-6 space-y-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-accent" />
                      <h3 className="text-xl font-black text-text-primary">Company Readiness</h3>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{selectedCompany.description}</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Culture</p>
                        <p className="text-sm text-text-secondary">{selectedCompany.cultureSummary}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Career Growth</p>
                        <p className="text-sm text-text-secondary">{selectedCompany.careerGrowth}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass rounded-[2rem] border border-border p-6">
                    <h3 className="text-lg font-black text-text-primary mb-5 flex items-center gap-2">
                      <Zap className="text-accent" size={20} /> Prep Focus
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.prepFocus.map(item => (
                        <div key={item} className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                          <CheckCircle2 size={15} className="text-success shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] border border-border p-6">
                    <h3 className="text-lg font-black text-text-primary mb-5 flex items-center gap-2">
                      <Briefcase className="text-accent" size={20} /> Target Roles
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.bestRoles.map(role => (
                        <div key={role} className="flex items-center justify-between p-3 bg-bg-secondary border border-border rounded-xl">
                          <span className="text-sm font-bold text-text-primary">{role}</span>
                          <ChevronRight size={15} className="text-text-muted" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] border border-border p-6">
                    <h3 className="text-lg font-black text-text-primary mb-5 flex items-center gap-2">
                      <Layers3 className="text-accent" size={20} /> Projects To Build
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.projectIdeas.map(project => (
                        <div key={project} className="flex items-start gap-3 text-sm font-bold text-text-secondary">
                          <Building2 size={15} className="text-accent shrink-0 mt-0.5" />
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="glass rounded-[2rem] border border-border p-6 md:p-8">
                    <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                      <Code2 className="text-accent" /> DSA Practice Questions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCompany.dsaQuestions.map(question => (
                        <a
                          key={question}
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${question} coding interview problem`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-bg-secondary border border-border rounded-2xl hover:border-accent/40 transition-all group"
                        >
                          <p className="text-sm font-black text-text-primary group-hover:text-accent">{question}</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">Practice pattern</p>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] border border-border p-6 md:p-8">
                    <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                      <GraduationCap className="text-accent" /> Interview Questions
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.interviewQuestions.map(question => (
                        <div key={question} className="p-4 bg-bg-secondary border border-border rounded-2xl text-sm font-bold text-text-secondary">
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass rounded-[2rem] border border-border p-6 md:p-8">
                  <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                    <Globe className="text-accent" /> Resource Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCompany.resources.map(resource => (
                      <a
                        key={resource.label}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-5 bg-bg-secondary border border-border rounded-2xl hover:border-accent/40 hover:bg-bg-hover transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-text-primary group-hover:text-accent">{resource.label}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-2">{resource.source}</p>
                          </div>
                          <ExternalLink size={16} className="text-text-muted group-hover:text-accent shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-[2rem] border border-border p-6 md:p-8">
                  <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                    <TrendingUp className="text-accent" /> Expected Interview Loop
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCompany.interviewRounds.map((round, index) => (
                      <div key={round.title} className="p-5 bg-bg-secondary border border-border rounded-2xl">
                        <div className="text-accent font-black text-2xl mb-4">0{index + 1}</div>
                        <h4 className="text-base font-black text-text-primary mb-2">{round.title}</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{round.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

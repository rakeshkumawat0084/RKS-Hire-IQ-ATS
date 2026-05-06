import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  ChevronRight,
  CloudRain,
  Code2,
  Edit3,
  Eye,
  Github,
  Globe,
  Image as ImageIcon,
  Layers3,
  Layout,
  LayoutDashboard,
  Library,
  Linkedin,
  Mail,
  Moon,
  Music2,
  Palette,
  PanelsTopLeft,
  Plus,
  Settings,
  Snowflake,
  Sparkles,
  Sun,
  Trash2,
  User,
  Wand2,
  Zap,
} from 'lucide-react';
import { useUserStore } from '../../store';

type View = 'dashboard' | 'templates' | 'create' | 'preview';
type TemplateMood = 'rain' | 'snow' | 'aurora' | 'music' | 'studio' | 'terminal' | 'sunset' | 'minimal' | 'noir' | 'editorial' | 'dream' | 'aiLab' | 'collage' | 'game' | 'botanical' | 'creatorNight' | 'multimodal' | 'indiaFuture';

interface Portfolio {
  id: string;
  name: string;
  templateId: string;
  template: string;
  lastEdited: string;
  content: PortfolioContent;
}

interface PortfolioProject {
  title: string;
  category: string;
  summary: string;
  outcome: string;
  link: string;
}

interface PortfolioContent {
  fullName: string;
  role: string;
  tagline: string;
  bio: string;
  location: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  website: string;
  skills: string;
  metricOneLabel: string;
  metricOneValue: string;
  metricTwoLabel: string;
  metricTwoValue: string;
  testimonial: string;
  projects: PortfolioProject[];
}

interface PortfolioTemplate {
  id: string;
  name: string;
  desc: string;
  mood: TemplateMood;
  audience: string;
  tag: string;
  color: string;
  accent: string;
  icon: React.ReactNode;
  features: string[];
}

const TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'rain-glass',
    name: 'Rain Glass Lab',
    desc: 'A moody glass portfolio with animated rain, blurred panels, and cinematic case studies.',
    mood: 'rain',
    audience: 'Full-stack devs, AI builders, cyber portfolios',
    tag: 'Weather UI',
    color: 'from-sky-500 via-cyan-400 to-slate-900',
    accent: '#38bdf8',
    icon: <CloudRain size={20} />,
    features: ['Rain particles', 'Glass cards', '3D project slabs'],
  },
  {
    id: 'snow-atelier',
    name: 'Snow Atelier',
    desc: 'Soft snow motion, frosted surfaces, and calm typography for polished professional brands.',
    mood: 'snow',
    audience: 'Designers, product thinkers, writers',
    tag: 'Calm Motion',
    color: 'from-cyan-100 via-white to-blue-400',
    accent: '#93c5fd',
    icon: <Snowflake size={20} />,
    features: ['Snow particles', 'Frosted profile', 'Editorial project flow'],
  },
  {
    id: 'music-visualizer',
    name: 'Music Visualizer',
    desc: 'Audio-reactive style hero with animated equalizer bars and high-energy creator sections.',
    mood: 'music',
    audience: 'Creative coders, musicians, motion designers',
    tag: 'Sound Design',
    color: 'from-fuchsia-500 via-violet-500 to-cyan-400',
    accent: '#d946ef',
    icon: <Music2 size={20} />,
    features: ['Visualizer bars', 'Neon glass', 'Beat-card projects'],
  },
  {
    id: 'aurora-3d',
    name: 'Aurora 3D Grid',
    desc: 'A trendy spatial portfolio with floating bento cards, aurora lighting, and layered depth.',
    mood: 'aurora',
    audience: 'Frontend engineers, WebGL learners, SaaS builders',
    tag: '3D Bento',
    color: 'from-emerald-400 via-teal-500 to-indigo-600',
    accent: '#34d399',
    icon: <Layers3 size={20} />,
    features: ['3D tilt cards', 'Aurora field', 'Bento proof blocks'],
  },
  {
    id: 'terminal-os',
    name: 'Terminal OS',
    desc: 'An interactive fake operating system vibe with command panels and technical receipts.',
    mood: 'terminal',
    audience: 'Backend, DevOps, cybersecurity, open-source',
    tag: 'Interactive OS',
    color: 'from-lime-400 via-emerald-500 to-black',
    accent: '#84cc16',
    icon: <Code2 size={20} />,
    features: ['Command UI', 'System cards', 'Proof-first case studies'],
  },
  {
    id: 'sunset-product',
    name: 'Sunset Product',
    desc: 'Warm product-founder portfolio with bold type, story sections, and premium case studies.',
    mood: 'sunset',
    audience: 'Product engineers, founders, PMs',
    tag: 'Storytelling',
    color: 'from-amber-300 via-rose-400 to-indigo-900',
    accent: '#fb7185',
    icon: <Sun size={20} />,
    features: ['Narrative hero', 'Metric strips', 'Launch timeline'],
  },
  {
    id: 'neon-noir-city',
    name: 'Neon Noir City',
    desc: 'A cinematic cyberpunk portfolio with rain-soaked reflections, fog, and hacker-story case studies.',
    mood: 'noir',
    audience: 'Cybersecurity, AI, backend, game-tech portfolios',
    tag: 'Cyberpunk',
    color: 'from-fuchsia-600 via-cyan-500 to-black',
    accent: '#22d3ee',
    icon: <Moon size={20} />,
    features: ['Noir hero', 'Rain mood', 'Holographic cards'],
  },
  {
    id: 'editorial-portrait',
    name: 'Editorial Portrait',
    desc: 'A premium photography-inspired portfolio with portrait focus, warm light, and magazine typography.',
    mood: 'editorial',
    audience: 'Creative developers, designers, consultants',
    tag: 'Editorial',
    color: 'from-yellow-200 via-orange-300 to-zinc-900',
    accent: '#f59e0b',
    icon: <User size={20} />,
    features: ['Portrait hero', 'Vogue spacing', 'Soft case studies'],
  },
  {
    id: 'floating-island',
    name: 'Floating Island',
    desc: 'A surreal concept-art portfolio for imaginative brands, fantasy projects, and playful storytelling.',
    mood: 'dream',
    audience: 'Illustrators, creative coders, storytelling brands',
    tag: 'Surreal',
    color: 'from-pink-200 via-sky-300 to-indigo-900',
    accent: '#c084fc',
    icon: <Sparkles size={20} />,
    features: ['Dream world', 'Soft fog', 'Concept cards'],
  },
  {
    id: 'ai-workspace',
    name: 'AI Workspace',
    desc: 'A clean sci-fi lab portfolio with holographic panels, neural UI, and technical project proof.',
    mood: 'aiLab',
    audience: 'AI engineers, ML students, automation builders',
    tag: 'AI Lab',
    color: 'from-blue-500 via-violet-600 to-slate-950',
    accent: '#60a5fa',
    icon: <Wand2 size={20} />,
    features: ['Hologram UI', 'Neural panels', 'Lab layout'],
  },
  {
    id: 'handmade-collage',
    name: 'Handmade Collage',
    desc: 'A tactile anti-AI portfolio with paper textures, imperfect edges, warm tones, and raw craft.',
    mood: 'collage',
    audience: 'Artists, brand designers, writers, human-centered studios',
    tag: 'Anti-AI Craft',
    color: 'from-stone-200 via-amber-200 to-rose-300',
    accent: '#a16207',
    icon: <Palette size={20} />,
    features: ['Paper texture', 'Raw edges', 'Warm proof grid'],
  },
  {
    id: 'game-world',
    name: 'Mission World',
    desc: 'A gamified portfolio where projects feel like missions, skills become stats, and work is explorable.',
    mood: 'game',
    audience: 'Game devs, frontend devs, students, interactive UX',
    tag: 'Gamified',
    color: 'from-lime-300 via-cyan-400 to-purple-700',
    accent: '#a3e635',
    icon: <Zap size={20} />,
    features: ['HUD sections', 'Mission cards', 'Avatar hero'],
  },
  {
    id: 'kawaii-botanical',
    name: 'Kawaii Botanical',
    desc: 'A soft illustrated portfolio with cute botanical energy, playful color, and friendly brand work.',
    mood: 'botanical',
    audience: 'Brand designers, illustrators, social media creatives',
    tag: 'Kawaii',
    color: 'from-pink-200 via-emerald-200 to-yellow-100',
    accent: '#fb7185',
    icon: <Sun size={20} />,
    features: ['Soft pastels', 'Botanical motifs', 'Friendly cards'],
  },
  {
    id: 'late-night-creator',
    name: 'Late Night Creator',
    desc: 'A cinematic creator portfolio with laptop glow, rainy window mood, and warm/cool storytelling contrast.',
    mood: 'creatorNight',
    audience: 'Indie makers, solo founders, content creators',
    tag: 'Film Still',
    color: 'from-amber-500 via-slate-900 to-blue-950',
    accent: '#fbbf24',
    icon: <Moon size={20} />,
    features: ['Film lighting', 'Story blocks', 'Creator proof'],
  },
  {
    id: 'multimodal-ai',
    name: 'Multimodal AI',
    desc: 'A high-tech portfolio for AI assistants, voice/image/text projects, and futuristic product demos.',
    mood: 'multimodal',
    audience: 'AI product builders, prompt engineers, automation teams',
    tag: 'Multimodal',
    color: 'from-cyan-400 via-blue-600 to-violet-950',
    accent: '#38bdf8',
    icon: <AudioLines size={20} />,
    features: ['Data streams', 'AI panels', 'Project showcase'],
  },
  {
    id: 'india-future',
    name: 'India Future Heritage',
    desc: 'A local-authentic portfolio blending Indian cultural identity with holographic AI and festival color.',
    mood: 'indiaFuture',
    audience: 'Indian founders, local brands, cultural-tech projects',
    tag: 'Heritage Tech',
    color: 'from-orange-400 via-fuchsia-500 to-indigo-900',
    accent: '#fb923c',
    icon: <Globe size={20} />,
    features: ['Cultural fusion', 'Festival color', 'Holographic patterns'],
  },
];

const STARTER_PORTFOLIOS: Portfolio[] = [
  { id: '1', name: 'Rainy AI Engineer', templateId: 'rain-glass', template: 'Rain Glass Lab', lastEdited: '2h ago', content: createDefaultContent('Rainy AI Engineer') },
  { id: '2', name: 'Visualizer Creative Dev', templateId: 'music-visualizer', template: 'Music Visualizer', lastEdited: '5d ago', content: createDefaultContent('Visualizer Creative Dev') },
  { id: '3', name: 'Aurora Frontend Lab', templateId: 'aurora-3d', template: 'Aurora 3D Grid', lastEdited: '1w ago', content: createDefaultContent('Aurora Frontend Lab') },
];

const TREND_NOTES = [
  'Interactive 3D should support navigation or proof, not just decoration.',
  'Glass UI works best when paired with solid readable sections.',
  'Reddit feedback keeps repeating the same truth: unique is good, but performance and content still win.',
  'Weather and sound themes make the portfolio memorable when users can still scan projects quickly.',
];

function getTemplate(id: string) {
  return TEMPLATES.find(template => template.id === id) || TEMPLATES[0];
}

function createDefaultContent(name = 'Creative Engineer'): PortfolioContent {
  return {
    fullName: name,
    role: 'Full Stack Developer',
    tagline: 'I design, build, and ship useful digital products with strong engineering and crisp interfaces.',
    bio: 'I turn rough ideas into reliable products: strategy, UI systems, backend flows, AI features, and launch-ready case studies.',
    location: 'Remote / India',
    availability: 'Open to internships, freelance, and full-time roles',
    email: 'hello@example.com',
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    website: 'https://yourname.dev',
    skills: 'React, TypeScript, Node.js, MongoDB, AI APIs, Tailwind, Product Thinking',
    metricOneLabel: 'Projects shipped',
    metricOneValue: '18',
    metricTwoLabel: 'Avg impact',
    metricTwoValue: '42%',
    testimonial: 'Sharp execution, strong product sense, and the rare ability to make complex systems feel simple.',
    projects: [
      {
        title: 'AI Career Engine',
        category: 'AI SaaS',
        summary: 'A guided career platform with resume intelligence, mock interviews, and skill planning.',
        outcome: 'Improved user completion by 42%',
        link: 'https://github.com/username/ai-career-engine',
      },
      {
        title: 'Realtime Hiring OS',
        category: 'Dashboard',
        summary: 'Admin and candidate workflow with live analytics, messaging, and hiring pipeline views.',
        outcome: 'Reduced manual tracking time by 60%',
        link: 'https://github.com/username/hiring-os',
      },
      {
        title: 'Interactive Resume Lab',
        category: 'Frontend',
        summary: 'A template-driven resume builder with previews, exports, and responsive editing states.',
        outcome: 'Launched 6 polished templates',
        link: 'https://github.com/username/resume-lab',
      },
    ],
  };
}

function WeatherLayer({ mood }: { mood: TemplateMood }) {
  if (mood === 'rain') {
    return (
      <div className="portfolio-weather-layer" aria-hidden="true">
        {Array.from({ length: 56 }).map((_, index) => (
          <span
            key={index}
            className="portfolio-rain-drop"
            style={{
              left: `${(index * 17) % 100}%`,
              animationDelay: `${(index % 12) * -0.22}s`,
              animationDuration: `${0.75 + (index % 5) * 0.12}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (mood === 'snow') {
    return (
      <div className="portfolio-weather-layer" aria-hidden="true">
        {Array.from({ length: 44 }).map((_, index) => (
          <span
            key={index}
            className="portfolio-snow-flake"
            style={{
              left: `${(index * 23) % 100}%`,
              animationDelay: `${(index % 14) * -0.35}s`,
              animationDuration: `${5 + (index % 6)}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (mood === 'aurora' || mood === 'sunset') {
    return <div className={`portfolio-aurora-field ${mood === 'sunset' ? 'portfolio-sunset-field' : ''}`} aria-hidden="true" />;
  }

  return null;
}

function MusicBars({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`portfolio-music-bars ${compact ? 'portfolio-music-bars-compact' : ''}`} aria-hidden="true">
      {Array.from({ length: compact ? 16 : 34 }).map((_, index) => (
        <span
          key={index}
          style={{
            animationDelay: `${index * -0.08}s`,
            height: `${28 + ((index * 19) % 72)}%`,
          }}
        />
      ))}
    </div>
  );
}

function TemplatePreviewArt({ template }: { template: PortfolioTemplate }) {
  return (
    <div className={`portfolio-template-art portfolio-mood-${template.mood} relative aspect-video rounded-[2rem] bg-gradient-to-br ${template.color} overflow-hidden border border-white/20 shadow-2xl`}>
      <WeatherLayer mood={template.mood} />
      {template.mood === 'music' && <MusicBars compact />}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute left-5 top-5 right-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-[9px] font-black uppercase tracking-widest text-white">
          {template.tag}
        </span>
      </div>
      <div className="absolute inset-x-6 bottom-6 grid grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-5">
          <div className="w-16 h-2 rounded-full bg-white/70 mb-4" />
          <div className="w-32 h-2 rounded-full bg-white/30 mb-2" />
          <div className="w-24 h-2 rounded-full bg-white/20" />
        </div>
        <div className="rounded-2xl bg-black/20 backdrop-blur-xl border border-white/15 p-4 flex items-end justify-center">
          <div className="portfolio-mini-cube" />
        </div>
      </div>
    </div>
  );
}

function LivePortfolioPreview({ portfolio, template }: { portfolio: Portfolio; template: PortfolioTemplate }) {
  const isLight = template.mood === 'snow';
  const content = portfolio.content;
  const skills = content.skills.split(',').map(skill => skill.trim()).filter(Boolean);

  return (
    <motion.div
      key={`${portfolio.id}-${template.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`portfolio-live-preview portfolio-mood-${template.mood} ${isLight ? 'portfolio-live-light' : ''}`}
      style={{ '--portfolio-accent': template.accent } as React.CSSProperties}
    >
      <WeatherLayer mood={template.mood} />
      <div className="portfolio-depth-grid" aria-hidden="true" />
      {template.mood === 'music' && <MusicBars />}

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[min(1120px,calc(100vw-2rem))] rounded-full border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center font-black" style={{ color: template.accent }}>
              {content.fullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{content.fullName}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-55 truncate">{content.role}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-75">
            <a href="#work" className="hover:opacity-100">Work</a>
            <a href="#about" className="hover:opacity-100">About</a>
            <a href="#skills" className="hover:opacity-100">Skills</a>
            <a href="#contact" className="hover:opacity-100">Contact</a>
          </div>
          <a href={`mailto:${content.email}`} className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black" style={{ backgroundColor: template.accent }}>
            Hire Me
          </a>
        </div>
      </nav>

      <section className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-36 pb-20 flex items-center overflow-hidden">
        <div className="absolute right-8 top-28 hidden lg:block portfolio-orbit-stage" aria-hidden="true">
          <div className="portfolio-orbit-card portfolio-orbit-card-a" />
          <div className="portfolio-orbit-card portfolio-orbit-card-b" />
          <div className="portfolio-orbit-card portfolio-orbit-card-c" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.35em]"
            >
              <Sparkles size={14} style={{ color: template.accent }} />
              {template.name}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
            >
              {content.fullName}
              <span className="block" style={{ color: template.accent }}>{content.role}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-lg md:text-2xl max-w-3xl leading-relaxed opacity-75"
            >
              {content.tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 text-sm font-bold opacity-75"
            >
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl">{content.location}</span>
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl">{content.availability}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#work" className="px-7 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02]" style={{ backgroundColor: template.accent }}>
                View Work
              </a>
              <a href={`mailto:${content.email}`} className="px-7 py-4 rounded-2xl text-sm font-black uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-xl transition-all hover:bg-white/20">
                Contact
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, rotateX: 16, rotateY: -18, y: 30 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, y: 0 }}
            transition={{ delay: 0.14, type: 'spring', damping: 18 }}
            className="portfolio-hero-device"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-300" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <AudioLines size={20} style={{ color: template.accent }} />
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 mb-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 border border-white/15 flex items-center justify-center">
                  <User size={34} style={{ color: template.accent }} />
                </div>
                <div>
                  <p className="text-xl font-black">{content.role}</p>
                  <p className="opacity-60 text-sm">{content.location}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed opacity-75">{content.bio}</p>
            </div>
            <div className="space-y-5">
              <div className="h-32 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 flex items-end justify-between">
                {[42, 78, 56, 88, 64, 96, 52].map((height, index) => (
                  <span key={index} className="w-7 rounded-full" style={{ height: `${height}%`, backgroundColor: template.accent, opacity: 0.45 + index * 0.06 }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/10 border border-white/15 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">{content.metricOneLabel}</p>
                  <p className="text-3xl font-black">{content.metricOneValue}</p>
                </div>
                <div className="rounded-3xl bg-white/10 border border-white/15 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">{content.metricTwoLabel}</p>
                  <p className="text-3xl font-black">{content.metricTwoValue}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="work" className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="portfolio-section-shell max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-8 mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-3" style={{ color: template.accent }}>Selected Work</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Projects that look like proof.</h2>
            </div>
            <p className="max-w-md text-base opacity-65 leading-relaxed">
              {content.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {content.projects.map((project, index) => (
              <motion.article
                key={`${project.title}-${index}`}
                whileHover={{ y: -8, rotateX: 4, rotateY: index === 1 ? 0 : index === 0 ? -4 : 4 }}
                className={`portfolio-project-card ${index === 1 ? 'lg:translate-y-10' : ''}`}
              >
                <div className="h-44 rounded-3xl mb-6 relative overflow-hidden border border-white/10" style={{ background: `linear-gradient(135deg, ${template.accent}55, rgba(255,255,255,0.08))` }}>
                  <div className="absolute inset-0 portfolio-card-grid" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-xl p-4">
                    <div className="h-2 w-24 rounded-full bg-white/60 mb-3" />
                    <div className="h-2 w-36 rounded-full bg-white/25" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-55 mb-2">{project.category} / Case 0{index + 1}</p>
                <h3 className="text-2xl font-black mb-3">{project.title}</h3>
                <p className="opacity-65 leading-relaxed mb-6">
                  {project.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black" style={{ color: template.accent }}>{project.outcome}</span>
                  <ArrowRight size={18} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
          <div className="portfolio-section-shell min-h-[360px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: template.accent }}>Profile</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">A real person behind the pixels.</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
                <p className="text-[10px] uppercase tracking-widest opacity-55 font-black mb-2">{content.metricOneLabel}</p>
                <p className="text-4xl font-black" style={{ color: template.accent }}>{content.metricOneValue}</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
                <p className="text-[10px] uppercase tracking-widest opacity-55 font-black mb-2">{content.metricTwoLabel}</p>
                <p className="text-4xl font-black" style={{ color: template.accent }}>{content.metricTwoValue}</p>
              </div>
            </div>
          </div>
          <div id="contact" className="portfolio-section-shell">
            <p className="text-xl md:text-3xl leading-relaxed font-bold opacity-85 mb-8">"{content.testimonial}"</p>
            <p className="text-lg leading-relaxed opacity-65">{content.bio}</p>
          </div>
        </div>
      </section>

      <section id="skills" className="relative z-10 px-6 md:px-12 lg:px-20 pb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.75fr_1fr] gap-6">
          <div className="portfolio-section-shell">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: template.accent }}>Stack</p>
            <h2 className="text-4xl font-black mb-8">Built for modern teams.</h2>
            <div className="flex flex-wrap gap-3">
              {skills.map(skill => (
                <span key={skill} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-bold backdrop-blur-xl">
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-8 text-lg leading-relaxed opacity-70">"{content.testimonial}"</p>
          </div>

          <div className="portfolio-section-shell">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: template.accent }}>Contact</p>
            <p className="text-lg opacity-70 mb-4">{content.email}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">Let’s make the next thing impossible to ignore.</h2>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Github, url: content.github },
                { icon: Linkedin, url: content.linkedin },
                { icon: Globe, url: content.website },
                { icon: Mail, url: `mailto:${content.email}` },
              ].map(({ icon: Icon, url }, index) => (
                <a key={index} href={url} target={url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-xl hover:scale-110 transition-transform">
                  <Icon size={22} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 md:px-12 lg:px-20 pb-12">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm opacity-55">
          <span>{content.fullName} / {content.role}</span>
          <span>{portfolio.name} built with HIREIQ Portfolio Studio</span>
        </div>
      </footer>
    </motion.div>
  );
}

export default function PortfolioBuilder() {
  const { user } = useUserStore();
  const [view, setView] = useState<View>('dashboard');
  const [portfolios, setPortfolios] = useState<Portfolio[]>(STARTER_PORTFOLIOS);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('rain-glass');
  const [contentForm, setContentForm] = useState<PortfolioContent>(() => createDefaultContent(user?.fullName || user?.email?.split('@')[0] || 'Creative Engineer'));

  const selectedTemplate = useMemo(() => getTemplate(selectedTemplateId), [selectedTemplateId]);
  const activePreviewTemplate = selectedPortfolio ? getTemplate(selectedPortfolio.templateId) : selectedTemplate;

  const updateContent = (field: keyof PortfolioContent, value: string) => {
    setContentForm(prev => ({ ...prev, [field]: value }));
  };

  const updateProject = (index: number, field: keyof PortfolioProject, value: string) => {
    setContentForm(prev => ({
      ...prev,
      projects: prev.projects.map((project, projectIndex) =>
        projectIndex === index ? { ...project, [field]: value } : project
      ),
    }));
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const template = getTemplate(selectedTemplateId);
    const newPortfolio: Portfolio = {
      id: Math.random().toString(36).slice(2, 11),
      name: newName.trim(),
      templateId: template.id,
      template: template.name,
      lastEdited: 'Just now',
      content: { ...contentForm, projects: contentForm.projects.map(project => ({ ...project })) },
    };
    setPortfolios([newPortfolio, ...portfolios]);
    setSelectedPortfolio(newPortfolio);
    setNewName('');
    setView('preview');
  };

  const deletePortfolio = (id: string) => {
    setPortfolios(portfolios.filter(portfolio => portfolio.id !== id));
  };

  const openPreview = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setView('preview');
  };

  const editPortfolio = (portfolio: Portfolio) => {
    setSelectedTemplateId(portfolio.templateId);
    setNewName(portfolio.name);
    setContentForm({ ...portfolio.content, projects: portfolio.content.projects.map(project => ({ ...project })) });
    setView('create');
  };

  const Sidebar = () => (
    <aside className="w-64 border-r border-border flex-col gap-2 p-5 hidden lg:flex bg-bg-secondary/40 backdrop-blur-xl">
      {[
        { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'templates' as const, label: 'Templates', icon: <PanelsTopLeft size={18} /> },
        { id: 'create' as const, label: 'Create New', icon: <Plus size={18} /> },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
            view === item.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      <button
        onClick={() => setView('dashboard')}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      >
        <Library size={18} />
        My Portfolios
      </button>

      <div className="mt-auto pt-6 border-t border-border space-y-4">
        <div className="rounded-2xl bg-bg-card border border-border p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Trend Signal</p>
          <p className="text-sm font-bold text-text-primary leading-snug">3D, glass, weather mood, and proof-first case studies.</p>
        </div>
        <button
          type="button"
          onClick={() => alert('Portfolio settings will be available after deployment is enabled.')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-hover transition-all text-sm font-bold"
        >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );

  return (
    <div className={view === 'preview' ? 'fixed inset-0 z-[80] bg-black overflow-y-auto custom-scrollbar' : 'flex bg-bg-primary min-h-[calc(100vh-140px)] rounded-[2rem] overflow-hidden border border-border shadow-2xl relative'}>
      {view !== 'preview' && <Sidebar />}

      <main className={view === 'preview' ? 'min-h-screen' : 'flex-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar p-5 md:p-8 lg:p-10'}>
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
                <div className="glass rounded-[2rem] border border-border p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400" />
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                        <Wand2 size={14} />
                        Trendy Portfolio Studio
                      </div>
                      <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">Portfolio Builder</h1>
                        <p className="text-text-secondary text-base md:text-lg mt-3 max-w-2xl">
                          Create weather-based, glass, 3D, and music visualizer portfolios that feel custom instead of template-copy.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setView('create')}
                      className="h-fit px-6 py-4 bg-accent text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20"
                    >
                      <Plus size={19} />
                      New Portfolio
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {[
                      { label: 'Templates', value: TEMPLATES.length, icon: <PanelsTopLeft size={18} className="text-accent" /> },
                      { label: 'Weather Modes', value: 3, icon: <CloudRain size={18} className="text-sky-400" /> },
                      { label: '3D Sections', value: 'Live', icon: <Layers3 size={18} className="text-emerald-400" /> },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-2xl bg-bg-secondary/60 border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                          {stat.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black text-text-primary">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-[2rem] border border-border p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Sparkles size={22} className="text-accent" />
                    <h2 className="text-xl font-black text-text-primary">Market Notes</h2>
                  </div>
                  <div className="space-y-3">
                    {TREND_NOTES.map(note => (
                      <div key={note} className="flex gap-3 text-sm text-text-secondary font-semibold leading-relaxed">
                        <Zap size={15} className="text-accent shrink-0 mt-0.5" />
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {portfolios.map(portfolio => {
                  const template = getTemplate(portfolio.templateId);
                  return (
                    <motion.div
                      key={portfolio.id}
                      layout
                      className="glass rounded-[2rem] border border-border overflow-hidden group hover:border-accent/40 transition-all flex flex-col shadow-xl"
                    >
                      <div className="relative overflow-hidden">
                        <TemplatePreviewArt template={template} />
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                          <button
                            onClick={() => openPreview(portfolio)}
                            className="p-4 bg-white text-black rounded-full hover:bg-accent hover:text-white transition-all shadow-2xl scale-90 group-hover:scale-100 duration-300"
                            aria-label="Preview portfolio"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => editPortfolio(portfolio)}
                            className="p-4 bg-white text-black rounded-full hover:bg-accent hover:text-white transition-all shadow-2xl scale-90 group-hover:scale-100 duration-300"
                            aria-label="Edit portfolio"
                          >
                            <Edit3 size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4 mb-5">
                          <div>
                            <h3 className="font-black text-text-primary text-xl mb-2">{portfolio.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{portfolio.template}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePortfolio(portfolio.id)}
                            className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            aria-label="Delete portfolio"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-border">
                          <span className="text-text-muted uppercase tracking-widest text-[10px]">Edited {portfolio.lastEdited}</span>
                          <button onClick={() => openPreview(portfolio)} className="flex items-center gap-1 text-accent">
                            Preview <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <button
                  onClick={() => setView('create')}
                  className="min-h-[360px] glass rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all group shadow-xl"
                >
                  <div className="p-6 rounded-3xl bg-bg-secondary group-hover:bg-accent/10 transition-all scale-90 group-hover:scale-100">
                    <Plus size={40} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-[0.2em]">Start New Portfolio</span>
                </button>
              </section>
            </motion.div>
          )}

          {view === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-3 tracking-tight">Template Gallery</h1>
                  <p className="text-text-secondary text-lg max-w-2xl">Pick a mood: rain, snow, aurora, music visualizer, terminal OS, or product storytelling.</p>
                </div>
                <button onClick={() => setView('create')} className="px-6 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                  Create With Selected
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
                {TEMPLATES.map(template => (
                  <div key={template.id} className="glass p-5 md:p-6 rounded-[2rem] border border-border flex flex-col gap-6 group hover:border-accent/30 transition-all shadow-2xl">
                    <TemplatePreviewArt template={template} />
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
                            {template.icon}
                            {template.tag}
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-text-primary">{template.name}</h2>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            setView('create');
                          }}
                          className="p-4 rounded-2xl bg-bg-secondary border border-border text-text-primary hover:bg-accent hover:text-white transition-all"
                          aria-label={`Use ${template.name}`}
                        >
                          <ChevronRight size={22} />
                        </button>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{template.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map(feature => (
                          <span key={feature} className="px-3 py-1.5 rounded-full bg-bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-muted">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{template.audience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-5">
                  <Palette size={14} />
                  Portfolio Template Engine
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">Choose the vibe, then launch.</h1>
                <p className="text-text-secondary text-lg">The preview is template-aware, so the portfolio mood changes with rain, snow, aurora, terminal, or music visual effects.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-7">
                <div className="glass p-6 md:p-8 rounded-[2rem] border border-border shadow-2xl space-y-7">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted uppercase tracking-[0.25em]">Portfolio Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder="e.g. Rainy Full Stack Portfolio"
                      className="w-full bg-bg-secondary border border-border rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-accent/50 transition-all text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-5 rounded-[2rem] border border-border bg-bg-secondary/50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20">
                        <User size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-text-primary">Your Portfolio Info</h2>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Hero, profile, links, metrics</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', field: 'fullName', placeholder: 'Rakesh Kumar' },
                        { label: 'Role / Title', field: 'role', placeholder: 'Full Stack Developer' },
                        { label: 'Location', field: 'location', placeholder: 'Bangalore / Remote' },
                        { label: 'Availability', field: 'availability', placeholder: 'Open to internships' },
                        { label: 'Email', field: 'email', placeholder: 'hello@example.com' },
                        { label: 'Website', field: 'website', placeholder: 'https://yourname.dev' },
                        { label: 'GitHub', field: 'github', placeholder: 'https://github.com/username' },
                        { label: 'LinkedIn', field: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
                      ].map(item => (
                        <label key={item.field} className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</span>
                          <input
                            value={contentForm[item.field as keyof PortfolioContent] as string}
                            onChange={(event) => updateContent(item.field as keyof PortfolioContent, event.target.value)}
                            placeholder={item.placeholder}
                            className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all"
                          />
                        </label>
                      ))}
                    </div>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Hero Tagline</span>
                      <textarea
                        value={contentForm.tagline}
                        onChange={(event) => updateContent('tagline', event.target.value)}
                        rows={3}
                        placeholder="One sharp sentence that tells recruiters what you build."
                        className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all resize-none"
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Bio / About</span>
                      <textarea
                        value={contentForm.bio}
                        onChange={(event) => updateContent('bio', event.target.value)}
                        rows={3}
                        placeholder="Short about text for your selected work section."
                        className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all resize-none"
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Skills, separated by commas</span>
                      <input
                        value={contentForm.skills}
                        onChange={(event) => updateContent('skills', event.target.value)}
                        placeholder="React, TypeScript, Node.js, AI APIs"
                        className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Metric 1 Label</span>
                        <input value={contentForm.metricOneLabel} onChange={(event) => updateContent('metricOneLabel', event.target.value)} className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Metric 1 Value</span>
                        <input value={contentForm.metricOneValue} onChange={(event) => updateContent('metricOneValue', event.target.value)} className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Metric 2 Label</span>
                        <input value={contentForm.metricTwoLabel} onChange={(event) => updateContent('metricTwoLabel', event.target.value)} className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Metric 2 Value</span>
                        <input value={contentForm.metricTwoValue} onChange={(event) => updateContent('metricTwoValue', event.target.value)} className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all" />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Testimonial / Proof Quote</span>
                      <textarea
                        value={contentForm.testimonial}
                        onChange={(event) => updateContent('testimonial', event.target.value)}
                        rows={2}
                        className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 transition-all resize-none"
                      />
                    </label>
                  </div>

                  <div className="space-y-5 rounded-[2rem] border border-border bg-bg-secondary/50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-text-primary">Project Case Studies</h2>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Figma-style cards: context, work, outcome</p>
                      </div>
                    </div>

                    {contentForm.projects.map((project, index) => (
                      <div key={index} className="rounded-2xl bg-bg-card border border-border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-text-primary">Project {index + 1}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Case Study</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={project.title} onChange={(event) => updateProject(index, 'title', event.target.value)} placeholder="Project title" className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50" />
                          <input value={project.category} onChange={(event) => updateProject(index, 'category', event.target.value)} placeholder="Category" className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50" />
                        </div>
                        <textarea value={project.summary} onChange={(event) => updateProject(index, 'summary', event.target.value)} rows={2} placeholder="What did you build and why?" className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50 resize-none" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={project.outcome} onChange={(event) => updateProject(index, 'outcome', event.target.value)} placeholder="Outcome, metric, result" className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50" />
                          <input value={project.link} onChange={(event) => updateProject(index, 'link', event.target.value)} placeholder="Project link" className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent/50" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted uppercase tracking-[0.25em]">Template</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`p-4 rounded-2xl border transition-all text-left flex gap-3 items-start relative overflow-hidden ${
                            selectedTemplateId === template.id
                              ? 'bg-accent/10 border-accent text-accent'
                              : 'bg-bg-secondary border-border text-text-secondary hover:border-accent/40'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-bg-card border border-border shrink-0">{template.icon}</div>
                          <div>
                            <div className="font-black text-sm text-text-primary">{template.name}</div>
                            <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{template.tag}</div>
                          </div>
                          {selectedTemplateId === template.id && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setView('dashboard')}
                      className="flex-1 py-4 bg-bg-secondary border border-border rounded-2xl font-black uppercase tracking-widest text-xs text-text-primary hover:bg-bg-hover transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className="flex-[2] py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-accent/30 disabled:opacity-50"
                    >
                      Create Portfolio
                    </button>
                  </div>
                </div>

                <div className="glass p-5 rounded-[2rem] border border-border shadow-2xl">
                  <TemplatePreviewArt template={selectedTemplate} />
                  <div className="p-4 md:p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">{selectedTemplate.tag}</p>
                    <h2 className="text-3xl font-black text-text-primary mb-3">{selectedTemplate.name}</h2>
                    <p className="text-text-secondary leading-relaxed mb-5">{selectedTemplate.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedTemplate.features.map(feature => (
                        <div key={feature} className="rounded-2xl bg-bg-secondary border border-border p-4 text-xs font-black uppercase tracking-widest text-text-muted">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'preview' && selectedPortfolio && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-2xl border border-white/20 px-4 md:px-6 py-3 rounded-full text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[90] max-w-[calc(100vw-2rem)]">
                <button
                  onClick={() => setView('dashboard')}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  aria-label="Back to portfolio dashboard"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="h-6 w-px bg-white/20" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest truncate max-w-[160px] md:max-w-none">{selectedPortfolio.name}</span>
                <div className="h-6 w-px bg-white/20 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => alert('Deployment export is not connected yet. Use preview to review your portfolio.')}
                  className="hidden sm:flex px-5 py-2 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent-soft transition-all items-center gap-2"
                >
                  Deploy <ArrowRight size={14} />
                </button>
              </div>

              <LivePortfolioPreview portfolio={selectedPortfolio} template={activePreviewTemplate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

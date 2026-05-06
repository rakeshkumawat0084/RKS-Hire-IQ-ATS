import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Mic, Compass, Zap, Lock, Users } from 'lucide-react';
import { useUserStore } from '../../store';

export default function Home() {
  const { user } = useUserStore();

  const features = [
    {
      icon: <Bot className="text-accent" />,
      title: "AI Resume Analyzer",
      desc: "Upload your resume and get instant feedback on ATS compatibility, keywords, and formatting.",
      path: "/app/resume"
    },
    {
      icon: <Zap className="text-accent" />,
      title: "AI Resume Maker",
      desc: "Don't have a resume? Create a polished, ATS-optimized, and job-ready resume from scratch in minutes.",
      path: "/app/resume-maker"
    },
    {
      icon: <Mic className="text-accent" />,
      title: "Mock Interview Coach",
      desc: "Practice with our AI interviewer. Get real-time feedback on your answers and performance.",
      path: "/app/interview"
    }
  ];

  return (
    <div className="px-6">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto pt-12 md:pt-20 pb-20 md:pb-32 flex flex-col items-center text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 bg-accent/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4"
        >
          <span className="px-3 md:px-4 py-1.5 rounded-full border border-border bg-bg-card text-accent text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 inline-block shadow-lg">
            Propel Your Career with AI
          </span>
          <h1 className="text-4xl md:text-8xl font-black mb-6 md:mb-8 tracking-tighter max-w-4xl leading-[0.95] md:leading-[0.9] uppercase italic">
            HIRE SMARTER. <br />
            <span className="text-text-muted not-italic">GROW FASTER.</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mb-10 md:mb-12 font-medium leading-relaxed">
            The elite AI suite for modern job seekers. High-precision resume analysis, behavioral interview coaching, and automated job matching.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={user ? "/app/resume" : "/login"}
              className="px-6 md:px-8 py-3.5 md:py-4 bg-accent text-white rounded-full font-bold text-base md:text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 group/btn"
            >
              Analyze My Resume <ArrowRight className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about"
              className="px-6 md:px-8 py-3.5 md:py-4 glass rounded-full font-bold text-base md:text-lg hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 border-y border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4">
          {[
            { label: 'Resumes Analyzed', value: '10k+' },
            { label: 'ATS Pass Rate', value: '95%' },
            { label: 'Companies Hiring', value: '500+' },
            { label: 'Success Rate', value: '88%' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
              <div className="text-text-secondary text-[10px] md:text-sm uppercase tracking-wider font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto py-20 md:py-32 px-4">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to succeed</h2>
          <p className="text-text-secondary text-sm md:text-base">AI-powered tools built for the modern workforce.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative"
            >
              <Link 
                to={!user ? "/login" : feature.path}
                className="card-modern p-6 md:p-8 rounded-2xl md:rounded-3xl glow-accent group flex flex-col h-full overflow-hidden"
              >
                {!user && (
                  <div className="absolute inset-0 bg-bg-secondary/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center group-hover:backdrop-blur-[4px] transition-all">
                    <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                      <Lock size={20} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1">Authenticated Only</div>
                    <div className="text-text-primary text-sm font-bold">Login to Unlock</div>
                  </div>
                )}
                
                <div className={`flex flex-col h-full ${!user ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20 group-hover:bg-accent group-hover:scale-110 group-hover:rotate-3 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-3 group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-xs md:text-sm font-medium opacity-80 mb-6 flex-grow">{feature.desc}</p>
                  
                  <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {user ? "Open Feature" : "Get Started"} <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto pb-20 md:pb-32 px-4 shadow-[0_0_60px_-15px_rgba(99,102,241,0.1)]">
        <div className="card-modern p-10 md:p-20 rounded-3xl md:rounded-[3rem] relative overflow-hidden text-center group">
          <div className="absolute top-0 left-0 w-full h-full bg-accent/5 pointer-events-none group-hover:bg-accent/10 transition-all duration-500"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 bg-accent/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="relative z-10 px-4">
            <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-10 leading-[0.95] tracking-tighter uppercase italic">Ready to supercharge <br/><span className="text-text-muted not-italic">your career?</span></h2>
            <Link 
              to={user ? "/app/dashboard" : "/register"}
              className="px-8 md:px-12 py-4 md:py-5 bg-accent text-white rounded-full font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(99,102,241,0.4)] inline-block"
            >
              {user ? "View My Dashboard" : "Join 10,000+ Users"}
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Features Section */}
      <section className="max-w-7xl mx-auto py-24 relative overflow-hidden px-4">
        {/* Background Accents */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Product Roadmap</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-text-primary">
              The Future of <span className="text-accent">HireIQ</span>
            </h2>
            <p className="text-text-secondary mt-4 font-medium text-sm md:text-base opacity-80 leading-relaxed">
              Our R&D lab is working on the next generation of career tools. Get ready for total industry dominance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4">
          {[
            {
              title: "Video Mock AI",
              desc: "Face-to-face AI interviews with real-time expression & sentiment analysis.",
              status: "Q3 2026",
              icon: <Mic className="w-5 h-5" />
            },
            {
              title: "Market Intel",
              desc: "Live salary scraping and skill-demand forecasting powered by global data.",
              status: "In Development",
              icon: <Compass className="w-5 h-5" />
            },
            {
              title: "Peer Sync",
              desc: "Anonymous collaborative prep rooms for high-stakes FAANG interviews.",
              status: "Beta Testing",
              icon: <Users className="w-5 h-5" size={20} />
            },
            {
              title: "Ghost Writer",
              desc: "AI that drafts perfectly tailored cover letters in your unique professional voice.",
              status: "Rolling Out",
              icon: <Zap className="w-5 h-5" />
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl bg-bg-card border border-border hover:border-accent/30 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="text-8xl font-black tracking-tighter">0{i+1}</div>
              </div>
              
              <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center text-text-secondary group-hover:bg-accent group-hover:text-white transition-all mb-6">
                {feature.icon.type === Mic ? <Mic size={20} /> : 
                 feature.icon.type === Compass ? <Compass size={20} /> :
                 feature.icon.type === Zap ? <Zap size={20} /> :
                 <Bot size={20} />
                }
              </div>
              
              <div className="space-y-2 relative z-10">
                <h4 className="font-black italic uppercase text-lg tracking-tight group-hover:text-accent transition-colors">
                  {feature.title}
                </h4>
                <p className="text-text-secondary text-xs font-medium leading-relaxed opacity-70">
                  {feature.desc}
                </p>
                <div className="pt-4 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-bg-hover rounded-md border border-border text-text-muted">
                    {feature.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

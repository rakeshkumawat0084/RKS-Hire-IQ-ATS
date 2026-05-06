import { motion } from 'framer-motion';
import { Target, Users, Zap, Github, Twitter, Linkedin, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const team = [
    {
      name: "Rakesh Kumawat",
      role: "Founder & CEO",
      origin: "Founder",
      image: "/team/rakesh-ceo.png",
      bio: "Visionary leader with a decade of expertise in machine learning and career architecture.",
      social: { 
        twitter: "https://x.com/rakesh", 
        linkedin: "https://www.linkedin.com/in/rakesh-kumawat-353571344/", 
        github: "https://github.com/rakeshkumawat0084" 
      }
    },
    {
      name: "Harshit Mahawar",
      role: "Web Developer",
      origin: "Frontend & Web Systems",
      image: "/team/harshit-webdev.png",
      bio: "Building the polished web experience that brings our AI career tools to life.",
      social: { 
        twitter: "https://x.com/harshit", 
        linkedin: "https://www.linkedin.com/in/starlight-mii-6a3637321/", 
        github: "https://github.com/starlightmii" 
      }
    },
    {
      name: "Pankaj Bagariya",
      role: "GenAI Lead",
      origin: "AI Specialist",
      image: "/team/pankaj-genai.png",
      bio: "Focusing on high-precision behavioral analysis and intelligent career matching algorithms.",
      social: { 
        twitter: "https://x.com/pankaj", 
        linkedin: "https://www.linkedin.com/in/starlight-mii-6a3637321/", 
        github: "https://github.com/starlightmii" 
      }
    },
    {
      name: "Shashank Jain",
      role: "Data Collection Lead",
      origin: "Research & Data",
      image: "/team/shashank-data-collect.png",
      bio: "Curating the data and research that keep our career intelligence sharp and useful.",
      social: { 
        twitter: "https://x.com/shashank", 
        linkedin: "https://www.linkedin.com/in/starlight-mii-6a3637321/", 
        github: "https://github.com/starlightmii" 
      }
    }
  ];

  const milestones = [
    { 
      year: "2026", 
      title: "The Genesis", 
      desc: "Founded with the mission to democratize elite career coaching through advanced AI." 
    },
    { 
      year: "2026", 
      title: "10k Milestone", 
      desc: "Successfully analyzed over 10,000 resumes with our proprietary ATS scoring engine." 
    },
    { 
      year: "2026", 
      title: "Market Leader", 
      desc: "Launched behavioral mock interview suite, setting the new industry standard." 
    }
  ];

  return (
    <div className="px-6 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">
            Our Story & Vision
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic text-text-primary">
            Revolutionizing <br />
            <span className="text-text-muted not-italic">the workforce.</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            We are a team of AI engineers and career architects dedicated to building the tools that empower the next generation of professionals.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto py-24 mb-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10 p-4">
          <div className="card-modern p-10 rounded-[2.5rem] bg-accent/5 border-accent/20">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white mb-8 shadow-[0_10px_30px_rgba(99,102,241,0.4)]">
              <Target size={32} />
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-text-primary">Our Mission</h3>
            <p className="text-text-secondary text-lg leading-relaxed font-medium">To provide every job seeker with world-class, AI-driven insights that were previously only available to the elite 1%.</p>
          </div>
          <div className="card-modern p-10 rounded-[2.5rem] bg-blue-500/5 border-blue-500/20">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white mb-8 shadow-[0_10px_30px_rgba(59,130,246,0.4)]">
              <Zap size={32} />
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-text-primary">Our Vision</h3>
            <p className="text-text-secondary text-lg leading-relaxed font-medium">A world where talent meets opportunity instantly, powered by transparent, high-precision AI matching.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto py-24 mb-32 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-text-primary">Our Team</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Meet the dedicated professionals working behind the scenes to build the future of AI-driven career growth.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div key={i} className="bg-bg-card rounded-2xl overflow-hidden border border-border group hover:border-accent/40 transition-all shadow-xl">
              <div className="relative h-80 overflow-hidden bg-slate-950">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 pt-16 pb-5 bg-gradient-to-t from-black via-black/70 to-transparent">
                  <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                    {member.origin}
                  </div>
                  <div
                    className="px-3 text-center text-3xl font-normal uppercase leading-none text-white drop-shadow-[0_8px_18px_rgba(0,0,0,0.72)] sm:text-[2rem]"
                    style={{ fontFamily: '"tephra-0", "Tephra 0", "Tephra 0 Regular", serif' }}
                  >
                    {member.name}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-accent text-sm font-black uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {member.bio}
                </p>
                <div className="flex gap-4">
                  <a href={member.social.twitter} className="text-text-muted hover:text-accent transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href={member.social.linkedin} className="text-text-muted hover:text-accent transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href={member.social.github} className="text-text-muted hover:text-accent transition-colors">
                    <Github size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones Section */}
      <section className="max-w-7xl mx-auto py-24 mb-32 px-4">
        <div className="flex items-center gap-4 mb-20">
          <div className="h-[2px] flex-grow bg-border"></div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight whitespace-nowrap text-text-primary">Milestones</h2>
          <div className="h-[2px] flex-grow bg-border"></div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-border hidden md:block"></div>
          <div className="space-y-12 md:space-y-32">
            {milestones.map((ms, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className="flex-1 text-center md:text-right">
                  <div className={`md:pr-12 ${i % 2 === 0 ? '' : 'md:text-left md:pl-12 md:pr-0'}`}>
                    <div className="text-accent text-5xl font-black mb-4 group-hover:scale-110 transition-transform">{ms.year}</div>
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-4 text-text-primary">{ms.title}</h4>
                    <p className="text-text-secondary leading-relaxed font-medium">{ms.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 w-12 h-12 rounded-full bg-bg-card border-4 border-accent flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                  <Award size={20} className="text-accent" />
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="card-modern p-12 md:p-20 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[0.95] tracking-tighter uppercase italic">
                Join the <br />
                <span className="text-text-muted not-italic">Innovation.</span>
              </h2>
              <p className="text-text-secondary text-lg mb-10 font-medium max-w-xl mx-auto lg:mx-0">
                We're always looking for ambitious engineers, designers, and visionaries to help us define the future of career architecture.
              </p>
              <Link 
                to="/contact"
                className="inline-block px-10 py-5 bg-accent text-white rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(99,102,241,0.4)]"
              >
                Contact Hiring Team
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Zap size={20} />, title: "Hyper Growth", desc: "Fast-paced environment" },
                { icon: <Target size={20} />, title: "Clear Impact", desc: "Build meaningful tools" },
                { icon: <Award size={20} />, title: "Elite Peers", desc: "Learn from the best" },
                { icon: <Clock size={20} />, title: "Remote First", desc: "Work from anywhere" }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-bg-primary/50 border border-border/50 backdrop-blur-sm group hover:border-accent/30 transition-colors">
                  <div className="text-accent mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-sm font-black uppercase tracking-widest mb-1">{feature.title}</h4>
                  <p className="text-text-secondary text-[10px] uppercase font-bold tracking-wider">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import { Mail, Phone, MapPin, Globe, Download, User } from "lucide-react";
import { motion } from "framer-motion";
import { ResumeData } from "./types";
import { THEMES } from "./constants";

interface ResumePreviewProps {
  data: ResumeData;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  if (!data || !data.personalInfo) return null;

  const { personalInfo, education = [], experience = [], skills = [], templateId, colorTheme } = data;
  const activeTheme = THEMES.find(t => t.id === colorTheme) || THEMES[0];

  const handleDownload = () => window.print();

  const Header = ({ centered = false }) => (
    <motion.header variants={item} className={`border-b-2 border-gray-900 pb-8 mb-8 ${centered ? "text-center" : ""}`}>
      <div className={`flex items-center gap-6 ${centered ? "flex-col" : ""}`}>
        {personalInfo.profilePicture && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 p-1 shrink-0" style={{ borderColor: activeTheme.primary }}>
            <img src={personalInfo.profilePicture} alt={personalInfo.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
        )}
        <div className={centered ? "text-center" : ""}>
          <h1 className="text-5xl font-serif font-bold text-gray-900 uppercase tracking-tighter mb-4">
            {personalInfo.fullName}
          </h1>
          <div className={`flex flex-wrap ${centered ? "justify-center" : ""} gap-x-6 gap-y-2 text-sm font-medium text-gray-600`}>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {personalInfo.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>
            {personalInfo.website && (
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {personalInfo.website}</span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );

  const Section = ({ title, children, className = "" }) => (
    <motion.section variants={item} className={className}>
      <h3 className="section-title" style={{ color: activeTheme.primary, borderBottomColor: `${activeTheme.primary}40` }}>{title}</h3>
      {children}
    </motion.section>
  );

  const renderLayout = () => {
    switch (templateId) {
      case "executive":
        return (
          <div className="flex gap-12 h-full min-h-[1056px]">
            <div className="w-1/3 space-y-10 bg-gray-50 -ml-12 -mt-12 -mb-12 p-12 h-full">
              <div className="flex flex-col items-center text-center">
                {personalInfo.profilePicture && (
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-white shadow-xl">
                    <img src={personalInfo.profilePicture} alt={personalInfo.fullName} className="w-full h-full object-cover" />
                  </div>
                )}
                <h2 className="text-3xl font-serif font-bold text-gray-900">{personalInfo.fullName}</h2>
              </div>
              <Section title="Contact">
                <ul className="text-sm space-y-4 text-gray-600">
                  <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> {personalInfo.email}</li>
                  <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> {personalInfo.phone}</li>
                  <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {personalInfo.location}</li>
                </ul>
              </Section>
              <Section title="Education">
                <div className="space-y-6">
                  {education.map((edu, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="font-bold text-gray-900 text-sm">{edu.degree}</div>
                      <div className="text-xs text-gray-600">{edu.school}</div>
                      <div className="text-xs font-mono text-gray-400">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Expertise">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            </div>
            <div className="w-2/3 space-y-12 py-4">
              <Section title="Professional Summary">
                <p className="text-gray-700 leading-relaxed text-sm">{personalInfo.summary}</p>
              </Section>
              <Section title="Work Experience">
                <div className="space-y-10">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-lg font-bold text-gray-900">{exp.role}</h4>
                        <span className="text-xs font-mono font-medium text-gray-400 uppercase">{exp.duration}</span>
                      </div>
                      <div className="text-sm font-semibold" style={{ color: activeTheme.primary }}>{exp.company}</div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        );
      case "tech":
        return (
          <div className="font-mono space-y-12">
            <header className="border-4 border-gray-900 p-8 flex justify-between items-center bg-gray-50">
              <div className="space-y-3">
                <h1 className="text-5xl font-black bg-gray-900 text-white px-4 py-2 inline-block shadow-[4px_4px_0px_#2563eb]">{personalInfo.fullName}</h1>
                <div className="text-xs space-x-12 opacity-80 uppercase tracking-widest pt-2">
                  <span>{personalInfo.email}</span>
                  <span>{personalInfo.location}</span>
                </div>
              </div>
              {personalInfo.profilePicture && (
                <div className="w-24 h-24 border-4 border-gray-900 grayscale">
                  <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
            </header>
            <div className="grid grid-cols-4 gap-12">
              <div className="w-1/4 space-y-12">
                <Section title="SUMMARY_DATA">
                   <p className="text-sm bg-blue-50/50 p-6 border-l-4 border-blue-600 leading-relaxed">{personalInfo.summary}</p>
                </Section>
                <Section title="PROJECTS_EXPERIENCE">
                  {experience.map(exp => (
                    <div key={exp.company} className="mb-10 group">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="text-base font-black uppercase text-gray-900 group-hover:text-blue-600 transition-colors">[{exp.role}]</h4>
                          <span className="text-[10px] text-gray-400">{exp.duration}</span>
                       </div>
                       <div className="text-xs font-bold text-gray-500 mb-4">{exp.company}</div>
                       <p className="text-xs leading-relaxed whitespace-pre-line text-gray-700 border-l border-gray-200 pl-4">{exp.description}</p>
                    </div>
                  ))}
                </Section>
              </div>
              <div className="col-span-1 space-y-12">
                <Section title="SKILL_STACK">
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => <span key={s} className="bg-gray-100 px-2 py-1 text-[10px] border border-gray-300 font-bold">{s}</span>)}
                  </div>
                </Section>
                <Section title="EDUCATION">
                   {education.map(edu => (
                     <div key={edu.degree} className="mb-4">
                       <div className="text-[10px] font-black">{edu.degree}</div>
                       <div className="text-[10px] text-gray-400">{edu.school}</div>
                     </div>
                   ))}
                </Section>
              </div>
            </div>
          </div>
        );
      case "creative":
        return (
          <div className="space-y-0">
             <div className="flex -mx-12 -mt-12 mb-12 h-80 overflow-hidden relative">
                <div className="w-2/3 p-12 text-white flex flex-col justify-end" style={{ backgroundColor: activeTheme.primary }}>
                   <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-4 drop-shadow-lg">
                      {personalInfo.fullName.split(' ')[0]}<br/>
                      {personalInfo.fullName.split(' ')[1] || ''}
                   </h1>
                   <div className="flex gap-6 text-xs font-bold tracking-[0.2em] bg-black/20 p-3 rounded-lg backdrop-blur-md w-fit">
                      <span>{personalInfo.email}</span>
                      <span>{personalInfo.location}</span>
                   </div>
                </div>
                <div className="w-1/3 bg-gray-200 relative grayscale hover:grayscale-0 transition-all duration-700 ease-in-out cursor-crosshair">
                   {personalInfo.profilePicture ? (
                     <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-20 h-20" /></div>
                   )}
                   <div className="absolute inset-0 border-[20px] border-transparent hover:border-white/20 transition-all"></div>
                </div>
             </div>
             <div className="flex gap-12">
                <div className="w-2/3 space-y-12">
                   <Section title="The Story">
                      <p className="text-2xl font-serif italic text-gray-700 leading-tight">"{personalInfo.summary}"</p>
                   </Section>
                   <Section title="The Journey">
                      {experience.map(exp => (
                        <div key={exp.company} className="mb-10 relative pl-8 border-l-2 border-gray-100 group">
                           <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300 group-hover:scale-150 transition-transform" style={{ backgroundColor: activeTheme.primary }}></div>
                           <h4 className="text-xl font-black uppercase tracking-tighter mb-1" style={{ color: activeTheme.primary }}>{exp.company}</h4>
                           <div className="flex justify-between font-bold text-xs mb-3">
                              <span>{exp.role}</span>
                              <span className="text-gray-400">{exp.duration}</span>
                           </div>
                           <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                   </Section>
                </div>
                <div className="w-1/3 space-y-12">
                   <Section title="Expertise">
                      <div className="flex flex-wrap gap-2">
                        {skills.map(s => <span key={s} className="px-4 py-2 bg-gray-900 text-white font-black text-[10px] uppercase tracking-tighter hover:scale-110 transition-transform">#{s}</span>)}
                      </div>
                   </Section>
                   <Section title="Learning">
                      {education.map(edu => (
                        <div key={edu.degree} className="mb-6">
                           <div className="font-black text-sm uppercase leading-tight mb-1">{edu.degree}</div>
                           <div className="text-xs text-gray-500 font-medium">{edu.school}</div>
                           <div className="text-[10px] font-mono text-gray-400">{edu.year}</div>
                        </div>
                      ))}
                   </Section>
                </div>
             </div>
          </div>
        );
      case "gradient":
        return (
          <div className="space-y-0">
             <div className="h-64 -mx-12 -mt-12 mb-12 p-12 text-white relative overflow-hidden" 
                  style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.primary}dd)` }}>
                <div className="relative z-10 flex justify-between items-end h-full">
                   <div>
                      <h1 className="text-6xl font-black tracking-tight mb-2">{personalInfo.fullName}</h1>
                      <div className="flex gap-4 opacity-80 text-sm font-medium">
                         <span>{personalInfo.email}</span>
                         <span>{personalInfo.location}</span>
                      </div>
                   </div>
                   {personalInfo.profilePicture && (
                      <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm">
                         <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                   )}
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
             </div>
             <div className="flex gap-12 px-2">
                <div className="w-2/3 space-y-12">
                   <Section title="Profile Overview">
                      <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                   </Section>
                   <Section title="Career Path">
                      <div className="space-y-10">
                         {experience.map(exp => (
                           <div key={exp.company} className="group">
                              <div className="flex justify-between items-center mb-2">
                                 <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{exp.role}</h4>
                                 <span className="text-xs font-bold text-gray-400">{exp.duration}</span>
                              </div>
                              <div className="text-sm font-black mb-4 uppercase tracking-widest px-2 py-0.5 rounded w-fit" 
                                   style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                                 {exp.company}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                           </div>
                         ))}
                      </div>
                   </Section>
                </div>
                <div className="w-1/3 space-y-12">
                   <Section title="Skills & Mastery">
                      <div className="space-y-2">
                         {skills.map(s => (
                           <div key={s} className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-gray-700">{s}</span>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.random() * 40 + 60}%`, backgroundColor: activeTheme.primary }} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </Section>
                   <Section title="Education">
                      {education.map(edu => (
                         <div key={edu.degree} className="mb-4">
                            <div className="font-bold text-sm">{edu.degree}</div>
                            <div className="text-xs text-gray-400">{edu.school}</div>
                         </div>
                      ))}
                   </Section>
                </div>
             </div>
          </div>
        );
      case "timeline":
        return (
          <div className="space-y-12 max-w-[700px] mx-auto py-8">
             <header className="flex items-center gap-10 border-b-4 pb-12" style={{ borderColor: activeTheme.primary }}>
                {personalInfo.profilePicture && (
                   <div className="w-32 h-32 rounded-full ring-8 ring-gray-50 shrink-0 overflow-hidden">
                      <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                )}
                <div>
                   <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{personalInfo.fullName}</h1>
                   <div className="flex gap-4 text-xs font-bold text-gray-400 tracking-widest">
                      <span>{personalInfo.email}</span>
                      <span>{personalInfo.location}</span>
                   </div>
                </div>
             </header>
             <div className="relative space-y-20 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100 pl-12">
                <Section title="The Objective" className="relative">
                   <div className="absolute -left-[54px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: activeTheme.primary }} />
                   <p className="text-xl font-serif italic text-gray-600 leading-tight">{personalInfo.summary}</p>
                </Section>
                <Section title="The Experience" className="relative">
                   <div className="absolute -left-[54px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: activeTheme.primary }} />
                   <div className="space-y-12">
                      {experience.map(exp => (
                         <div key={exp.company} className="relative group">
                            <div className="absolute -left-[64px] top-1 text-[10px] font-black text-gray-300 transform -rotate-90 group-hover:text-gray-900 transition-colors uppercase whitespace-nowrap">
                               {exp.duration.split('-')[0]}
                            </div>
                            <h4 className="text-xl font-bold mb-1">{exp.role}</h4>
                            <div className="text-sm font-black mb-4 uppercase" style={{ color: activeTheme.primary }}>{exp.company}</div>
                            <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                         </div>
                      ))}
                   </div>
                </Section>
                <Section title="The Foundation" className="relative">
                    <div className="absolute -left-[54px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: activeTheme.primary }} />
                    <div className="grid grid-cols-2 gap-12">
                       <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Skills</h5>
                          <div className="flex flex-wrap gap-2">
                             {skills.map(s => <span key={s} className="px-2 py-1 bg-gray-50 text-[10px] font-bold border border-gray-200">{s}</span>)}
                          </div>
                       </div>
                       <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Degrees</h5>
                          {education.map(edu => (
                             <div key={edu.degree} className="mb-4">
                                <div className="text-xs font-bold">{edu.degree}</div>
                                <div className="text-[10px] text-gray-500">{edu.school}</div>
                             </div>
                          ))}
                       </div>
                    </div>
                </Section>
             </div>
          </div>
        );
      case "functional":
        return (
          <div className="space-y-12">
             <header className="flex justify-between items-start border-b-2 border-black pb-8">
                <div>
                   <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-4">{personalInfo.fullName}</h1>
                   <div className="flex gap-4 text-sm font-bold text-gray-500">
                      <span>{personalInfo.email}</span>
                      <span>{personalInfo.phone}</span>
                      <span>{personalInfo.location}</span>
                   </div>
                </div>
                {personalInfo.profilePicture && (
                   <div className="w-24 h-24 border-4 border-black p-1 shadow-[4px_4px_0px_#000]">
                      <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                )}
             </header>
             <Section title="Core Competencies">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                   {skills.map(s => (
                      <div key={s} className="flex items-center gap-4 group">
                         <div className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform" style={{ backgroundColor: activeTheme.primary }} />
                         <span className="text-sm font-bold text-gray-900">{s}</span>
                      </div>
                   ))}
                </div>
             </Section>
             <Section title="Professional Summary">
                <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">{personalInfo.summary}</p>
             </Section>
             <div className="grid grid-cols-2 gap-12">
                <Section title="Selected Experience">
                   <div className="space-y-8">
                      {experience.map(exp => (
                         <div key={exp.company}>
                            <h4 className="font-bold text-gray-900">{exp.role}</h4>
                            <div className="text-xs font-bold uppercase text-gray-400 mb-2">{exp.company} | {exp.duration}</div>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{exp.description}</p>
                         </div>
                      ))}
                   </div>
                </Section>
                <Section title="Educational Background">
                    {education.map(edu => (
                       <div key={edu.degree} className="mb-6 pb-6 border-b border-gray-100 last:border-0">
                          <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                          <div className="text-xs text-gray-500 font-medium">{edu.school}</div>
                          <div className="text-[10px] font-mono mt-1 text-gray-400">{edu.year}</div>
                       </div>
                    ))}
                </Section>
             </div>
          </div>
        );
      case "brutalist":
        return (
          <div className="border-[8px] border-black p-8 font-mono space-y-12 bg-white">
            <header className="flex flex-col md:flex-row items-center gap-8 border-b-8 border-black pb-8">
              {personalInfo.profilePicture && (
                <div className="w-32 h-32 border-4 border-black shadow-[8px_8px_0px_#000]">
                  <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-6xl font-black uppercase leading-tight -rotate-1">{personalInfo.fullName}</h1>
                <div className="flex gap-4 font-bold text-sm bg-black text-white p-2 w-fit mt-4">
                  <span>{personalInfo.email}</span>
                  <span>{personalInfo.location}</span>
                </div>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <Section title="EXPERIENCE_BLOCK">
                  {experience.map(exp => (
                    <div key={exp.company} className="border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                       <h4 className="font-black uppercase text-xl">{exp.role}</h4>
                       <div className="font-bold underline">{exp.company}</div>
                       <div className="text-xs opacity-60 mb-4">{exp.duration}</div>
                       <p className="text-sm whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
               </Section>
               <div className="space-y-12">
                  <Section title="SKILLS_LIST">
                     <div className="flex flex-wrap gap-2">
                        {skills.map(s => <span key={s} className="border-2 border-black px-3 py-1 font-black bg-yellow-300">#{s}</span>)}
                     </div>
                  </Section>
                  <Section title="EDUCATION">
                     {education.map(edu => (
                       <div key={edu.degree} className="border-2 border-black p-4 bg-blue-100">
                          <div className="font-black uppercase">{edu.degree}</div>
                          <div className="text-xs">{edu.school}</div>
                       </div>
                     ))}
                  </Section>
               </div>
            </div>
          </div>
        );
      case "academic":
        return (
          <div className="font-serif px-12 py-16 space-y-12 bg-white max-w-[800px] mx-auto">
             <header className="text-center border-b border-gray-300 pb-8">
                <h1 className="text-3xl uppercase tracking-[0.2em] font-medium mb-4">{personalInfo.fullName}</h1>
                <div className="text-xs italic space-x-4 grayscale opacity-80">
                   <span>{personalInfo.location}</span>
                   <span>•</span>
                   <span>{personalInfo.email}</span>
                   <span>•</span>
                   <span>{personalInfo.phone}</span>
                </div>
             </header>
             <Section title="Professional Narrative">
                <p className="text-sm leading-relaxed text-justify indent-8">{personalInfo.summary}</p>
             </Section>
             <Section title="Professional Appointments">
                <div className="space-y-8">
                   {experience.map(exp => (
                     <div key={exp.company} className="grid grid-cols-4 gap-8">
                        <div className="text-[10px] uppercase font-bold text-gray-500 pt-1">{exp.duration}</div>
                        <div className="w-1/4 space-y-2">
                           <h4 className="font-bold italic text-gray-900">{exp.role}</h4>
                           <div className="text-xs uppercase tracking-wider">{exp.company}</div>
                           <p className="text-sm leading-relaxed text-gray-600">{exp.description}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </Section>
             <Section title="Academic Credentials">
                {education.map(edu => (
                   <div key={edu.degree} className="grid grid-cols-4 gap-8 mb-4">
                      <div className="text-[10px] font-mono text-gray-400">{edu.year}</div>
                      <div className="w-1/4">
                         <div className="text-sm font-bold uppercase">{edu.school}</div>
                         <div className="text-xs italic text-gray-600">{edu.degree}</div>
                      </div>
                   </div>
                ))}
             </Section>
          </div>
        );
      case "sidebar-left":
        return (
          <div className="flex gap-0 -m-12 min-h-[1056px] h-[calc(100%+96px)]">
             <div className="w-1/3 p-12 text-white space-y-12 h-full" style={{ backgroundColor: activeTheme.primary }}>
                {personalInfo.profilePicture && (
                  <div className="w-32 h-32 rounded-3xl overflow-hidden mb-8 ring-4 ring-white/20">
                    <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <Section title="CONTACT">
                   <ul className="text-xs space-y-6 opacity-90">
                      <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> {personalInfo.email}</li>
                      <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> {personalInfo.phone}</li>
                      <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {personalInfo.location}</li>
                   </ul>
                </Section>
                <Section title="EDUCATION">
                   {education.map(edu => (
                     <div key={edu.degree} className="mb-6 opacity-90">
                        <div className="font-bold text-sm">{edu.degree}</div>
                        <div className="text-[10px] italic">{edu.school}</div>
                        <div className="text-[10px] font-mono mt-1 opacity-60">{edu.year}</div>
                     </div>
                   ))}
                </Section>
                <Section title="EXPERTISE">
                   <div className="flex flex-wrap gap-2">
                      {skills.map(s => <span key={s} className="px-2 py-1 bg-white/20 rounded text-[10px] font-medium">{s}</span>)}
                   </div>
                </Section>
             </div>
             <div className="w-2/3 p-12 bg-white space-y-12">
                <header>
                   <h1 className="text-5xl font-black tracking-tighter uppercase text-gray-900 leading-none mb-6">{personalInfo.fullName}</h1>
                   <p className="text-lg font-serif italic text-gray-500 leading-tight">"{personalInfo.summary}"</p>
                </header>
                <Section title="PROFESSIONAL EXPERIENCE">
                   <div className="space-y-12">
                      {experience.map(exp => (
                        <div key={exp.company} className="space-y-3 relative pl-6 border-l-2 border-gray-100">
                           <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full" style={{ backgroundColor: activeTheme.primary }}></div>
                           <div className="flex justify-between items-baseline">
                              <h4 className="text-xl font-bold text-gray-900">{exp.role}</h4>
                              <span className="text-xs font-mono font-bold text-gray-400">{exp.duration}</span>
                           </div>
                           <div className="text-sm font-black uppercase tracking-widest" style={{ color: activeTheme.primary }}>{exp.company}</div>
                           <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                   </div>
                </Section>
             </div>
          </div>
        );
      case "compact":
        return (
          <div className="text-[13px] leading-snug font-sans px-8 py-8 space-y-6">
             <header className="flex justify-between items-end border-b pb-4 mb-2">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight text-gray-900">{personalInfo.fullName}</h1>
                   <div className="flex gap-4 text-gray-500 mt-1 font-medium">
                      <span>{personalInfo.email}</span>
                      <span>{personalInfo.location}</span>
                   </div>
                </div>
                {personalInfo.profilePicture && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden grayscale">
                    <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
             </header>
             <p className="text-gray-700 italic border-l-4 pl-4" style={{ borderColor: activeTheme.primary }}>{personalInfo.summary}</p>
             <div className="flex gap-8">
                <div className="w-2/3 space-y-8">
                   <Section title="EXPERIENCE">
                      {experience.map(exp => (
                         <div key={exp.company}>
                            <div className="flex justify-between font-bold">
                               <span>{exp.role} @ {exp.company}</span>
                               <span className="text-gray-400 font-mono">{exp.duration}</span>
                            </div>
                            <p className="text-gray-600 mt-1 mb-4 leading-relaxed">{exp.description}</p>
                         </div>
                      ))}
                   </Section>
                </div>
                <div className="w-1/3 space-y-8">
                   <Section title="SKILLS">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 font-medium">
                         {skills.map(s => <span key={s}>{s}</span>)}
                      </div>
                   </Section>
                   <Section title="EDUCATION">
                      {education.map(edu => (
                         <div key={edu.degree} className="mb-2">
                            <div className="font-bold">{edu.degree}</div>
                            <div className="text-gray-500 text-xs">{edu.school}</div>
                         </div>
                      ))}
                   </Section>
                </div>
             </div>
          </div>
        );
      case "elegant":
        return (
          <div className="font-serif px-16 py-20 bg-stone-50 min-h-screen text-stone-900">
             <header className="text-center mb-16">
                {personalInfo.profilePicture && (
                   <div className="w-32 h-32 rounded-full mx-auto mb-8 border-2 p-1 overflow-hidden" style={{ borderColor: activeTheme.primary }}>
                      <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                   </div>
                )}
                <h1 className="text-6xl font-normal lowercase tracking-tighter mb-4 text-stone-900">{personalInfo.fullName}</h1>
                <div className="w-24 h-px bg-stone-300 mx-auto mb-4"></div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-sans">
                   {personalInfo.location} • {personalInfo.email}
                </div>
             </header>
             <div className="max-w-[700px] mx-auto space-y-20">
                <Section title="Overview" className="text-center">
                   <p className="text-xl italic leading-relaxed text-stone-600">{personalInfo.summary}</p>
                </Section>
                <div className="grid grid-cols-3 gap-16">
                   <div className="col-span-2 space-y-16">
                      <Section title="Professional History">
                         <div className="space-y-12">
                            {experience.map(exp => (
                               <div key={exp.company} className="space-y-3">
                                  <div className="flex justify-between items-baseline">
                                     <h4 className="text-lg italic font-medium">{exp.role}</h4>
                                     <span className="font-sans text-[9px] uppercase tracking-widest text-stone-400">{exp.duration}</span>
                                  </div>
                                  <div className="text-xs uppercase tracking-[0.2em] font-sans" style={{ color: activeTheme.primary }}>{exp.company}</div>
                                  <p className="text-sm leading-loose text-stone-500 whitespace-pre-line">{exp.description}</p>
                               </div>
                            ))}
                         </div>
                      </Section>
                   </div>
                   <div className="space-y-16">
                      <Section title="Competencies">
                         <div className="space-y-3 font-sans text-[10px] uppercase tracking-[0.2em] text-stone-500">
                            {skills.map(s => <div key={s} className="border-b border-stone-200 pb-2">{s}</div>)}
                         </div>
                      </Section>
                      <Section title="Formative">
                         {education.map(edu => (
                            <div key={edu.degree} className="mb-6">
                               <div className="text-xs font-semibold uppercase font-sans tracking-widest mb-1">{edu.degree}</div>
                               <div className="text-sm italic text-stone-400">{edu.school}</div>
                            </div>
                         ))}
                      </Section>
                   </div>
                </div>
             </div>
          </div>
        );
      case "minimal":
        return (
          <div className="max-w-[600px] mx-auto py-16 space-y-16">
             <header className="text-center space-y-6">
                {personalInfo.profilePicture && (
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden grayscale border border-gray-100">
                    <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-2">
                   <h1 className="text-4xl font-serif tracking-tight text-gray-900">{personalInfo.fullName}</h1>
                   <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 flex justify-center gap-6">
                      <span>{personalInfo.email}</span>
                      <span>{personalInfo.location}</span>
                   </div>
                </div>
             </header>
             <section className="text-center italic text-gray-600 leading-relaxed text-sm px-8">
                {personalInfo.summary}
             </section>
             <div className="space-y-16">
                <Section title="Background">
                   <div className="space-y-12">
                      {experience.map(exp => (
                        <div key={exp.company} className="space-y-2">
                           <div className="flex justify-between items-baseline">
                              <span className="font-medium text-gray-900">{exp.role} / {exp.company}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-widest">{exp.duration}</span>
                           </div>
                           <p className="text-xs text-gray-500 leading-loose">{exp.description}</p>
                        </div>
                      ))}
                   </div>
                </Section>
                <div className="grid grid-cols-2 gap-16">
                   <Section title="Education">
                      {education.map(edu => (
                        <div key={edu.degree} className="mb-4">
                           <div className="text-xs font-medium text-gray-900">{edu.degree}</div>
                           <div className="text-[10px] text-gray-400 uppercase tracking-widest">{edu.school}</div>
                        </div>
                      ))}
                   </Section>
                   <Section title="Skills">
                      <p className="text-[10px] uppercase tracking-widest leading-loose text-gray-500">
                         {skills.join(' • ')}
                      </p>
                   </Section>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <>
            <Header centered />
            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2 space-y-10">
                <Section title="Professional Summary">
                  <p className="text-gray-700 leading-relaxed text-[15px]">
                    {personalInfo.summary}
                  </p>
                </Section>
                <Section title="Experience">
                  <div className="space-y-8">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-lg font-bold text-gray-900">{exp.role}</h4>
                          <span className="text-sm font-mono font-medium text-gray-500">{exp.duration}</span>
                        </div>
                        <div className="text-sm font-semibold" style={{ color: activeTheme.primary }}>{exp.company}</div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
              <div className="space-y-10">
                <Section title="Education">
                  <div className="space-y-6">
                    {education.map((edu, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="font-bold text-gray-900 leading-tight">{edu.degree}</h4>
                        <div className="text-sm text-gray-600">{edu.school}</div>
                        <div className="text-xs font-mono text-gray-400">{edu.year}</div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 print:hidden">
        <button
          onClick={handleDownload}
          className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full shadow-lg transition-all group active:scale-95"
          title="Download PDF (via Print)"
        >
          <Download className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full h-full font-sans p-12 print:p-0"
        id="resume-content"
      >
        {renderLayout()}
      </motion.div>

      <style>{`
        .section-title {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #94a3b8;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 8px;
          margin-bottom: 20px;
          font-weight: 700;
        }
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          #resume-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 190mm !important;
            min-height: 277mm !important;
            height: auto !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

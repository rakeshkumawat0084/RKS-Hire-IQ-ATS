import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { PolishedResume } from '../../services/aiService';

interface TemplateProps {
  resume: PolishedResume;
  colorScheme: string; // e.g. '#2563eb' (blue), '#0f172a' (slate), '#059669' (emerald), '#dc2626' (red)
}

export default function PowerSidebar({ resume, colorScheme }: TemplateProps) {
  // Extract LinkedIn and GitHub from links if available
  const linkedin = resume.contact.links?.find(l => l.toLowerCase().includes('linkedin'));
  const github = resume.contact.links?.find(l => l.toLowerCase().includes('github'));
  const otherLinks = resume.contact.links?.filter(l => !l.toLowerCase().includes('linkedin') && !l.toLowerCase().includes('github'));

  return (
    <div className="flex w-full h-full bg-white text-gray-900 font-sans" style={{ minHeight: '297mm' }}>
      {/* Sidebar - 30% Width */}
      <div 
        className="w-[30%] p-8 flex flex-col text-white print:bg-opacity-100" 
        style={{ backgroundColor: colorScheme }}
      >
        <div className="mb-8">
          {resume.photoUrl && (
            <div className="w-32 h-40 mb-6 mx-auto overflow-hidden rounded-xl border-4 shadow-lg" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <img src={resume.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight break-words mb-2">
            {resume.fullName}
          </h1>
          {/* We could add a profession title here if we had it, fallback to empty or latest role */}
          <p className="text-sm font-medium tracking-widest uppercase opacity-80 border-b border-white/20 pb-4">
            {resume.experience?.[0]?.role || 'Professional'}
          </p>
        </div>

        <div className="space-y-6 flex-1">
          {/* Contact Details */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90">Contact</h2>
            <div className="space-y-3 text-xs opacity-90">
              {resume.contact.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0" />
                  <span className="break-all">{resume.contact.email}</span>
                </div>
              )}
              {resume.contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  <span>{resume.contact.phone}</span>
                </div>
              )}
              {resume.contact.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0" />
                  <span>{resume.contact.location}</span>
                </div>
              )}
              {linkedin && (
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="break-all">{linkedin.replace(/^(LinkedIn:\s*)/i, '')}</span>
                </div>
              )}
              {github && (
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="break-all">{github.replace(/^(GitHub:\s*)/i, '')}</span>
                </div>
              )}
              {otherLinks?.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="break-all">{link.replace(/^(Portfolio:\s*)/i, '')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education - Placed in Sidebar to save space */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90">Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-xs uppercase tracking-wide">{edu.degree}</h3>
                    <p className="text-xs opacity-80">{edu.school}</p>
                    <p className="text-[10px] opacity-60 mt-1">{edu.duration}</p>
                    {edu.details && <p className="text-[10px] opacity-75 mt-1">{edu.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills with generic progress bars (Zety style) */}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90">Skills</h2>
              <div className="space-y-4">
                {resume.skills.map((skillGroup, i) => (
                  <div key={i}>
                    <h3 className="text-xs font-bold uppercase opacity-80 mb-2">{skillGroup.category}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGroup.list.map((skill, j) => (
                        <span key={j} className="text-[10px] bg-white/20 px-2 py-1 rounded shadow-sm border border-white/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 70% Width */}
      <div className="w-[70%] p-8 pr-12 flex flex-col">
        {/* Profile Summary */}
        {resume.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: colorScheme }}>
              Profile
              <div className="flex-1 h-px bg-gray-200 ml-2"></div>
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {resume.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: colorScheme }}>
              Experience
              <div className="flex-1 h-px bg-gray-200 ml-2"></div>
            </h2>
            <div className="space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2" style={{ borderColor: `${colorScheme}40` }}>
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1.5 bg-white border-2" style={{ borderColor: colorScheme }}></div>
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{exp.role}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100" style={{ color: colorScheme }}>{exp.duration}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-2">{exp.company}</p>
                  
                  <ul className="space-y-1.5 mt-2">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
                        <span className="text-gray-400 mt-1.5 w-1 h-1 rounded-full shrink-0 bg-gray-400"></span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: colorScheme }}>
              Key Projects
              <div className="flex-1 h-px bg-gray-200 ml-2"></div>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {resume.projects.map((proj, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{proj.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {proj.tech.map((t, j) => (
                      <span key={j} className="text-[9px] uppercase tracking-wider font-bold bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

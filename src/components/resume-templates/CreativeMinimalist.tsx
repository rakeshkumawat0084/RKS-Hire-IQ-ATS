import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Briefcase, GraduationCap, Code, Layers } from 'lucide-react';
import { PolishedResume } from '../../services/aiService';

interface TemplateProps {
  resume: PolishedResume;
  colorScheme: string;
}

export default function CreativeMinimalist({ resume, colorScheme }: TemplateProps) {
  return (
    <div className="w-full h-full bg-white text-gray-800 font-sans" style={{ minHeight: '297mm', padding: '12mm' }}>
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        {resume.photoUrl && (
          <div className="w-24 h-32 mb-4 overflow-hidden rounded-lg shadow-md border-2" style={{ borderColor: colorScheme }}>
            <img src={resume.photoUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-4xl font-black tracking-[0.2em] uppercase mb-2" style={{ color: colorScheme }}>
          {resume.fullName}
        </h1>
        <p className="text-sm tracking-widest uppercase font-bold text-gray-500 mb-4">
          {resume.experience?.[0]?.role || 'Professional'}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 font-medium">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>• {resume.contact.phone}</span>}
          {resume.contact.location && <span>• {resume.contact.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium mt-2" style={{ color: colorScheme }}>
          {resume.contact.links?.map((link, i) => (
            <span key={i}>{link.split(': ')[1] || link}</span>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column (Skills & Education) */}
        <div className="col-span-4 space-y-8">
          
          {/* Summary (if short) or Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                <Code size={16} style={{ color: colorScheme }} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Expertise</h2>
              </div>
              <div className="space-y-4">
                {resume.skills.map((skillGroup, i) => (
                  <div key={i}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">{skillGroup.category}</h3>
                    <div className="flex flex-wrap gap-1">
                      {skillGroup.list.map((skill, j) => (
                        <span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                <GraduationCap size={16} style={{ color: colorScheme }} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Education</h2>
              </div>
              <div className="space-y-4">
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-xs text-gray-900">{edu.degree}</h3>
                    <p className="text-xs text-gray-600 mb-0.5">{edu.school}</p>
                    <p className="text-[10px] font-bold text-gray-400">{edu.duration}</p>
                    {edu.details && <p className="text-[10px] text-gray-500 mt-1">{edu.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Experience & Summary) */}
        <div className="col-span-8 space-y-8 pl-4 border-l border-gray-100">
          
          {/* Summary */}
          {resume.summary && (
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                <Layers size={16} style={{ color: colorScheme }} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Profile</h2>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                <Briefcase size={16} style={{ color: colorScheme }} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Experience</h2>
              </div>
              <div className="space-y-6">
                {resume.experience.map((exp, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{exp.role}</h3>
                      <span className="text-xs font-bold text-gray-400">{exp.duration}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colorScheme }}>
                      {exp.company}
                    </p>
                    <ul className="space-y-1.5 ml-0">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
                          <span className="mt-1.5 text-gray-300 text-[8px] leading-none">■</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

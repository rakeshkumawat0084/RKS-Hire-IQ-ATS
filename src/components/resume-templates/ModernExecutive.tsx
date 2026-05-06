import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { PolishedResume } from '../../services/aiService';

interface TemplateProps {
  resume: PolishedResume;
  colorScheme: string;
}

export default function ModernExecutive({ resume, colorScheme }: TemplateProps) {
  return (
    <div className="w-full h-full bg-white text-gray-900 font-serif" style={{ minHeight: '297mm', padding: '10mm 15mm' }}>
      
      {/* Header Block */}
      <div className="border-b-4 pb-6 mb-6" style={{ borderColor: colorScheme }}>
        <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-3 font-sans">
          {resume.fullName}
        </h1>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans">
          {resume.contact.email && (
            <span className="flex items-center gap-1.5"><Mail size={14} className="opacity-60" /> {resume.contact.email}</span>
          )}
          {resume.contact.phone && (
            <span className="flex items-center gap-1.5"><Phone size={14} className="opacity-60" /> {resume.contact.phone}</span>
          )}
          {resume.contact.location && (
            <span className="flex items-center gap-1.5"><MapPin size={14} className="opacity-60" /> {resume.contact.location}</span>
          )}
          {resume.contact.links?.map((link, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ExternalLink size={14} className="opacity-60" /> {link.split(': ')[1] || link}
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 font-sans" style={{ color: colorScheme }}>
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-800 text-justify">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Core Competencies (Skills mapped differently) */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 font-sans" style={{ color: colorScheme }}>
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm font-sans">
            {resume.skills.flatMap(s => s.list).map((skill, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 font-sans border-b border-gray-200 pb-1" style={{ color: colorScheme }}>
            Professional Experience
          </h2>
          <div className="space-y-5">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-1">
                  <h3 className="font-bold text-gray-900 text-base font-sans">{exp.role}</h3>
                  <span className="text-sm font-bold font-sans text-gray-600">{exp.duration}</span>
                </div>
                <p className="text-sm italic text-gray-700 mb-2">{exp.company}</p>
                <ul className="list-none space-y-1.5 ml-1">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-sm text-gray-800 leading-relaxed flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: colorScheme }}></span>
                      <span className="text-justify">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 font-sans border-b border-gray-200 pb-1" style={{ color: colorScheme }}>
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-sans">{edu.degree}</h3>
                  <p className="text-sm italic text-gray-700">{edu.school}</p>
                  {edu.details && <p className="text-xs text-gray-600 mt-1">{edu.details}</p>}
                </div>
                <span className="text-sm font-bold font-sans text-gray-600 shrink-0">{edu.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

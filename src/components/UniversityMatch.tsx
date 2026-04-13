import React, { useState, useMemo } from 'react';
import { GraduationCap, ExternalLink, CheckCircle2, Target, Award, Filter, ArrowUpDown, X, ShieldCheck, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UniversityMatchProps {
  average: number;
}

const ONTARIO_PROGRAMS = [
  {
    university: "University of Waterloo",
    program: "Computer Engineering",
    location: "ON",
    range: "95-98",
    prereqs: ["Advanced Functions", "Calculus", "Physics", "Chemistry", "English"],
    link: "https://uwaterloo.ca/future-students/programs/computer-engineering",
    competitiveness: "Very High",
    status: "Below range",
    domain: "uwaterloo.ca",
    schoolColor: "#FFD54F" // Waterloo Gold
  },
  {
    university: "University of Toronto",
    program: "Software Engineering",
    location: "ON",
    range: "93-96",
    prereqs: ["Advanced Functions", "Calculus", "Physics", "Chemistry", "English"],
    link: "https://discover.engineering.utoronto.ca/programs/engineering-programs/software-engineering/",
    competitiveness: "Very High",
    status: "Close",
    domain: "utoronto.ca",
    schoolColor: "#60A5FA" // UofT Blue
  },
  {
    university: "McMaster University",
    program: "Computer Science",
    location: "ON",
    range: "92-95",
    prereqs: ["Advanced Functions", "Calculus", "English", "Physics or Chemistry"],
    link: "https://www.eng.mcmaster.ca/programs/computer-science/",
    competitiveness: "High",
    status: "Target",
    domain: "mcmaster.ca",
    schoolColor: "#F43F5E" // McMaster Maroon
  },
  {
    university: "Queen's University",
    program: "Computing",
    location: "ON",
    range: "90-93",
    prereqs: ["Advanced Functions", "Calculus", "English"],
    link: "https://www.queensu.ca/academics/programs/computing",
    competitiveness: "High",
    status: "Target",
    domain: "queensu.ca",
    schoolColor: "#B91C1C" // Queen's Red
  },
  {
    university: "Western University",
    program: "Software Engineering",
    location: "ON",
    range: "88-90",
    prereqs: ["Advanced Functions", "Calculus", "Chemistry", "Physics"],
    link: "https://www.eng.uwo.ca/undergraduate/programs/software-engineering.html",
    competitiveness: "Moderate",
    status: "Strong match",
    domain: "uwo.ca",
    schoolColor: "#A855F7" // Western Purple
  }
];

export default function UniversityMatch({ average }: UniversityMatchProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">Top Programs</h1>
        <p className="text-on-surface-variant">
          Ontario universities matched to your current Top 6 average of <span className="font-bold text-white">{average.toFixed(1)}%</span>
        </p>
      </div>

      {/* Your Profile Card */}
      <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
        <h2 className="text-lg font-bold mb-6">Your Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Top 6 Average</p>
            <p className="text-3xl font-black">{average.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Province</p>
            <p className="text-3xl font-black">Ontario</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Prerequisites</p>
            <p className="text-3xl font-black">6/6 met</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Programs Found</p>
            <p className="text-3xl font-black">{ONTARIO_PROGRAMS.length} matches</p>
          </div>
        </div>
      </div>

      {/* Ranked List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recommended Matches</h2>
            <p className="text-sm text-on-surface-variant">Ranked 1 to 5 based on your profile</p>
          </div>
        </div>

        <div className="space-y-4">
          {ONTARIO_PROGRAMS.map((prog, idx) => (
            <ProgramCard key={idx} prog={prog} average={average} rank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ prog, average, rank }: { prog: any, average: number, rank: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] hover:border-white/20 transition-all relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: prog.schoolColor }} />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-10" style={{ backgroundColor: prog.schoolColor }} />
      
      <a href={prog.link} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors z-10">
        <ExternalLink className="w-5 h-5" />
      </a>
      
      <div className="flex items-center gap-6 mb-6 relative z-10">
        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
          <img 
            src={`https://logo.clearbit.com/${prog.domain}`} 
            alt={`${prog.university} logo`} 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prog.university)}&background=random&color=fff`;
            }}
          />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-black text-on-surface-variant">#{rank}</span>
            <h3 className="text-2xl font-black text-white">{prog.university}</h3>
          </div>
          <p className="text-base font-bold" style={{ color: prog.schoolColor }}>{prog.program} • {prog.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 relative z-10">
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Admission Range</p>
          <p className="text-base font-bold">{prog.range}%</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Your Average</p>
          <p className="text-base font-bold" style={{ color: prog.schoolColor }}>{average.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Competitiveness</p>
          <p className="text-base font-bold">{prog.competitiveness}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Status</p>
          <p className="text-base font-bold">{prog.status}</p>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs text-on-surface-variant mb-2">Prerequisites</p>
        <div className="flex flex-wrap gap-2">
          {prog.prereqs.map((p: string, i: number) => (
            <span key={i} className="text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-on-surface-variant">
              {p}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

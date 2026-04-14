import React, { useState, useMemo } from 'react';
import { GraduationCap, ExternalLink, CheckCircle2, Target, Award, Filter, ArrowUpDown, X, ShieldCheck, AlertTriangle, Zap, TrendingUp, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdBanner from './AdBanner';

interface UniversityMatchProps {
  average: number;
  isPremium?: boolean;
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
    schoolColor: "#FFD54F", // Waterloo Gold
    supplementary: "AIF (Admission Information Form) Required",
    deadline: "2026-01-15T00:00:00Z"
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
    schoolColor: "#60A5FA", // UofT Blue
    supplementary: "Online Student Profile Required",
    deadline: "2026-01-15T00:00:00Z"
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
    schoolColor: "#F43F5E", // McMaster Maroon
    supplementary: "None",
    deadline: "2026-01-15T00:00:00Z"
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
    schoolColor: "#B91C1C", // Queen's Red
    supplementary: "PSE (Personal Statement of Experience) Optional",
    deadline: "2026-02-15T00:00:00Z"
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
    schoolColor: "#A855F7", // Western Purple
    supplementary: "Engineering CONNECT Profile Optional",
    deadline: "2026-01-15T00:00:00Z"
  }
];

const TIMELINE_EVENTS = [
  { date: "2025-10-01", title: "OUAC Applications Open", desc: "Begin your 101 application online.", type: "general" },
  { date: "2026-01-15", title: "OUAC Deadline", desc: "Final day to submit base applications for Ontario universities.", type: "deadline" },
  { date: "2026-02-15", title: "Supplementary Deadlines", desc: "Most supplementary applications (AIF, PSE) are due.", type: "deadline" },
  { date: "2026-05-29", title: "Latest Offer Date", desc: "Universities must respond to all 101 applicants by this date.", type: "offer" },
  { date: "2026-06-01", title: "Response Deadline", desc: "Earliest date you may be required to respond to an offer.", type: "action" }
];

export default function UniversityMatch({ average, isPremium }: UniversityMatchProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'timeline'>('matches');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tighter text-gradient">University Hub</h1>
            <div className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Feed
            </div>
          </div>
          <p className="text-on-surface-variant">
            Direct data feeds, application tracking, and personalized matches.
          </p>
        </div>
      </div>

      {!isPremium && <AdBanner type="horizontal" />}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('matches')}
          className={`font-bold transition-colors ${activeTab === 'matches' ? 'text-primary border-b-2 border-primary pb-4 -mb-[18px]' : 'text-on-surface-variant hover:text-white'}`}
        >
          Program Matches
        </button>
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`font-bold transition-colors ${activeTab === 'timeline' ? 'text-primary border-b-2 border-primary pb-4 -mb-[18px]' : 'text-on-surface-variant hover:text-white'}`}
        >
          Application Timeline
        </button>
      </div>

      {activeTab === 'matches' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
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
        </motion.div>
      )}

      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Application Timeline</h2>
                <p className="text-sm text-on-surface-variant">Track important deadlines for Ontario universities</p>
              </div>
            </div>

            <div className="relative z-10 pl-4 border-l-2 border-white/10 space-y-8">
              {TIMELINE_EVENTS.map((event, idx) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();
                
                return (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-surface ${isPast ? 'bg-on-surface-variant' : event.type === 'deadline' ? 'bg-red-500' : event.type === 'offer' ? 'bg-primary' : 'bg-blue-500'}`} />
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`text-sm font-bold ${isPast ? 'text-on-surface-variant' : 'text-white'}`}>
                        {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      {event.type === 'deadline' && !isPast && (
                        <span className="bg-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">Deadline</span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold ${isPast ? 'text-on-surface-variant' : 'text-white'}`}>{event.title}</h3>
                    <p className={`text-sm ${isPast ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}`}>{event.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
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
        <a href={prog.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <img 
            src={`https://logo.clearbit.com/${prog.domain}`} 
            alt={`${prog.university} logo`} 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prog.university)}&background=random&color=fff`;
            }}
          />
        </a>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-black text-on-surface-variant">#{rank}</span>
            <a href={prog.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-4">
              <h3 className="text-2xl font-black text-white">{prog.university}</h3>
            </a>
          </div>
          <a href={prog.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <p className="text-base font-bold" style={{ color: prog.schoolColor }}>{prog.program} • {prog.location}</p>
          </a>
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

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        <div>
          <p className="text-xs text-on-surface-variant mb-2">Prerequisites</p>
          <div className="flex flex-wrap gap-2">
            {prog.prereqs.map((p: string, i: number) => (
              <span key={i} className="text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-on-surface-variant">
                {p}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-surface-container border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-on-surface-variant mb-1 font-bold">Application Details</p>
          <div className="flex items-start gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-white">Due: {new Date(prog.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-2">{prog.supplementary}</p>
        </div>
      </div>
    </motion.div>
  );
}

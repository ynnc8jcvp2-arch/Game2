import React, { useState, useMemo } from 'react';
import { GraduationCap, ExternalLink, CheckCircle2, Target, Award, Filter, ArrowUpDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UniversityMatchProps {
  average: number;
}

const ONTARIO_PROGRAMS = [
  {
    university: "University of Waterloo",
    program: "Software Engineering",
    range: "95%+",
    prereqs: ["Calculus", "Advanced Functions", "Physics", "Chemistry", "English"],
    link: "https://uwaterloo.ca/future-students/programs/software-engineering",
    category: "Reach"
  },
  {
    university: "University of Toronto",
    program: "Computer Science (St. George)",
    range: "93%+",
    prereqs: ["Calculus", "English"],
    link: "https://www.artsci.utoronto.ca/future/academic-opportunities/computer-science",
    category: "Reach"
  },
  {
    university: "McMaster University",
    program: "Health Sciences",
    range: "95%+",
    prereqs: ["Biology", "Chemistry", "English", "Math"],
    link: "https://bhsc.mcmaster.ca/",
    category: "Reach"
  },
  {
    university: "Western University",
    program: "Ivey Business (AEO)",
    range: "93%+",
    prereqs: ["Math", "English"],
    link: "https://www.ivey.uwo.ca/hba/",
    category: "Competitive"
  },
  {
    university: "Queen's University",
    program: "Commerce",
    range: "90%+",
    prereqs: ["Calculus", "English"],
    link: "https://smith.queensu.ca/bcom/",
    category: "Competitive"
  },
  {
    university: "Toronto Metropolitan University",
    program: "Business Management",
    range: "80%+",
    prereqs: ["English", "Math"],
    link: "https://www.torontomu.ca/programs/undergraduate/business-management/",
    category: "Safer"
  },
  {
    university: "York University",
    program: "Schulich Business",
    range: "90%+",
    prereqs: ["Advanced Functions", "Calculus", "English"],
    link: "https://schulich.yorku.ca/programs/bba/",
    category: "Competitive"
  },
  {
    university: "University of Guelph",
    program: "Biological Science",
    range: "82%+",
    prereqs: ["Biology", "Chemistry", "Calculus", "English"],
    link: "https://www.uoguelph.ca/programs/biological-science/",
    category: "Safer"
  },
  {
    university: "Carleton University",
    program: "Public Affairs & Policy Management",
    range: "85%+",
    prereqs: ["English"],
    link: "https://carleton.ca/bpapm/",
    category: "Competitive"
  },
  {
    university: "University of Ottawa",
    program: "Political Science",
    range: "80%+",
    prereqs: ["English"],
    link: "https://www.uottawa.ca/faculty-social-sciences/political-studies",
    category: "Safer"
  },
  {
    university: "Wilfrid Laurier",
    program: "BBA",
    range: "90%+",
    prereqs: ["English", "Math"],
    link: "https://www.wlu.ca/programs/business-and-economics/undergraduate/business-administration-bba/index.html",
    category: "Competitive"
  }
];

export default function UniversityMatch({ average }: UniversityMatchProps) {
  const [province, setProvince] = useState('Ontario');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'university' | 'range'>('university');
  const [showFilters, setShowFilters] = useState(false);

  const allPrereqs = useMemo(() => {
    const prereqs = new Set<string>();
    ONTARIO_PROGRAMS.forEach(p => p.prereqs.forEach(pr => prereqs.add(pr)));
    return Array.from(prereqs).sort();
  }, []);

  const filteredAndSortedPrograms = useMemo(() => {
    let result = [...ONTARIO_PROGRAMS];

    // Filter by Category
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Filter by Prereqs (Must have all selected)
    if (selectedPrereqs.length > 0) {
      result = result.filter(p => 
        selectedPrereqs.every(sp => p.prereqs.includes(sp))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'university') {
        return a.university.localeCompare(b.university);
      } else {
        const rangeA = parseInt(a.range.replace('%+', ''));
        const rangeB = parseInt(b.range.replace('%+', ''));
        return rangeB - rangeA; // Higher range first
      }
    });

    return result;
  }, [categoryFilter, selectedPrereqs, sortBy]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Reach': return 'text-red-500 bg-red-50';
      case 'Competitive': return 'text-amber-500 bg-amber-50';
      case 'Safer': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-primary bg-primary/10';
    }
  };

  const isEligible = (range: string) => {
    const min = parseInt(range.replace('%+', ''));
    return average >= min;
  };

  const togglePrereq = (prereq: string) => {
    setSelectedPrereqs(prev => 
      prev.includes(prereq) ? prev.filter(p => p !== prereq) : [...prev, prereq]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">University Matcher</h1>
          <p className="text-on-surface-variant">Ontario-first admission matching based on your Top 6 projection.</p>
          <div className="mt-4 flex items-center gap-4">
            <select 
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/10 rounded-md px-3 py-1 text-xs font-bold focus:outline-none"
            >
              <option value="Ontario">Ontario</option>
              <option value="BC" disabled>British Columbia (Coming Soon)</option>
              <option value="Quebec" disabled>Quebec (Coming Soon)</option>
            </select>
            <a 
              href="https://www.ontariouniversitiesinfo.ca/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Search OUInfo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${
              showFilters ? 'bg-primary text-white border-primary' : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </motion.button>
          <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Your Average</p>
              <p className="text-3xl font-black text-primary">{average.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Category Filter */}
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {['Reach', 'Competitive', 'Safer'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          categoryFilter === cat 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Sort By</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('university')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        sortBy === 'university' 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      University
                    </button>
                    <button
                      onClick={() => setSortBy('range')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        sortBy === 'range' 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      Range
                    </button>
                  </div>
                </div>

                {/* Prerequisites Filter */}
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Required Prerequisites</p>
                  <div className="flex flex-wrap gap-1">
                    {allPrereqs.map(pr => (
                      <button
                        key={pr}
                        onClick={() => togglePrereq(pr)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          selectedPrereqs.includes(pr)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(categoryFilter || selectedPrereqs.length > 0) && (
                <div className="pt-4 border-t border-outline-variant/10 flex justify-end">
                  <button 
                    onClick={() => {
                      setCategoryFilter(null);
                      setSelectedPrereqs([]);
                    }}
                    className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPrograms.map((prog, idx) => {
          const eligible = isEligible(prog.range);
          return (
            <motion.div 
              key={`${prog.university}-${prog.program}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10, rotateX: -5, rotateY: 5, scale: 1.02, z: 20 }}
              whileTap={{ scale: 0.98, rotateX: 5, rotateY: -5 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-panel p-6 rounded-xl border-t-4 flex flex-col cursor-pointer ${
                eligible ? 'border-t-emerald-500' : 'border-t-on-surface/10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${getCategoryColor(prog.category)}`}>
                  {prog.category}
                </span>
                {eligible && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              
              <h3 className="font-bold text-lg mb-1">{prog.university}</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-4">{prog.program}</p>
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Admission Range</span>
                  <span className="font-bold">{prog.range}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Prerequisites</p>
                  <div className="flex flex-wrap gap-1">
                    {prog.prereqs.map((p, i) => (
                      <span key={i} className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                <a 
                  href={prog.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  Program Info <ExternalLink className="w-3 h-3" />
                </a>
                <motion.button 
                  whileHover={{ scale: 1.1, color: '#392cc1' }}
                  whileTap={{ scale: 0.9 }}
                  className="text-[10px] font-bold text-on-surface-variant uppercase transition-colors"
                >
                  Add to Goals
                </motion.button>
              </div>
            </motion.div>
          );
        })}
        {filteredAndSortedPrograms.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-on-surface-variant/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">No matches found</h3>
            <p className="text-on-surface-variant">Try adjusting your filters to see more programs.</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-8 rounded-2xl bg-primary/5 border-primary/20">
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Scholarship Eligibility</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Based on your current average of <strong>{average.toFixed(1)}%</strong>, you may be eligible for entrance scholarships at several Ontario universities. 
              Waterloo and UofT typically offer automatic entrance scholarships starting at 90% and 92% respectively.
            </p>
            <button className="mt-4 text-sm font-bold text-primary hover:underline">View Scholarship Guide →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

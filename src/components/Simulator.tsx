import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Assessment } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SimulatorProps {
  courses: Course[];
  assessments: Assessment[];
}

export default function Simulator({ courses, assessments }: SimulatorProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [simData, setSimData] = useState<Record<string, { k: number, c: number, a: number, t: number }>>({});

  React.useEffect(() => {
    if (courses.length > 0) {
      setSimData(prev => {
        const newData = { ...prev };
        let hasChanges = false;
        courses.forEach(c => {
          if (!newData[c.id]) {
            const courseAssessments = assessments.filter(a => a.courseId === c.id);
            let currentAvg = 80;
            if (courseAssessments.length > 0) {
              let totalWeightedScore = 0;
              let totalWeight = 0;
              courseAssessments.forEach(a => {
                totalWeightedScore += (a.score / a.total) * a.weight;
                totalWeight += a.weight;
              });
              if (totalWeight > 0) {
                currentAvg = (totalWeightedScore / totalWeight) * 100;
              }
            }
            newData[c.id] = {
              k: Math.round(currentAvg),
              c: Math.round(currentAvg),
              a: Math.round(currentAvg),
              t: Math.round(currentAvg)
            };
            hasChanges = true;
          }
        });
        
        Object.keys(newData).forEach(key => {
          if (!courses.find(c => c.id === key)) {
            delete newData[key];
            hasChanges = true;
          }
        });

        return hasChanges ? newData : prev;
      });
      
      if (!expandedCourse || !courses.find(c => c.id === expandedCourse)) {
        setExpandedCourse(courses[0].id);
      }
    } else {
      setSimData({});
      setExpandedCourse(null);
    }
  }, [courses, assessments]);

  const updateSimData = (courseId: string, category: 'k' | 'c' | 'a' | 't', value: number) => {
    setSimData(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [category]: value
      }
    }));
  };

  const calculateCourseAverage = (courseId: string) => {
    const data = simData[courseId];
    if (!data) return 0;
    return (data.k + data.c + data.a + data.t) / 4;
  };

  const currentOverallAverage = courses.length > 0 ? courses.reduce((acc, c) => {
    const courseAssessments = assessments.filter(a => a.courseId === c.id);
    if (courseAssessments.length === 0) return acc;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    courseAssessments.forEach(a => {
      totalWeightedScore += (a.score / a.total) * a.weight;
      totalWeight += a.weight;
    });
    return acc + (totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0);
  }, 0) / courses.length : 80;

  const overallAverage = Object.keys(simData).length > 0 ? Object.keys(simData).reduce((acc, courseId) => acc + calculateCourseAverage(courseId), 0) / Object.keys(simData).length : 0;
  const diff = overallAverage - currentOverallAverage;
  const diffColor = diff >= 0 ? 'text-[#00FF66]' : 'text-red-500';
  const diffText = diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">Simulator</h1>
        <p className="text-on-surface-variant">
          Drag sliders to see how future grades in specific areas affect your average
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side - Overall Impact */}
        <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Simulated Overall</p>
          <p className="text-7xl font-black text-primary tracking-tighter mb-2">{overallAverage.toFixed(1)}%</p>
          <p className={`text-sm font-bold mb-12 ${diffColor}`}>{diffText} vs current</p>

          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-on-surface-variant mb-2">
              <span>Current: {currentOverallAverage.toFixed(1)}%</span>
              <span>Target: 90%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden relative mb-2">
              <div className="absolute top-0 bottom-0 left-0 bg-primary" style={{ width: `${overallAverage}%` }} />
              <div className="absolute top-0 bottom-0 bg-white/20 w-0.5" style={{ left: '90%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-primary">{overallAverage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Right Side - Sliders */}
        <div className="lg:col-span-2 space-y-4">
          {courses.map((course) => {
            const data = simData[course.id];
            if (!data) return null;
            return (
              <div key={course.id} className="bg-surface-container-low border border-white/5 rounded-[32px] overflow-hidden">
                <button 
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-bold text-xl">{course.name}</span>
                    <span className="text-sm font-bold text-primary">{calculateCourseAverage(course.id).toFixed(1)}%</span>
                  </div>
                  {expandedCourse === course.id ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                </button>
                
                <AnimatePresence>
                  {expandedCourse === course.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 space-y-6 border-t border-white/5 mt-2">
                        <SimSlider label="Knowledge" value={data.k} setValue={(v) => updateSimData(course.id, 'k', v)} color="bg-blue-500" />
                        <SimSlider label="Communication" value={data.c} setValue={(v) => updateSimData(course.id, 'c', v)} color="bg-purple-500" />
                        <SimSlider label="Application" value={data.a} setValue={(v) => updateSimData(course.id, 'a', v)} color="bg-emerald-500" />
                        <SimSlider label="Thinking" value={data.t} setValue={(v) => updateSimData(course.id, 't', v)} color="bg-orange-500" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimSlider({ label, value, setValue, color }: { label: string, value: number, setValue: (v: number) => void, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-sm text-on-surface-variant">{label}</span>
        <span className="font-black text-lg">{value}%</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => setValue(Number(e.target.value))}
        className={`w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-pointer`}
      />
      <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

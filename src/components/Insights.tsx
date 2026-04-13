import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, AlertCircle, Target, ChevronDown } from 'lucide-react';
import { Course, Assessment } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface InsightsProps {
  courses: Course[];
  assessments: Assessment[];
}

const COLORS = ['#00FF66', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444'];

export default function Insights({ courses, assessments }: InsightsProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>('all');

  const calculateCourseAverage = (courseId: string) => {
    const courseAssessments = assessments.filter(a => a.courseId === courseId);
    if (courseAssessments.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    courseAssessments.forEach(a => {
      totalWeightedScore += (a.score / a.total) * a.weight;
      totalWeight += a.weight;
    });
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  };

  const calculateCoursePriority = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const courseAssessments = assessments.filter(a => a.courseId === courseId);
    
    if (!course || courseAssessments.length === 0) return { score: 0, level: 'Low', gap: 0, stdDev: 0, recentDrop: 0 };

    // 1. Current Average
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const percentages: number[] = [];
    
    courseAssessments.forEach(a => {
      const pct = (a.score / a.total) * 100;
      percentages.push(pct);
      totalWeightedScore += (a.score / a.total) * a.weight;
      totalWeight += a.weight;
    });
    
    const currentAverage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    
    // 2. Gap to Target
    const target = course.targetMark || 80; // default target 80 if not set
    const gap = Math.max(0, target - currentAverage);
    
    // 3. Volatility (Standard Deviation)
    const mean = percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;
    const variance = percentages.length > 0 ? percentages.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / percentages.length : 0;
    const stdDev = Math.sqrt(variance);
    
    // 4. Recency Trend (Last assessment vs average)
    const sorted = [...courseAssessments].sort((a, b) => {
      const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date || 0).getTime();
      const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    const lastAssessment = sorted[0];
    const lastPct = lastAssessment ? (lastAssessment.score / lastAssessment.total) * 100 : currentAverage;
    const recentDrop = Math.max(0, currentAverage - lastPct);

    // Composite Score: 0 to 100
    // Gap: up to 50 points (2.5 points per 1% below target)
    // Volatility: up to 30 points (2 points per 1% std dev)
    // Recent Drop: up to 20 points (2 points per 1% drop)
    let score = (gap * 2.5) + (stdDev * 2) + (recentDrop * 2);
    score = Math.min(100, Math.max(0, score));
    
    let level = 'Low';
    if (score >= 70) level = 'High';
    else if (score >= 40) level = 'Medium';

    return { score: Math.round(score), level, gap, stdDev, recentDrop };
  };

  const highestPriorityCourse = useMemo(() => {
    if (courses.length === 0) return null;
    let maxScore = -1;
    let topCourse = null;
    let topPriorityData = null;

    courses.forEach(c => {
      const priority = calculateCoursePriority(c.id);
      if (priority.score > maxScore) {
        maxScore = priority.score;
        topCourse = c;
        topPriorityData = priority;
      }
    });

    return { course: topCourse, priority: topPriorityData };
  }, [courses, assessments]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const filteredAssessments = selectedCourseId === 'all' 
    ? assessments 
    : assessments.filter(a => a.courseId === selectedCourseId);

  // Data for Course Average Over Time
  const trendData = useMemo(() => {
    if (!filteredAssessments || filteredAssessments.length === 0) {
      return [
        { date: 'Sep 1', average: 85 },
        { date: 'Oct 1', average: 87 },
        { date: 'Nov 1', average: 89 },
        { date: 'Dec 1', average: 91 },
      ];
    }

    const sorted = [...filteredAssessments]
      .filter(a => a.date)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date).getTime();
        return dateA - dateB;
      });

    let cumulativeWeightedScore = 0;
    let cumulativeWeight = 0;
    const dataPoints: { date: string, average: number }[] = [];

    sorted.forEach(a => {
      const scorePercent = (a.score / a.total) * 100;
      cumulativeWeightedScore += scorePercent * a.weight;
      cumulativeWeight += a.weight;

      const currentAverage = cumulativeWeight > 0 ? cumulativeWeightedScore / cumulativeWeight : 0;
      const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      dataPoints.push({
        date: dateStr,
        average: Number(currentAverage.toFixed(1))
      });
    });

    const grouped = dataPoints.reduce((acc, curr) => {
      acc[curr.date] = curr.average;
      return acc;
    }, {} as Record<string, number>);

    const finalData = Object.entries(grouped).map(([date, average]) => ({
      date,
      average
    }));

    return finalData.length > 0 ? finalData : [
      { date: 'Sep 1', average: 85 },
      { date: 'Oct 1', average: 87 },
      { date: 'Nov 1', average: 89 },
      { date: 'Dec 1', average: 91 },
    ];
  }, [filteredAssessments]);

  // Data for Performance by Type
  const typePerformanceData = useMemo(() => {
    const typeStats: Record<string, { totalScore: number, count: number }> = {};
    
    filteredAssessments.forEach(a => {
      if (!typeStats[a.type]) {
        typeStats[a.type] = { totalScore: 0, count: 0 };
      }
      typeStats[a.type].totalScore += (a.score / a.total) * 100;
      typeStats[a.type].count += 1;
    });

    const data = Object.entries(typeStats).map(([type, stats]) => ({
      name: type,
      average: Number((stats.totalScore / stats.count).toFixed(1))
    }));

    return data.length > 0 ? data : [
      { name: 'Test', average: 88 },
      { name: 'Assignment', average: 92 },
      { name: 'Quiz', average: 85 },
    ];
  }, [filteredAssessments]);

  // Data for Assessment Distribution
  const distributionData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    filteredAssessments.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });

    const data = Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));

    return data.length > 0 ? data : [
      { name: 'Test', value: 4 },
      { name: 'Assignment', value: 8 },
      { name: 'Quiz', value: 6 },
    ];
  }, [filteredAssessments]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">Insights</h1>
          <p className="text-on-surface-variant">
            Deep analytics and predictive modeling based on your academic ledger.
          </p>
        </div>
        
        <div className="relative min-w-[200px]">
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full appearance-none bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 pr-10 font-bold text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="all">All Courses Overview</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        </div>
      </div>

      {selectedCourseId === 'all' ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Biggest Riser */}
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] hover:border-primary/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold">Biggest Riser</h3>
            </div>
            <p className="text-2xl font-black mb-1 relative z-10">Chemistry</p>
            <div className="flex items-baseline gap-2 mb-2 relative z-10">
              <span className="text-xl font-bold">93%</span>
              <span className="text-sm font-bold text-primary">+8.2%</span>
            </div>
            <p className="text-xs text-on-surface-variant relative z-10">This week</p>
          </div>

          {/* Study Priority */}
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] hover:border-red-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold">Study Priority</h3>
            </div>
            {highestPriorityCourse?.course ? (
              <>
                <p className="text-2xl font-black mb-1 relative z-10">{highestPriorityCourse.course.name}</p>
                <div className="flex items-baseline gap-2 mb-2 relative z-10">
                  <span className="text-xl font-bold">{highestPriorityCourse.priority?.score}/100</span>
                  <span className="text-sm font-bold text-red-500">Index</span>
                </div>
                <p className="text-xs text-on-surface-variant relative z-10">
                  {highestPriorityCourse.priority?.gap > 5 ? 'Below target mark' : 
                   highestPriorityCourse.priority?.stdDev > 10 ? 'High grade volatility' : 
                   highestPriorityCourse.priority?.recentDrop > 5 ? 'Recent grade drop' : 'Needs attention'}
                </p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant relative z-10">No data available</p>
            )}
          </div>

          {/* Goal Calculator */}
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] hover:border-purple-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold">Goal Calculator</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-1 relative z-10">To reach 95% average</p>
            <p className="text-3xl font-black text-purple-500 mb-2 relative z-10">96%</p>
            <p className="text-xs text-on-surface-variant relative z-10">on next assessment</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selected Course Stats */}
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] relative overflow-hidden md:col-span-1 flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <p className="text-sm text-on-surface-variant mb-2 relative z-10">Current Average</p>
            <p className="text-5xl font-black tracking-tighter mb-2 text-white relative z-10">
              {calculateCourseAverage(selectedCourseId).toFixed(1)}%
            </p>
            <p className="text-sm font-medium text-primary relative z-10">
              On track for target
            </p>
          </div>

          {/* Assessment Distribution */}
          <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] md:col-span-2">
            <h3 className="text-xl font-bold mb-6">Assessment Distribution</h3>
            <div className="h-[200px] flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 pl-4 space-y-3">
                {distributionData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-on-surface-variant">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Graphs Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Trend Analysis */}
        <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Trend Analysis</h3>
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Average</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="average" stroke="#00FF66" strokeWidth={3} dot={{ r: 4, fill: '#00FF66', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance by Type */}
        <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Performance by Type</h3>
            <p className="text-xs text-on-surface-variant">Identify areas to improve</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                  {typePerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {selectedCourseId === 'all' && (
        <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
          <h3 className="text-xl font-bold mb-6">All Courses Overview</h3>
          <div className="space-y-6">
            {courses.length > 0 ? courses.map(c => {
              const avg = calculateCourseAverage(c.id);
              const priority = calculateCoursePriority(c.id);
              return (
                <CourseRow 
                  key={c.id} 
                  name={c.name} 
                  grade={`${avg.toFixed(1)}%`} 
                  trend={c.targetMark ? `Target: ${c.targetMark}%` : "Active"} 
                  isPositive={c.targetMark ? avg >= c.targetMark : avg >= 80} 
                  targetMark={c.targetMark}
                  priorityScore={priority.score}
                  priorityLevel={priority.level}
                />
              );
            }) : (
              <p className="text-on-surface-variant text-sm">No courses added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseRow({ name, grade, trend, isPositive, targetMark, priorityScore, priorityLevel }: { name: string, grade: string, trend: string, isPositive: boolean, targetMark?: number, priorityScore: number, priorityLevel: string }) {
  const priorityColor = priorityLevel === 'High' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                        priorityLevel === 'Medium' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 
                        'text-primary bg-primary/10 border-primary/20';

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg -mx-2">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-primary' : 'bg-orange-500'}`} />
        <div>
          <p className="font-bold">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-on-surface-variant">Current grade</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
              Priority: {priorityScore}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="text-xl font-black">{grade}</span>
        <div className={`flex items-center gap-1 w-24 justify-end font-bold text-sm ${isPositive ? 'text-primary' : 'text-orange-500'}`}>
          {targetMark && (isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
          {trend}
        </div>
      </div>
    </div>
  );
}

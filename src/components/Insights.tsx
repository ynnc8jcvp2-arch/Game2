import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, AlertCircle, Target, ChevronDown, CheckCircle } from 'lucide-react';
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
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Scatter,
  Legend
} from 'recharts';
import AIGradeAnalysis from './AIGradeAnalysis';
import AdBanner from './AdBanner';

interface InsightsProps {
  courses: Course[];
  assessments: Assessment[];
  isPremium?: boolean;
}

const COLORS = ['#00FF66', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444'];

export default function Insights({ courses, assessments, isPremium }: InsightsProps) {
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

  // Data for Weekly Trend
  const weeklyTrendData = useMemo(() => {
    if (!filteredAssessments || filteredAssessments.length === 0) {
      return [
        { date: 'Sep 1 - Sep 7', average: 85 },
        { date: 'Sep 8 - Sep 14', average: 87 },
        { date: 'Sep 15 - Sep 21', average: 89 },
        { date: 'Sep 22 - Sep 28', average: 91 },
      ];
    }

    const sorted = [...filteredAssessments]
      .filter(a => a.date)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date).getTime();
        return dateA - dateB;
      });

    const getWeekRange = (date: Date) => {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay()); // Sunday
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Saturday
      
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} - ${endStr}`;
    };

    let cumulativeWeightedScore = 0;
    let cumulativeWeight = 0;
    const weeklyData: Record<string, number> = {};

    sorted.forEach(a => {
      const scorePercent = (a.score / a.total) * 100;
      cumulativeWeightedScore += scorePercent * a.weight;
      cumulativeWeight += a.weight;

      const currentAverage = cumulativeWeight > 0 ? cumulativeWeightedScore / cumulativeWeight : 0;
      const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const weekRange = getWeekRange(dateObj);

      weeklyData[weekRange] = Number(currentAverage.toFixed(1));
    });

    const finalData = Object.entries(weeklyData).map(([date, average]) => ({
      date,
      average,
      classAverage: Math.max(60, average - (Math.random() * 10 + 2)) // Mock class average
    }));

    return finalData.length > 0 ? finalData : [
      { date: 'Sep 1 - Sep 7', average: 85, classAverage: 78 },
      { date: 'Sep 8 - Sep 14', average: 87, classAverage: 79 },
      { date: 'Sep 15 - Sep 21', average: 89, classAverage: 81 },
      { date: 'Sep 22 - Sep 28', average: 91, classAverage: 82 },
    ];
  }, [filteredAssessments]);

  // Data for Performance by Type
  const typePerformanceData = useMemo(() => {
    const typeStats: Record<string, { totalScore: number, count: number, totalWeight: number, weightedScore: number }> = {};
    
    filteredAssessments.forEach(a => {
      if (!typeStats[a.type]) {
        typeStats[a.type] = { totalScore: 0, count: 0, totalWeight: 0, weightedScore: 0 };
      }
      const pct = (a.score / a.total) * 100;
      typeStats[a.type].totalScore += pct;
      typeStats[a.type].count += 1;
      typeStats[a.type].totalWeight += a.weight;
      typeStats[a.type].weightedScore += (a.score / a.total) * a.weight;
    });

    const data = Object.entries(typeStats).map(([type, stats]) => {
      const average = stats.count > 0 ? stats.totalScore / stats.count : 0;
      const lostMarks = stats.totalWeight - stats.weightedScore;
      return {
        name: type,
        average: Number(average.toFixed(1)),
        totalWeight: stats.totalWeight,
        lostMarks: Number(lostMarks.toFixed(2)),
        impact: Number(((5 / 100) * stats.totalWeight).toFixed(2)) // Impact of 5% improvement
      };
    });

    return data.length > 0 ? data : [
      { name: 'Test', average: 88, totalWeight: 40, lostMarks: 4.8, impact: 2.0 },
      { name: 'Assignment', average: 92, totalWeight: 30, lostMarks: 2.4, impact: 1.5 },
      { name: 'Quiz', average: 85, totalWeight: 20, lostMarks: 3.0, impact: 1.0 },
    ];
  }, [filteredAssessments]);

  const strategicOpportunities = useMemo(() => {
    if (!typePerformanceData || typePerformanceData.length === 0) return null;
    
    // Sort by lost marks to find the biggest opportunity
    const sortedByLost = [...typePerformanceData].sort((a, b) => b.lostMarks - a.lostMarks);
    const topOpportunity = sortedByLost[0];
    
    // Sort by impact to find highest leverage
    const sortedByImpact = [...typePerformanceData].sort((a, b) => b.impact - a.impact);
    const highestLeverage = sortedByImpact[0];

    return {
      topOpportunity,
      highestLeverage
    };
  }, [typePerformanceData]);

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

  // Data for KCAT Progress Over Time
  const kcatTrendData = useMemo(() => {
    if (selectedCourseId === 'all') return [];

    const sorted = [...filteredAssessments]
      .filter(a => a.date)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date).getTime();
        return dateA - dateB;
      });

    const dataPoints: any[] = [];
    
    let cumulativeK = 0, cumulativeC = 0, cumulativeA = 0, cumulativeT = 0;
    let countK = 0, countC = 0, countA = 0, countT = 0;

    sorted.forEach(a => {
      const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let k = null, c = null, a_val = null, t = null;

      if (a.kcat) {
        k = a.kcat.k;
        c = a.kcat.c;
        a_val = a.kcat.a;
        t = a.kcat.t;
      } else {
        const pct = (a.score / a.total) * 100;
        k = pct; c = pct; a_val = pct; t = pct;
      }

      cumulativeK += k; countK++;
      cumulativeC += c; countC++;
      cumulativeA += a_val; countA++;
      cumulativeT += t; countT++;

      dataPoints.push({
        date: dateStr,
        Knowledge: Number((cumulativeK / countK).toFixed(1)),
        Communication: Number((cumulativeC / countC).toFixed(1)),
        Application: Number((cumulativeA / countA).toFixed(1)),
        Thinking: Number((cumulativeT / countT).toFixed(1)),
      });
    });

    if (dataPoints.length === 0) {
      return [
        { date: 'Sep 1', Knowledge: 80, Communication: 85, Application: 78, Thinking: 82 },
        { date: 'Oct 1', Knowledge: 82, Communication: 86, Application: 80, Thinking: 85 },
        { date: 'Nov 1', Knowledge: 85, Communication: 88, Application: 84, Thinking: 86 },
        { date: 'Dec 1', Knowledge: 88, Communication: 90, Application: 86, Thinking: 89 },
      ];
    }

    return dataPoints;
  }, [filteredAssessments, selectedCourseId]);

  const kcatInsights = useMemo(() => {
    if (kcatTrendData.length === 0) return null;
    
    const latest = kcatTrendData[kcatTrendData.length - 1];
    const categories = [
      { name: 'Knowledge', score: latest.Knowledge, color: 'text-blue-500', bg: 'bg-blue-500' },
      { name: 'Communication', score: latest.Communication, color: 'text-purple-500', bg: 'bg-purple-500' },
      { name: 'Application', score: latest.Application, color: 'text-emerald-500', bg: 'bg-emerald-500' },
      { name: 'Thinking', score: latest.Thinking, color: 'text-orange-500', bg: 'bg-orange-500' }
    ];
    
    categories.sort((a, b) => b.score - a.score);
    
    return {
      strongest: categories[0],
      weakest: categories[categories.length - 1]
    };
  }, [kcatTrendData]);

  // Data for Historical Grades (Scatter + Trend)
  const historicalGradesData = useMemo(() => {
    if (selectedCourseId === 'all') return [];

    const sorted = [...filteredAssessments]
      .filter(a => a.date)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date).getTime();
        return dateA - dateB;
      });

    let cumulativeWeightedScore = 0;
    let cumulativeWeight = 0;

    const dataPoints = sorted.map(a => {
      const pct = (a.score / a.total) * 100;
      cumulativeWeightedScore += pct * a.weight;
      cumulativeWeight += a.weight;
      const currentAverage = cumulativeWeight > 0 ? cumulativeWeightedScore / cumulativeWeight : pct;
      
      const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: dateStr,
        score: Number(pct.toFixed(1)),
        average: Number(currentAverage.toFixed(1)),
        name: a.title || a.type
      };
    });

    if (dataPoints.length === 0) {
      return [
        { date: 'Sep 1', score: 82, average: 82, name: 'Quiz 1' },
        { date: 'Sep 15', score: 88, average: 85, name: 'Assignment 1' },
        { date: 'Oct 1', score: 90, average: 86.7, name: 'Test 1' },
        { date: 'Oct 20', score: 85, average: 86.3, name: 'Quiz 2' },
        { date: 'Nov 5', score: 92, average: 87.4, name: 'Assignment 2' },
      ];
    }

    return dataPoints;
  }, [filteredAssessments, selectedCourseId]);

  // Data for Recent Grades
  const recentGrades = useMemo(() => {
    const sorted = [...filteredAssessments]
      .filter(a => a.date)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date?.toMillis ? b.date.toMillis() : new Date(b.date).getTime();
        return dateB - dateA;
      });
    return sorted.slice(0, 5);
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

      <AIGradeAnalysis courses={selectedCourseId === 'all' ? courses : courses.filter(c => c.id === selectedCourseId)} assessments={filteredAssessments} />

      {!isPremium && <AdBanner type="horizontal" />}

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
              <span className="text-sm font-bold text-[#00FF66]">+8.2%</span>
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
            <p className="text-sm font-medium text-[#00FF66] relative z-10">
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
        {selectedCourseId === 'all' ? (
          <>
            {/* Weekly Trend */}
            <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Weekly Trend</h3>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#8B5CF6]" /><span>Your Average</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#D4FF00]" /><span>Class Average</span></div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClassAverage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4FF00" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D4FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="average" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorAverage)" />
                    <Area type="monotone" dataKey="classAverage" stroke="#D4FF00" strokeWidth={3} fillOpacity={1} fill="url(#colorClassAverage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Semester Progress */}
            <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Semester Progress</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSemester" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value}%`, 'Average']}
                    />
                    <ReferenceLine y={90} stroke="#8e9299" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Goal: 90%', fill: '#8e9299', fontSize: 12 }} />
                    <Area type="monotone" dataKey="average" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSemester)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* KCAT Progress */}
            <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">KCAT Progress Breakdown</h3>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Graph */}
                <div className="lg:col-span-2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kcatTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: '#8e9299', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#8e9299' }} />
                      <Line type="monotone" dataKey="Knowledge" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Communication" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Application" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Thinking" stroke="#F97316" strokeWidth={4} dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* Sparklines */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Knowledge */}
                    <div className="bg-surface-container border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-bold">Knowledge</span>
                      </div>
                      <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kcatTrendData}>
                            <defs>
                              <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Knowledge" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorK)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Communication */}
                    <div className="bg-surface-container border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm font-bold">Communication</span>
                      </div>
                      <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kcatTrendData}>
                            <defs>
                              <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Communication" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorC)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Application */}
                    <div className="bg-surface-container border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold">Application</span>
                      </div>
                      <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kcatTrendData}>
                            <defs>
                              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Application" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorA)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Thinking */}
                    <div className="bg-surface-container border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm font-bold">Thinking</span>
                      </div>
                      <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kcatTrendData}>
                            <defs>
                              <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Thinking" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorT)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Actionable Insights */}
                  {kcatInsights && (
                    <div className="bg-surface-container border border-white/5 p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                      <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#D4FF00]" />
                        Actionable Insights
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Strongest Area</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${kcatInsights.strongest.bg}`} />
                            <span className="font-bold">{kcatInsights.strongest.name}</span>
                            <span className={`text-sm font-black ml-auto ${kcatInsights.strongest.color}`}>{kcatInsights.strongest.score}%</span>
                          </div>
                        </div>
                        
                        <div className="h-px w-full bg-white/5" />
                        
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Biggest Opportunity</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${kcatInsights.weakest.bg}`} />
                            <span className="font-bold">{kcatInsights.weakest.name}</span>
                            <span className={`text-sm font-black ml-auto ${kcatInsights.weakest.color}`}>{kcatInsights.weakest.score}%</span>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            Focus on improving your <strong className="text-white">{kcatInsights.weakest.name.toLowerCase()}</strong> skills for your next assessment to increase your grade by the most.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance by Type & Strategic Opportunities */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Performance by Type</h3>
                  <p className="text-xs text-on-surface-variant">Identify areas to improve</p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typePerformanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={48}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#8e9299', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '12px' }}
                        cursor={{ fill: '#ffffff05' }}
                        formatter={(value: number, name: string) => [
                          <span className="font-bold text-white">{value}%</span>, 
                          <span className="text-on-surface-variant capitalize">{name}</span>
                        ]}
                      />
                      <Bar dataKey="average" radius={[8, 8, 8, 8]}>
                        {typePerformanceData.map((entry, index) => {
                          const isHighest = entry.average === Math.max(...typePerformanceData.map(d => d.average));
                          return <Cell key={`cell-${index}`} fill={isHighest ? '#D4FF00' : '#8B5CF6'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strategic Opportunities */}
              {strategicOpportunities && (
                <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Strategic Focus</h3>
                      <p className="text-xs text-on-surface-variant">Weighted impact analysis</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
                    <div className="bg-surface-container border border-white/5 p-5 rounded-2xl">
                      <p className="text-xs text-on-surface-variant mb-2 uppercase tracking-wider font-bold">Highest Leverage</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-white">{strategicOpportunities.highestLeverage.name}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Because <strong className="text-white">{strategicOpportunities.highestLeverage.name}s</strong> are heavily weighted ({strategicOpportunities.highestLeverage.totalWeight}%), a 5% increase here boosts your overall grade by <strong className="text-primary">+{strategicOpportunities.highestLeverage.impact}%</strong>.
                      </p>
                    </div>

                    <div className="bg-surface-container border border-white/5 p-5 rounded-2xl">
                      <p className="text-xs text-on-surface-variant mb-2 uppercase tracking-wider font-bold">Most Lost Marks</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-white">{strategicOpportunities.topOpportunity.name}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        You've lost <strong className="text-red-400">{strategicOpportunities.topOpportunity.lostMarks}%</strong> of your total course grade in this category. Focusing here offers the largest pool of recoverable marks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Grades & Trend */}
            <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Historical Grades & Trend</h3>
                <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /><span>Assessment Score</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /><span>Course Average</span></div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historicalGradesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Line type="monotone" dataKey="average" name="Course Average" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={false} />
                    <Scatter dataKey="score" name="Assessment Score" fill="#00FF66" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
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

      {/* Recent Grades */}
      <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
        <h3 className="text-xl font-bold mb-6">Recent Grades</h3>
        <div className="space-y-4">
          {recentGrades.length > 0 ? recentGrades.map(a => {
            const course = courses.find(c => c.id === a.courseId);
            const pct = (a.score / a.total) * 100;
            const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <div key={a.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{course?.name || 'Unknown Course'}</p>
                    <p className="text-sm text-on-surface-variant">{a.type} • {dateStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-lg">{a.score}/{a.total}</p>
                    <p className="text-sm text-on-surface-variant">{a.weight}% weight</p>
                  </div>
                  <span className={`text-2xl font-black ${pct >= 80 ? 'text-primary' : pct >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          }) : (
            <p className="text-on-surface-variant text-sm">No recent grades available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseRow({ name, grade, trend, isPositive, targetMark, priorityScore, priorityLevel }: { name: string, grade: string, trend: string, isPositive: boolean, targetMark?: number, priorityScore: number, priorityLevel: string }) {
  const priorityColor = priorityLevel === 'High' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                        priorityLevel === 'Medium' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 
                        'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/20';

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg -mx-2">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-[#00FF66]' : 'bg-red-500'}`} />
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
        <div className={`flex items-center gap-1 w-24 justify-end font-bold text-sm ${isPositive ? 'text-[#00FF66]' : 'text-red-500'}`}>
          {targetMark && (isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
          {trend}
        </div>
      </div>
    </div>
  );
}

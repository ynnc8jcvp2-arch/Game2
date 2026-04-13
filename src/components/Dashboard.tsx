import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Course, Assessment, OperationType } from '../types';
import { logout, db, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  TrendingUp, 
  Target, 
  AlertCircle,
  ChevronRight,
  Trash2,
  GraduationCap,
  Users,
  Award,
  Zap,
  TrendingDown,
  Keyboard,
  MoreVertical,
  Activity,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GradeEntry from './GradeEntry';
import UniversityMatch from './UniversityMatch';
import Social from './Social';
import Insights from './Insights';
import Simulator from './Simulator';
import Courses from './Courses';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar as RechartsRadar,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  user: User;
  profile: UserProfile | null;
  courses: Course[];
  assessments: Assessment[];
}

export default function Dashboard({ user, profile, courses, assessments }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grades' | 'university' | 'social' | 'insights' | 'simulator'>('overview');
  const [curriculum, setCurriculum] = useState<'Standard' | 'AP' | 'IB' | 'A-Level'>('Standard');
  const [showOnboarding, setShowOnboarding] = useState(profile?.onboardingComplete === false);

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

  const overallAverage = courses.length > 0 
    ? courses.reduce((acc, c) => acc + calculateCourseAverage(c.id), 0) / courses.length 
    : 0;

  const top6Average = useMemo(() => {
    const averages = courses.map(c => calculateCourseAverage(c.id)).sort((a, b) => b - a);
    const top6 = averages.slice(0, 6);
    return top6.length > 0 ? top6.reduce((a, b) => a + b, 0) / top6.length : 0;
  }, [courses, assessments]);

  const trendData = useMemo(() => {
    if (!assessments || assessments.length === 0) {
      return [
        { date: 'Sep 1', average: 85 },
        { date: 'Oct 1', average: 87 },
        { date: 'Nov 1', average: 89 },
        { date: 'Dec 1', average: 91 },
        { date: 'Jan 1', average: 91.5 },
      ];
    }

    const sorted = [...assessments]
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
      { date: 'Jan 1', average: 91.5 },
    ];
  }, [assessments]);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-surface-container-low flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-primary" />
          <span className="text-2xl font-black tracking-tighter text-gradient-primary">Gradecast</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <NavButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookOpen className="w-5 h-5" />} label="Courses" />
          <NavButton active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} icon={<Zap className="w-5 h-5" />} label="Grades" />
          <NavButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<Activity className="w-5 h-5" />} label="Insights" />
          <NavButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} icon={<Target className="w-5 h-5" />} label="Simulator" />
          <NavButton active={activeTab === 'university'} onClick={() => setActiveTab('university')} icon={<GraduationCap className="w-5 h-5" />} label="University Match" />
          <NavButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users className="w-5 h-5" />} label="Social" />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-full bg-on-surface/10 border border-white/10" alt="" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-surface rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-on-surface-variant hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface-container-lowest">
        <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-md border-b border-white/5 px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">
              {activeTab === 'overview' ? 'Your Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-on-surface-variant">
              {activeTab === 'overview' ? 'Week of April 6-12, 2026' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('grades')} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Top 6 Average" value={`${top6Average.toFixed(1)}`} trend="+2.3% this month" isPositive={true} colorHint="bg-primary" />
                <StatCard title="Overall Average" value={`${overallAverage.toFixed(1)}`} trend="+1.8% this month" isPositive={true} colorHint="bg-blue-500" />
                <StatCard title="Active Courses" value={`${courses.length}`} trend="2 completed this semester" isPositive={null} colorHint="bg-purple-500" />
                <StatCard title="Study Streak" value="12" trend="days current streak" isPositive={true} colorHint="bg-orange-500" />
              </div>

              {/* Main Analytics Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Course Targets</h3>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Target</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {courses.length > 0 ? courses.map(course => {
                      const avg = calculateCourseAverage(course.id);
                      const target = course.targetMark || 0;
                      const isMeetingTarget = avg >= target;
                      return (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="font-bold">{course.name}</span>
                              <div className="flex gap-4">
                                <span className="text-sm text-on-surface-variant">Current: <span className="text-white font-bold">{avg.toFixed(1)}%</span></span>
                                {target > 0 && (
                                  <span className="text-sm text-blue-400 font-bold">Target: {target}%</span>
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                              <div 
                                className={`absolute top-0 bottom-0 left-0 ${isMeetingTarget ? 'bg-primary' : 'bg-orange-500'}`} 
                                style={{ width: `${Math.min(avg, 100)}%` }} 
                              />
                              {target > 0 && (
                                <div 
                                  className="absolute top-0 bottom-0 bg-blue-500 w-1 z-10" 
                                  style={{ left: `${target}%` }} 
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-sm text-on-surface-variant">No courses added yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Average Grade Over Time</h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <span>Cumulative Average</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#8e9299', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="average" stroke="#D4FF00" strokeWidth={3} dot={{ r: 4, fill: '#D4FF00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'courses' && <Courses user={user} courses={courses} />}
          {activeTab === 'grades' && <GradeEntry user={user} profile={profile} courses={courses} assessments={assessments} />}
          {activeTab === 'university' && <UniversityMatch average={top6Average} />}
          {activeTab === 'social' && <Social user={user} profile={profile} />}
          {activeTab === 'insights' && <Insights courses={courses} assessments={assessments} />}
          {activeTab === 'simulator' && <Simulator courses={courses} assessments={assessments} />}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all group relative ${
        active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
      }`}
    >
      {active && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-primary rounded-full" />}
      {icon}
      <span className="font-bold tracking-tight">{label}</span>
      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${active ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
    </button>
  );
}

function StatCard({ title, value, trend, isPositive, colorHint }: { title: string, value: string, trend: string, isPositive: boolean | null, colorHint?: string }) {
  return (
    <div className={`bg-surface-container-low border border-white/5 p-8 rounded-[32px] group hover:border-white/20 transition-all relative overflow-hidden`}>
      {colorHint && <div className={`absolute top-0 left-0 w-full h-1 ${colorHint}`} />}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <p className="text-sm text-on-surface-variant mb-2 relative z-10">{title}</p>
      <p className="text-4xl font-black tracking-tighter mb-2 text-white relative z-10">{value}</p>
      <p className={`text-sm font-medium relative z-10 ${isPositive === true ? 'text-primary' : isPositive === false ? 'text-red-500' : 'text-on-surface-variant'}`}>
        {trend}
      </p>
    </div>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" />
      <path d="M30 50C30 50 40 50 45 50C50 50 65 35 70 30M70 30L60 30M70 30L70 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { UserProfile, Friendship, OperationType, FeedEvent, Reaction } from '../types';
import { Users, UserPlus, Check, Clock, TrendingUp, MessageSquare, Heart, Zap, Lock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocialProps {
  user: User;
  profile: UserProfile | null;
}

export default function Social({ user, profile }: SocialProps) {
  const [progressVisible, setProgressVisible] = useState(true);
  const [showBadges, setShowBadges] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">Social Progress</h1>
        <p className="text-on-surface-variant">
          Share achievements, celebrate improvements, and support friends
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Privacy Settings</h3>
            <p className="text-xs text-on-surface-variant">Control what friends can see</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">Progress visible</span>
            <button 
              onClick={() => setProgressVisible(!progressVisible)}
              className={`w-12 h-6 rounded-full transition-colors relative ${progressVisible ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${progressVisible ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">Show badges</span>
            <button 
              onClick={() => setShowBadges(!showBadges)}
              className={`w-12 h-6 rounded-full transition-colors relative ${showBadges ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${showBadges ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Your Progress */}
      <div className="bg-primary p-8 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <h2 className="text-2xl font-black tracking-tighter mb-8 relative z-10 text-black">Your Progress</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <div>
            <p className="text-xs text-black/80 font-bold mb-1">Study Streak</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black tracking-tighter text-black">12</p>
              <Zap className="w-5 h-5 text-black" />
            </div>
            <p className="text-xs text-black/60 mt-1">days in a row</p>
          </div>
          <div>
            <p className="text-xs text-black/80 font-bold mb-1">This Month</p>
            <p className="text-4xl font-black tracking-tighter text-black">+2.3%</p>
            <p className="text-xs text-black/60 mt-1">improvement</p>
          </div>
          <div>
            <p className="text-xs text-black/80 font-bold mb-1">Badges Earned</p>
            <p className="text-4xl font-black tracking-tighter text-black">3/6</p>
            <p className="text-xs text-black/60 mt-1">unlocked</p>
          </div>
          <div>
            <p className="text-xs text-black/80 font-bold mb-1">Friends</p>
            <p className="text-4xl font-black tracking-tighter text-black">4</p>
            <p className="text-xs text-black/60 mt-1">connected</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-2xl font-black tracking-tighter mb-6">Badges</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <BadgeCard 
            icon={<Zap className="w-6 h-6" />} 
            title="Study Streak" 
            desc="12 days in a row" 
            color="text-yellow-500" 
            bg="bg-yellow-500/10" 
          />
          <BadgeCard 
            icon={<Award className="w-6 h-6" />} 
            title="High Achiever" 
            desc="Top 6 above 90%" 
            color="text-primary" 
            bg="bg-primary/10" 
          />
          <BadgeCard 
            icon={<TrendingUp className="w-6 h-6" />} 
            title="Improvement King" 
            desc="+5% in any course" 
            color="text-primary" 
            bg="bg-primary/10" 
          />
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ icon, title, desc, color, bg }: { icon: React.ReactNode, title: string, desc: string, color: string, bg: string }) {
  // Extract color hint from text color class (e.g. text-yellow-500 -> bg-yellow-500)
  const colorHint = color.replace('text-', 'bg-');
  
  return (
    <div className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] flex flex-col items-start hover:border-white/20 transition-all relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${colorHint}`} />
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-10 ${colorHint}`} />
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative z-10 ${bg} ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-1 relative z-10">{title}</h3>
      <p className="text-xs text-on-surface-variant mb-6 relative z-10">{desc}</p>
      <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-primary relative z-10">
        <Check className="w-4 h-4" /> Earned
      </div>
    </div>
  );
}

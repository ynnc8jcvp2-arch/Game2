import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { UserProfile, Friendship, OperationType, FeedEvent, Reaction } from '../types';
import { Users, UserPlus, Check, Clock, TrendingUp, MessageSquare, Heart, Zap, Lock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdBanner from './AdBanner';

interface SocialProps {
  user: User;
  profile: UserProfile | null;
  isPremium?: boolean;
}

export default function Social({ user, profile, isPremium }: SocialProps) {
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
      <div className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
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

      {/* Add Friend Section */}
      <div className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Add a Friend</h3>
            <p className="text-xs text-on-surface-variant">Connect via email to share progress</p>
          </div>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const emailInput = form.elements.namedItem('email') as HTMLInputElement;
            if (emailInput.value) {
              alert(`Friend request sent to ${emailInput.value}!`);
              emailInput.value = '';
            }
          }} 
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input 
            type="email" 
            name="email"
            placeholder="Friend's email address" 
            className="input-field w-full md:w-64"
            required
          />
          <button type="submit" className="btn-primary py-3 px-6 text-sm">
            Send Invite
          </button>
          <a 
            href={`mailto:?subject=Join me on Bombon&body=Hey! I'm using Bombon to track my grades. Add me as a friend using my email: ${user.email}`}
            className="btn-secondary py-3 px-6 text-sm whitespace-nowrap"
          >
            Email Link
          </a>
        </form>
      </div>

      {!isPremium && <AdBanner type="horizontal" />}

      {/* Your Progress */}
      <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <h2 className="text-2xl font-black tracking-tighter mb-8 relative z-10 text-white">Your Progress</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <div>
            <p className="text-xs text-on-surface-variant font-bold mb-1">Study Streak</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black tracking-tighter text-white">12</p>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-xs text-on-surface-variant mt-1">days in a row</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold mb-1">This Month</p>
            <p className="text-4xl font-black tracking-tighter text-[#00FF66]">+2.3%</p>
            <p className="text-xs text-on-surface-variant mt-1">improvement</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold mb-1">Badges Earned</p>
            <p className="text-4xl font-black tracking-tighter text-white">3/6</p>
            <p className="text-xs text-on-surface-variant mt-1">unlocked</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold mb-1">Friends</p>
            <p className="text-4xl font-black tracking-tighter text-white">4</p>
            <p className="text-xs text-on-surface-variant mt-1">connected</p>
          </div>
        </div>
      </div>

      {/* Leaderboard & Badges Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Leaderboard */}
        <div className="lg:col-span-1 bg-surface-container-low border border-white/5 p-8 rounded-[32px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Leaderboard</h3>
              <p className="text-xs text-on-surface-variant">Top 6 Average</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 relative z-10">
            {[
              { rank: 1, name: 'Alex M.', score: 94.2, isUser: false },
              { rank: 2, name: profile?.displayName || 'You', score: profile?.top6Projection || 92.4, isUser: true },
              { rank: 3, name: 'Sam K.', score: 89.8, isUser: false },
              { rank: 4, name: 'Jordan T.', score: 87.5, isUser: false },
            ].map((friend) => (
              <div key={friend.rank} className={`flex items-center gap-4 p-4 rounded-2xl border ${friend.isUser ? 'bg-primary/10 border-primary/20' : 'bg-surface-container border-white/5'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${friend.rank === 1 ? 'bg-yellow-500 text-black' : friend.rank === 2 ? 'bg-gray-300 text-black' : friend.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'}`}>
                  {friend.rank}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${friend.isUser ? 'text-primary' : 'text-white'}`}>{friend.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">{friend.score.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black tracking-tighter mb-6">Badges</h2>
          <div className="grid md:grid-cols-2 gap-6">
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
            <BadgeCard 
              icon={<Check className="w-6 h-6" />} 
              title="First Assessment" 
              desc="Logged your first grade" 
              color="text-emerald-500" 
              bg="bg-emerald-500/10" 
            />
          </div>
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

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Zap, Sparkles, Shield, Crown, CreditCard, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export default function PremiumModal({ isOpen, onClose, profile }: PremiumModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!profile?.uid) return;
    
    setIsLoading(true);
    // Simulate Stripe Checkout delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          isPremium: true
        });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } catch (error) {
        console.error("Error upgrading to premium:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface-container border border-white/10 rounded-[32px] w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Value Prop */}
        <div className="md:w-2/5 bg-gradient-to-br from-primary/20 to-blue-500/20 p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Crown className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-4 text-white">Unlock Your Full Potential</h2>
            <p className="text-on-surface-variant mb-8">
              Get the edge you need for university admissions with advanced AI insights, zero distractions, and unlimited tracking.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">Unlimited AI Grade Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">100% Ad-Free Experience</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">Advanced University Matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Pricing */}
        <div className="md:w-3/5 p-8 bg-surface-container flex flex-col justify-center">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Welcome to Premium!</h3>
              <p className="text-on-surface-variant">Your account has been upgraded successfully.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Bombon Premium</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-black text-white">$4.99</span>
                  <span className="text-on-surface-variant font-bold mb-1">/month</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-2">Cancel anytime. Billed monthly.</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-bold text-white">Secure Stripe Checkout</span>
                  </div>
                  <Check className="w-5 h-5 text-primary" />
                </div>
              </div>

              <button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-primary text-black font-black text-lg py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Subscribe Now
                  </>
                )}
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

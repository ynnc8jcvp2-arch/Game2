import React from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { BarChart3, GraduationCap, Zap, Globe, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden relative">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Background3D />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-6 lg:px-12 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now deployed: v4.0 Analytics Engine
            </div>
            <h1 className="text-6xl lg:text-[84px] font-extrabold tracking-tight text-on-surface leading-[0.9]">
              Master your <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-indigo-400">trajectory.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg font-normal leading-relaxed">
              Architectural-grade academic intelligence for competitive planning. Map complex trajectories with institutional rigor and live predictive modeling.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5 }}
                whileTap={{ scale: 0.95, rotateX: 10, rotateY: -10 }}
                onClick={signInWithGoogle}
                className="btn-primary px-8 py-3 rounded-full text-[14px] font-bold shadow-lg shadow-primary/20"
              >
                Open Terminal
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, rotateX: -5, rotateY: -5 }}
                whileTap={{ scale: 0.95, rotateX: 10, rotateY: 10 }}
                className="btn-secondary px-8 py-3 rounded-full text-[14px] font-semibold"
              >
                View Specs
              </motion.button>
            </div>
          </motion.div>

          <div className="relative h-[600px] w-full hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 15, rotateY: -10, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 5, rotateY: -2, z: 0 }}
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02, z: 50 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 w-[550px] glass-panel rounded-xl overflow-hidden p-1 shadow-2xl cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Dashboard simulation" 
                className="w-full rounded-lg"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -40, z: 50 }}
              animate={{ opacity: 1, x: 0, z: 100 }}
              whileHover={{ scale: 1.1, z: 150 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="absolute -bottom-10 left-10 w-[320px] glass-panel rounded-xl overflow-hidden p-4 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Success Rate</div>
              <div className="text-4xl font-bold text-on-surface">94.2%</div>
              <div className="mt-3 h-1 w-full bg-on-surface/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94.2%' }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capability Grid */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-xl">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">Functional Matrix</h2>
            <p className="text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-tight">Engineered for absolute academic precision.</p>
          </div>
          <p className="text-on-surface-variant text-lg max-w-sm font-normal">Standardizing high-density academic data capture across global curricula with millisecond latency.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<BarChart3 className="w-5 h-5" />}
            title="High-Density Ledger"
            description="Automated GPA weighting for AP, IB, and A-Level. Integrated low-latency data submission nodes."
          />
          <FeatureCard 
            icon={<Globe className="w-5 h-5" />}
            title="Global Indexing"
            description="Proprietary university admission scoring engine built on 10M+ anonymized data points."
          />
          <FeatureCard 
            icon={<Zap className="w-5 h-5" />}
            title="Delta Analytics"
            description="Neural parsing for PDF transcripts. Automated data mapping into the Gradecast core ledger."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-outline-variant/15 px-6 lg:px-12 bg-surface-container-low z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary rounded-[4px]"></div>
            <span className="text-lg font-bold tracking-tight text-on-surface">Gradecast</span>
          </div>
          <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-widest">© 2026 Gradecast Terminal Corp.</span>
          <div className="flex gap-4">
            <ShieldCheck className="w-5 h-5 text-on-surface-variant" />
            <Globe className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function Background3D() {
  return (
    <div className="w-full h-full relative" style={{ perspective: '1000px' }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%', 
            z: Math.random() * -500,
            rotateX: Math.random() * 360,
            rotateY: Math.random() * 360,
            opacity: 0
          }}
          animate={{ 
            y: [null, Math.random() * 100 + '%'],
            rotateX: [null, Math.random() * 360],
            rotateY: [null, Math.random() * 360],
            opacity: [0, 0.15, 0]
          }}
          transition={{ 
            duration: Math.random() * 20 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-12 h-12 border border-primary/20 rounded-lg"
          style={{ transformStyle: 'preserve-3d' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface" />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10, rotateX: -5, rotateY: 5, scale: 1.02, z: 20 }}
      whileTap={{ scale: 0.98, rotateX: 5, rotateY: -5 }}
      className="glass-panel p-8 rounded-2xl group transition-all duration-500 cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-on-surface">{title}</h3>
      <p className="text-on-surface-variant text-[15px] leading-relaxed mb-6">{description}</p>
      <div className="h-1 w-full bg-on-surface/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary w-0 group-hover:w-[70%] transition-all duration-1000 ease-out"></div>
      </div>
    </motion.div>
  );
}

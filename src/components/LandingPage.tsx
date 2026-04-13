import React from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { 
  BarChart3, 
  Zap, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  ChevronRight, 
  Layers, 
  Cpu, 
  Database, 
  Lock, 
  ArrowUpRight,
  Activity,
  Play,
  Star
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/50 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Gradecast</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 bg-surface-container-high/50 px-8 py-3 rounded-full border border-white/5">
            {['About Us', 'Features', 'Services', 'Analytics', 'Pricing', 'Help Center'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-on-surface-variant hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={signInWithGoogle} className="text-sm font-bold hover:text-primary transition-colors hidden sm:block">Log in</button>
            <button onClick={signInWithGoogle} className="btn-secondary text-sm px-6 py-2">
              Contact Sales
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 lg:px-12 text-center">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Play className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-on-surface-variant">Academic Management Software</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl lg:text-[140px] font-medium tracking-tighter leading-none mb-8 text-primary"
          >
            gradecast
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            Manage your grades like a pro. From tracking assignments to predicting university admissions, our app empowers you to take control of your academic future — effortlessly.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <button onClick={signInWithGoogle} className="btn-primary">Get Started</button>
            <button className="btn-secondary">Schedule a Demo</button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Over 200+ Five Star Reviews</span>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 max-w-6xl mx-auto relative z-10"
        >
          <div className="bg-surface-container-low border-[8px] border-surface-container-high rounded-[40px] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full h-auto opacity-80 mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />
            {/* Overlay UI elements to simulate the app */}
            <div className="absolute inset-0 bg-surface/80 p-8 flex gap-8">
              {/* Sidebar Mock */}
              <div className="w-64 bg-surface-container-high rounded-3xl p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-12">
                  <LogoIcon className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg">Gradecast</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-accent/20 text-accent px-4 py-3 rounded-xl font-medium flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </div>
                  <div className="text-on-surface-variant px-4 py-3 font-medium flex items-center gap-3">
                    <Activity className="w-4 h-4" /> Analytics
                  </div>
                </div>
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 space-y-6">
                <div className="flex gap-6">
                  <div className="flex-1 bg-surface-container-high rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant">Overall Average</p>
                      <p className="text-3xl font-bold">92.4%</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-surface-container-high rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant">Top 6 Average</p>
                      <p className="text-3xl font-bold">94.8%</p>
                    </div>
                  </div>
                </div>
                <div className="h-64 bg-surface-container-high rounded-3xl p-6 relative overflow-hidden">
                  <p className="font-bold mb-4">Analytics</p>
                  <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-accent/20 to-transparent" />
                  <div className="flex items-end justify-between h-32 px-4 gap-2">
                    {[40, 60, 45, 80, 65, 90, 75, 85].map((h, i) => (
                      <div key={i} className="w-full bg-primary/20 rounded-t-md relative group">
                        <div className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all group-hover:bg-accent" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 lg:px-12 relative">
        <div className="absolute top-1/2 left-1/4 w-[30vw] h-[30vw] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-medium tracking-tight mb-6">
              Our Analytics <br/> <span className="text-accent">Feature</span>
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Get advanced insights into your academic performance. Our analytics engine provides real-time data to help you make informed decisions about your study habits and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Performance Tracking"
              description="Monitor your grades across all subjects with intuitive charts and detailed breakdowns."
              color="primary"
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Goal Setting"
              description="Set target marks for each course and track your progress towards achieving them."
              color="accent"
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6" />}
              title="Predictive Modeling"
              description="Simulate future grades to see how they will impact your overall and top 6 averages."
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* Global Currency / Core Feature */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl lg:text-7xl font-medium tracking-tight mb-8">
            University Match
          </h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto">
            Effortlessly discover university programs that match your academic profile with real-time admission probability scoring — all in one seamless service.
          </p>
          <button onClick={signInWithGoogle} className="btn-primary">
            Start with Gradecast
          </button>
        </div>

        <div className="max-w-6xl mx-auto mt-24 flex flex-wrap justify-center gap-12 text-sm font-medium text-on-surface-variant">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Multi-Device Access
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Customizable Dashboards
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Grade Insights
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Real-Time Alerts
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Gradecast</span>
          </div>
          <div className="flex gap-6 text-sm text-on-surface-variant">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 20 L85 50 L25 80 Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 35 L65 50 L35 65 Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'primary' | 'accent' }) {
  return (
    <div className="fintech-card group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${
        color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
      }`}>
        {icon}
      </div>
      <h3 className="text-2xl font-medium mb-4">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  );
}

// Mock icons for the dashboard preview
function LayoutDashboard({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
function Target({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

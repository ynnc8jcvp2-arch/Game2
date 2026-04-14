import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  type?: 'horizontal' | 'rectangle';
  className?: string;
}

export default function AdBanner({ type = 'horizontal', className = '' }: AdBannerProps) {
  // In a real app, this would be a Google AdSense <ins> tag.
  // For the prototype, we show a contextual mock ad.
  const ads = [
    { title: "Struggling with Calculus?", desc: "Get 1-on-1 tutoring from top university students.", cta: "Find a Tutor" },
    { title: "Boost Your Top 6 Average", desc: "Join our intensive summer prep courses for Grade 12s.", cta: "Learn More" },
    { title: "Write the Perfect AIF", desc: "Waterloo Engineering admission consultants available now.", cta: "Book Consultation" },
    { title: "Scholarships for Ontario Students", desc: "Find over $50,000 in unclaimed scholarships.", cta: "Apply Now" }
  ];
  
  // Pick a random ad based on the current time so it doesn't flicker on every render, but changes occasionally
  const adIndex = Math.floor(Date.now() / 60000) % ads.length;
  const ad = ads[adIndex] || ads[0];

  return (
    <div className={`bg-surface-container-high border border-white/10 rounded-2xl p-4 relative overflow-hidden flex ${type === 'horizontal' ? 'flex-col md:flex-row md:items-center justify-between' : 'flex-col'} gap-4 ${className}`}>
      <div className="absolute top-0 right-0 bg-black/50 text-[10px] text-white/50 px-2 py-0.5 rounded-bl-lg uppercase tracking-wider font-bold z-10">Advertisement</div>
      
      <div className="relative z-10">
        <h4 className="font-bold text-white mb-1">{ad.title}</h4>
        <p className="text-sm text-on-surface-variant">{ad.desc}</p>
      </div>
      
      <button className="relative z-10 bg-primary/20 text-primary hover:bg-primary/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center justify-center gap-2 w-full md:w-auto">
        {ad.cta} <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}

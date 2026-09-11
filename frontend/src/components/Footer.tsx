'use client';

import React from 'react';
import { Sparkles, Shield, Terminal, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode: 'login' | 'signup', role?: 'candidate' | 'recruiter') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-amber-500/20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">AI TALENT MATRIX</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Next-generation autonomous AI talent intelligence platform. Built with Next.js 14 single-page frontend decoupled from high-dimensional Python AI vector microservices.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Python Agent Cluster: 100% Operational</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2 text-stone-400 font-medium">
                <li><a href="#hero" className="hover:text-amber-400">Overview</a></li>
                <li><a href="#features" className="hover:text-amber-400">Capabilities</a></li>
                <li><a href="#simulator" className="hover:text-amber-400">AI Match Engine</a></li>
                <li><a href="#architecture" className="hover:text-amber-400">Python Architecture</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">Demo Portals</h4>
              <ul className="space-y-2 text-stone-400 font-medium">
                <li><button onClick={() => onOpenAuth('login', 'recruiter')} className="hover:text-amber-400">Recruiter Dashboard</button></li>
                <li><button onClick={() => onOpenAuth('login', 'candidate')} className="hover:text-amber-400">Candidate Portal</button></li>
                <li><button onClick={() => onOpenAuth('signup', 'recruiter')} className="hover:text-amber-400">Register Recruiter</button></li>
                <li><button onClick={() => onOpenAuth('signup', 'candidate')} className="hover:text-amber-400">Register Candidate</button></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">Compliance & Tech</h4>
              <ul className="space-y-2 text-stone-400 font-medium">
                <li><span>NYC Law 144 Compliant</span></li>
                <li><span>EU AI Act Audited</span></li>
                <li><span>PyTorch & Next.js 14</span></li>
                <li><span>OpenAPI 3.0 Standard</span></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 AI Talent Matrix Inc. Built with Next.js 14 SPA & Python Autonomous Agents.</p>
          
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-stone-900 text-stone-300 hover:text-amber-400 hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, UserCheck, Play, Trophy, Star, Brain, Target } from 'lucide-react';
import { MOCK_CANDIDATES } from '../data/mockData';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup', role?: 'candidate' | 'recruiter') => void;
  onExploreSimulator: () => void;
}

const trustBadges = [
  {
    icon: <Brain className="w-5 h-5 text-amber-600 shrink-0" />,
    title: 'AI Talent Score™',
    sub: 'Multi-dimensional skill rating',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />,
    title: 'Fraud Detection',
    sub: 'Verified authenticity checks',
  },
  {
    icon: <Target className="w-5 h-5 text-amber-600 shrink-0" />,
    title: 'Smart Job Matching',
    sub: 'AI-powered role recommendations',
  },
];

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onExploreSimulator }) => {
  const router = useRouter();
  const [activeCandIndex, setActiveCandIndex] = useState(0);
  const candidate = MOCK_CANDIDATES[activeCandIndex];

  // Auto-rotate candidate preview cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCandIndex((prev) => (prev + 1) % MOCK_CANDIDATES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const talentScoreDimensions = [
    { label: 'Coding Ability', score: 92 },
    { label: 'Project Quality', score: 88 },
    { label: 'Innovation', score: 85 },
    { label: 'Leadership', score: 79 },
  ];

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center hero-image-bg pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Background glowing overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-300/20 rounded-full blur-3xl pointer-events-none animate-glow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left Column: Product Value Proposition */}
        <div className="lg:col-span-7 space-y-6 text-left">

          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gold-badge text-xs font-bold shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-amber-600 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>AI-Powered Talent Intelligence & Recruitment Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
            Hire on Real Skills, <br className="hidden sm:inline" />
            <span className="text-gold-gradient drop-shadow-xs">Not Just Resumes</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-700 font-normal leading-relaxed max-w-2xl">
            Discover, verify, and hire top talent based on verified GitHub contributions, hackathon performance, project quality, and AI-driven assessments — building a trusted hiring ecosystem for candidates and recruiters.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/recruiter"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 text-stone-950 text-sm font-black shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start Recruiting Smarter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/candidate"
              className="px-6 py-4 rounded-2xl glass-panel border border-amber-300/80 text-stone-900 text-sm font-bold hover:bg-stone-100/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Build Your Talent Profile</span>
            </Link>

            <button
              onClick={onExploreSimulator}
              className="px-5 py-4 rounded-2xl text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 group"
            >
              <Play className="w-3.5 h-3.5 fill-amber-600 group-hover:scale-110 transition-transform" />
              <span>See AI Matching Live</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-amber-200/80 grid grid-cols-3 gap-4">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                {badge.icon}
                <div className="text-left">
                  <p className="text-xs font-extrabold text-stone-900">{badge.title}</p>
                  <p className="text-[10px] text-stone-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live AI Talent Scorecard */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-300/80 shadow-2xl shadow-amber-500/10 space-y-5 animate-float">

            {/* Header of Card */}
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-extrabold tracking-wider text-stone-800 uppercase">
                  Live AI Talent Profile
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
                AI TALENT SCORE™
              </span>
            </div>

            {/* Candidate Info Profile */}
            <div className="flex items-start gap-4">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-stone-900">{candidate.name}</h3>
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    {candidate.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-700">{candidate.role}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{candidate.experience}</p>
              </div>
            </div>

            {/* AI Talent Score Dimensions */}
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">AI Talent Score™ Breakdown</span>
              {talentScoreDimensions.map((dim, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span>{dim.label}</span>
                    <span className="font-mono text-amber-700">{dim.score}</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div className="bg-amber-50 p-3.5 rounded-2xl text-left border border-amber-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bot className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-800 uppercase">AI Career Insight</span>
              </div>
              <p className="text-xs text-stone-700 font-normal leading-relaxed">
                "{candidate.aiSummary}"
              </p>
            </div>

            {/* Verified Skills */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Verified Skill Badges</span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1"
                  >
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Candidate Switcher */}
            <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Sample Talent Profiles:</span>
              <div className="flex gap-1.5">
                {MOCK_CANDIDATES.map((cand, idx) => (
                  <button
                    key={cand.id}
                    onClick={() => setActiveCandIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      activeCandIndex === idx
                        ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                        : 'bg-stone-200 text-stone-700 hover:bg-amber-200'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CANDIDATES } from '../data/mockData';
import { 
  UserCheck, Briefcase, Sparkles, CheckCircle2, FileText, 
  Bot, ArrowRight, Shield, Award, Users, Trophy, TrendingUp, Search, Star
} from 'lucide-react';

interface RolePortalsPreviewProps {
  onOpenAuth: (mode: 'login' | 'signup', role?: 'candidate' | 'recruiter') => void;
}

export const RolePortalsPreview: React.FC<RolePortalsPreviewProps> = ({ onOpenAuth }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'recruiter' | 'candidate'>('recruiter');

  const recruiterStats = [
    { label: 'Active Job Openings', value: '12 Jobs', change: '↑ 4 new this week', positive: true },
    { label: 'AI-Matched Candidates', value: '148 Profiles', change: '> 90% Match Rate', positive: true },
    { label: 'Screenings Automated', value: '64 Done', change: 'Saved 38 hours', positive: true },
    { label: 'Hiring Quality Score', value: '4.8 / 5.0', change: 'Top 5% platform-wide', positive: true },
  ];

  const candidateHighlights = [
    { icon: <Trophy className="w-4 h-4 text-amber-600" />, label: 'Hackathon Wins', value: '3 National Wins' },
    { icon: <Star className="w-4 h-4 text-amber-600" />, label: 'AI Talent Score™', value: '92 / 100' },
    { icon: <Award className="w-4 h-4 text-amber-600" />, label: 'Verified Badges', value: '8 Skills Verified' },
    { icon: <TrendingUp className="w-4 h-4 text-amber-600" />, label: 'Job Matches', value: '24 Opportunities' },
  ];

  return (
    <section id="demo-portal" className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-100/70 relative">

      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Platform Previews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Built for Both Sides of <br />
            <span className="text-gold-gradient">the Hiring Equation</span>
          </h2>
          <p className="text-base text-stone-600">
            Explore tailored experiences for job seekers and hiring teams — powered by the same AI intelligence engine.
          </p>

          {/* Persona Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'recruiter'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 border-2 border-amber-600'
                  : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-300'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Recruiter Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'candidate'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 border-2 border-amber-600'
                  : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-300'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Candidate Portal</span>
            </button>
          </div>
        </div>

        {/* ── RECRUITER TAB ── */}
        {activeTab === 'recruiter' ? (
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border-2 border-amber-300 shadow-2xl space-y-8 text-left">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
                  RECRUITER DASHBOARD PREVIEW
                </span>
                <h3 className="text-2xl font-black text-stone-900 mt-1">
                  AI-Powered Talent Acquisition Center
                </h3>
                <p className="text-sm text-stone-500 mt-1">Discover, verify, and hire top talent based on real skills and contributions</p>
              </div>
              <button
                onClick={() => router.push('/auth/recruiter')}
                className="px-5 py-2.5 bg-stone-950 text-amber-400 text-xs font-extrabold rounded-xl hover:bg-stone-900 transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Demo as Recruiter</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recruiterStats.map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-black text-stone-900 mt-1">{stat.value}</p>
                  <span className={`text-[10px] font-bold ${stat.positive ? 'text-emerald-600' : 'text-stone-500'}`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Copilot Search Bar */}
            <div className="bg-stone-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Bot className="w-4 h-4" />
                <span>RECRUITER AI COPILOT — Natural Language Search</span>
              </div>
              <div className="flex items-center gap-3 bg-stone-900 rounded-xl px-4 py-3 border border-stone-700">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-stone-300 text-xs italic">
                  "Find top React developers with hackathon experience from Delhi"
                </span>
                <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">AI Search</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Top AI/ML developers',
                  'Open-source contributors',
                  'Hackathon winners',
                  'GenAI specialists',
                  'React + Node.js experts',
                ].map((q, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold text-stone-300 bg-stone-800 px-3 py-1.5 rounded-full border border-stone-700 cursor-pointer hover:border-amber-500/60 hover:text-amber-300 transition-colors"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Leaderboard */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
                  AI-Ranked Top Candidates for "Staff AI Engineer"
                </h4>
                <span className="text-xs text-stone-500">Ranked by AI Talent Score™</span>
              </div>
              <div className="space-y-3">
                {MOCK_CANDIDATES.map((cand, rank) => (
                  <div key={cand.id} className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center shrink-0">
                        #{rank + 1}
                      </span>
                      <img src={cand.avatar} className="w-10 h-10 rounded-xl object-cover border border-amber-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-stone-900">{cand.name}</h5>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {cand.matchScore}% AI Match
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{cand.role} • {cand.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAuth('login', 'recruiter')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
                      >
                        AI Outreach
                      </button>
                      <button
                        onClick={() => onOpenAuth('login', 'recruiter')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-extrabold hover:bg-amber-600 transition-colors"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* ── CANDIDATE TAB ── */
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border-2 border-amber-300 shadow-2xl space-y-8 text-left">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                  CANDIDATE PORTAL PREVIEW
                </span>
                <h3 className="text-2xl font-black text-stone-900 mt-1">
                  Your AI Talent Identity & Career Hub
                </h3>
                <p className="text-sm text-stone-500 mt-1">Showcase verified skills, track progress, and get matched with the right opportunities</p>
              </div>
              <button
                onClick={() => router.push('/auth/candidate')}
                className="px-5 py-2.5 bg-stone-950 text-amber-400 text-xs font-extrabold rounded-xl hover:bg-stone-900 transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Demo as Candidate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left: Profile + Score */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-amber-200 space-y-5">
                <div className="flex items-center gap-4">
                  <img src={MOCK_CANDIDATES[0].avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400" />
                  <div>
                    <h4 className="text-lg font-extrabold text-stone-900">{MOCK_CANDIDATES[0].name}</h4>
                    <p className="text-xs font-semibold text-amber-700">{MOCK_CANDIDATES[0].role}</p>
                    <p className="text-[11px] text-stone-500">{MOCK_CANDIDATES[0].experience}</p>
                  </div>
                </div>

                {/* Talent Score Bars */}
                <div className="space-y-3">
                  <h5 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">AI Talent Score™ Dashboard</h5>
                  {[
                    { label: 'Coding Ability', score: 92, color: 'bg-amber-500' },
                    { label: 'Project Quality', score: 88, color: 'bg-emerald-500' },
                    { label: 'Innovation', score: 85, color: 'bg-sky-500' },
                    { label: 'Problem Solving', score: 80, color: 'bg-purple-500' },
                    { label: 'Community Impact', score: 76, color: 'bg-rose-500' },
                  ].map((dim, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-700">
                        <span>{dim.label}</span>
                        <span className="font-mono">{dim.score}/100</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div className={`${dim.color} h-full rounded-full`} style={{ width: `${dim.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlight Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {candidateHighlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      {h.icon}
                      <div>
                        <p className="text-[10px] text-stone-500">{h.label}</p>
                        <p className="text-xs font-extrabold text-stone-900">{h.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Verified Skills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Verified Skill Badges</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_CANDIDATES[0].skills.map((skill, i) => (
                      <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: AI Tools */}
              <div className="lg:col-span-5 space-y-4">

                <div className="bg-stone-950 text-amber-400 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>AI INTERVIEW PRACTICE</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Practice AI-powered technical and behavioral interviews. Get instant feedback on confidence, communication, and technical depth.
                  </p>
                  <button
                    onClick={() => onOpenAuth('login', 'candidate')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-extrabold hover:bg-amber-600 transition-colors"
                  >
                    Start AI Interview Practice
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>AI Resume & Portfolio Builder</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Generate an ATS-optimized resume, cover letter, and dynamic portfolio website in minutes.
                  </p>
                  <button
                    onClick={() => onOpenAuth('login', 'candidate')}
                    className="w-full py-2.5 rounded-xl border border-amber-400 text-amber-800 text-xs font-extrabold hover:bg-amber-50 transition-colors"
                  >
                    Build My Portfolio
                  </button>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Career Roadmap & Guidance</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    AI identifies your skill gaps and recommends certifications, courses, and salary benchmarks.
                  </p>
                  <button
                    onClick={() => onOpenAuth('login', 'candidate')}
                    className="w-full py-2.5 rounded-xl border border-amber-400 text-amber-800 text-xs font-extrabold hover:bg-amber-100 transition-colors"
                  >
                    View My Career Path
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};

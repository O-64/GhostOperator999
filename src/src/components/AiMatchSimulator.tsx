'use client';

import React, { useState } from 'react';
import { MOCK_CANDIDATES } from '../data/mockData';
import { Sparkles, Sliders, AlertCircle, RefreshCw, Bot, ArrowRight, UserCheck, Trophy, Brain, Target } from 'lucide-react';

const roleOptions = [
  {
    id: 'ai_engineer',
    title: 'AI / ML Engineer',
    icon: <Brain className="w-4 h-4" />,
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'Data Pipelines'],
    targetMatch: 98,
    description: 'Seeking candidates with strong ML fundamentals and hands-on project experience.',
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    icon: <Target className="w-4 h-4" />,
    skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'GraphQL'],
    targetMatch: 95,
    description: 'Looking for end-to-end product builders with modern web stack experience.',
  },
  {
    id: 'data_lead',
    title: 'Data Engineer / Analyst',
    icon: <Trophy className="w-4 h-4" />,
    skills: ['SQL', 'Data Warehousing', 'ETL Pipelines', 'Analytics'],
    targetMatch: 91,
    description: 'Need candidates with strong data modeling and business intelligence skills.',
  },
];

const analysisSteps = [
  'Scanning GitHub contributions & project history...',
  'Evaluating hackathon performance & innovation scores...',
  'Running AI skill verification across all dimensions...',
  'Calculating candidate match percentages...',
];

export const AiMatchSimulator: React.FC = () => {
  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number>(0);
  const [minScore, setMinScore] = useState<number>(85);
  const [includeHackathon, setIncludeHackathon] = useState<boolean>(true);
  const [includeVerifiedSkills, setIncludeVerifiedSkills] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [stepLog, setStepLog] = useState<string | null>(null);

  const selectedRole = roleOptions[selectedRoleIdx];

  const handleRunMatch = () => {
    setIsCalculating(true);
    analysisSteps.forEach((step, i) => {
      setTimeout(() => setStepLog(step), i * 450);
    });
    setTimeout(() => {
      setIsCalculating(false);
      setStepLog(null);
    }, analysisSteps.length * 450 + 300);
  };

  return (
    <section id="simulator" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-50 relative overflow-hidden">

      <div className="absolute top-1/2 left-0 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12">

        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            AI Talent Matching &{' '}
            <span className="text-gold-gradient">Automated Candidate Analysis</span>
          </h2>
          <p className="text-base text-stone-600">
            See how our AI evaluates real candidates based on verified skills, hackathon performance, GitHub activity, and project quality — not just resumes.
          </p>
        </div>

        {/* Main Simulator Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border-2 border-amber-300/80 shadow-2xl space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6 text-left border-b lg:border-b-0 lg:border-r border-amber-200/80 pb-6 lg:pb-0 lg:pr-8">

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-3">
                  1. Select Job Role to Match
                </label>
                <div className="space-y-2">
                  {roleOptions.map((role, idx) => (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRoleIdx(idx); handleRunMatch(); }}
                      className={`w-full p-3 rounded-2xl text-left border text-xs font-extrabold transition-all flex items-center justify-between gap-2 ${
                        selectedRoleIdx === idx
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md'
                          : 'bg-white text-stone-700 hover:bg-amber-100/60 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {role.icon}
                        <span>{role.title}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{role.targetMatch}% Best Match</span>
                    </button>
                  ))}
                </div>
                {selectedRole && (
                  <p className="mt-2 text-[11px] text-stone-500 leading-snug">{selectedRole.description}</p>
                )}
              </div>

              {/* Minimum Score Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                  <span>2. Minimum AI Match Score</span>
                  <span className="font-mono text-amber-700 font-extrabold">{minScore}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-amber-600 bg-stone-200 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>60% (Wider search)</span>
                  <span>98% (Top talent only)</span>
                </div>
              </div>

              {/* Analysis Toggles */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                  3. AI Analysis Parameters
                </label>

                <div
                  onClick={() => setIncludeHackathon(!includeHackathon)}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-100/80 border border-stone-200 cursor-pointer hover:bg-stone-200/60"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900">Include Hackathon Performance</p>
                    <p className="text-[10px] text-stone-500">Factor in competition wins & project scores</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeHackathon}
                    onChange={() => {}}
                    className="accent-amber-600 w-4 h-4"
                  />
                </div>

                <div
                  onClick={() => setIncludeVerifiedSkills(!includeVerifiedSkills)}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-100/80 border border-stone-200 cursor-pointer hover:bg-stone-200/60"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900">Include Verified Skill Badges</p>
                    <p className="text-[10px] text-stone-500">Only show candidates with AI-verified skills</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeVerifiedSkills}
                    onChange={() => {}}
                    className="accent-amber-600 w-4 h-4"
                  />
                </div>
              </div>

              <button
                onClick={handleRunMatch}
                disabled={isCalculating}
                className="w-full py-3.5 rounded-2xl bg-stone-950 text-amber-400 text-xs font-extrabold hover:bg-stone-900 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                <span>{isCalculating ? 'Running AI Analysis...' : 'Run AI Candidate Match'}</span>
              </button>
            </div>

            {/* Right Results Column */}
            <div className="lg:col-span-7 space-y-4">

              <div className="flex items-center justify-between text-left">
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900">
                    Matched Candidates — {selectedRole.title}
                  </h3>
                  <p className="text-xs text-stone-500">Showing candidates with AI match score ≥ {minScore}%</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  AI Analyzed
                </span>
              </div>

              {/* Step log */}
              {isCalculating && (
                <div className="p-4 rounded-2xl bg-stone-950 text-amber-400 text-xs font-mono flex items-center gap-3 animate-pulse text-left">
                  <Bot className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{stepLog}</span>
                </div>
              )}

              {/* Candidate Cards */}
              <div className="space-y-4">
                {MOCK_CANDIDATES.filter(c => c.matchScore >= minScore).map((cand) => (
                  <div
                    key={cand.id}
                    className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow text-left space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={cand.avatar} className="w-12 h-12 rounded-xl object-cover border border-amber-300" />
                        <div>
                          <h4 className="text-sm font-extrabold text-stone-900">{cand.name}</h4>
                          <p className="text-xs text-stone-500">{cand.role}</p>
                          <p className="text-[11px] text-stone-400">{cand.experience}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-amber-700 font-mono">{cand.matchScore}%</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {cand.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                      <strong className="text-stone-800">AI Insight:</strong> {cand.aiSummary}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            selectedRole.skills.includes(skill)
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {skill} {selectedRole.skills.includes(skill) && '✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {MOCK_CANDIDATES.filter(c => c.matchScore >= minScore).length === 0 && (
                  <div className="p-8 rounded-2xl bg-amber-50 text-center space-y-2 border border-amber-200">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-sm font-bold text-stone-800">No candidates meet the {minScore}% threshold</p>
                    <p className="text-xs text-stone-500">Lower the match score slider to explore more candidates</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

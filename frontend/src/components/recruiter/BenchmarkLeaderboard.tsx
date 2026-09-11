'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { Sparkles, Trophy, Award, CheckCircle, AlertTriangle, Briefcase, Zap, Star, ChevronRight, Play } from 'lucide-react';

export default function BenchmarkLeaderboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('job_ai_01');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const data = await api.runBenchmarkDemo();
      setBenchmarkData(data);
      if (data?.benchmarkJobs?.length > 0 && !selectedJobId) {
        setSelectedJobId(data.benchmarkJobs[0].id);
      }
    } catch (err) {
      console.error('Failed to run benchmark:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run initial benchmark on mount
    handleRunBenchmark();
  }, []);

  const currentJobData = benchmarkData?.resultsByJob?.[selectedJobId];
  const rankings = currentJobData?.rankings || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Official Problem Statement Demonstration (PS03)
            </div>
            <h2 className="text-2xl font-black tracking-tight">Multi-Agent Candidate Ranking (10 Resumes × 3 Jobs)</h2>
            <p className="text-indigo-200/80 text-sm mt-1 max-w-2xl">
              Autonomous orchestration across <strong>Resume Agent</strong>, <strong>Job Agent</strong>, <strong>Matching Agent</strong>, 
              <strong>Skill Gap Agent</strong>, and <strong>Recruiter Agent</strong> producing instant explainable compatibility matrices.
            </p>
          </div>
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agents Evaluating 10 Resumes...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Re-Run Multi-Agent Ranking
              </>
            )}
          </button>
        </div>

        {/* Job Selection Tabs */}
        {benchmarkData?.benchmarkJobs && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-indigo-800/50">
            {benchmarkData.benchmarkJobs.map((j: any) => (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  selectedJobId === j.id
                    ? 'bg-white text-indigo-950 shadow-md scale-105'
                    : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-900/90 border border-indigo-700/40'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{j.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {j.company}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Target Job Info Card */}
      {currentJobData?.job && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black text-indigo-600 uppercase tracking-wide">Target Role Specification</div>
            <h3 className="text-lg font-black text-slate-900">{currentJobData.job.title} — <span className="text-slate-500">{currentJobData.job.company}</span></h3>
            <p className="text-slate-600 text-xs mt-1">{currentJobData.job.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-slate-500">Mandatory Skills:</span>
              {currentJobData.job.required_skills.map((s: string) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shrink-0">
            <div className="text-2xl font-black text-indigo-600">10 / 10</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Resumes Ranked</div>
          </div>
        </div>
      )}

      {/* Rankings Leaderboard */}
      <div className="space-y-3">
        {rankings.map((c: any) => {
          const isTop3 = c.rank <= 3;
          const isExpanded = expandedCandidateId === c.candidateId;

          return (
            <div
              key={c.candidateId}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                c.rank === 1
                  ? 'border-amber-300 shadow-md ring-1 ring-amber-200/50'
                  : c.rank === 2
                  ? 'border-slate-300 shadow-sm'
                  : c.rank === 3
                  ? 'border-amber-700/20 shadow-sm'
                  : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div
                onClick={() => setExpandedCandidateId(isExpanded ? null : c.candidateId)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                {/* Left: Rank & Candidate Details */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl font-black flex items-center justify-center text-sm shrink-0 shadow-sm ${
                      c.rank === 1
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                        : c.rank === 2
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                        : c.rank === 3
                        ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    #{c.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{c.candidateName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          c.verdict === 'Strong Fit'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : c.verdict === 'Good Fit'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {c.verdict}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{c.title}</span>
                      <span>•</span>
                      <span>{c.college}</span>
                      <span>•</span>
                      <span className="capitalize">{c.experienceType}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Scores & Multi-Criteria Bar */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  {/* Multi-Dimensional Metrics */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                    <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 font-bold">Skills</div>
                      <div className="font-black text-slate-800">{c.skillMatch}%</div>
                    </div>
                    <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 font-bold">Exp</div>
                      <div className="font-black text-slate-800">{c.experienceMatch}%</div>
                    </div>
                    <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 font-bold">Projects</div>
                      <div className="font-black text-slate-800">{c.projectRelevance}%</div>
                    </div>
                    <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 font-bold">Culture</div>
                      <div className="font-black text-slate-800">{c.culturalFit}%</div>
                    </div>
                    <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 font-bold">Bonus</div>
                      <div className="font-black text-purple-700">+{c.hackathonBonus}%</div>
                    </div>
                  </div>

                  {/* Overall Compatibility Circular Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">Match Score</div>
                      <div className="text-xl font-black text-indigo-600">{c.overallScore}%</div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Multi-Agent Deep Evaluation */}
              {isExpanded && (
                <div className="p-5 bg-gradient-to-b from-slate-50/80 to-white border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths & Verified Skills */}
                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Differentiators & Strengths
                      </div>
                      <ul className="text-xs text-slate-700 space-y-1.5">
                        {c.strengths?.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Matched Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {c.matchedSkills?.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skill Gaps & Missing Competencies */}
                    <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-wide mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Skill Gaps & Focus Areas
                      </div>
                      <ul className="text-xs text-slate-700 space-y-1.5">
                        {c.gaps?.map((g: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                      {c.missingSkills?.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Missing Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {c.missingSkills.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recruiter Agent Executive Brief */}
                  <div className="p-4 bg-indigo-950 text-white rounded-xl shadow-inner">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" /> Recruiter Agent Brief & Hiring Recommendation
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-800 text-amber-300 text-xs font-black">
                        {c.hiringRecommendation}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed font-sans">
                      {c.executiveSummary || c.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

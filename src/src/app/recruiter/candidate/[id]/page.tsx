'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import {
  computeMatchScore, getAvatarColor
} from '../../../../lib/candidateStore';
import * as api from '../../../../lib/api';
import {
  CandidateUser, RecruiterUser, MatchResult, PipelineStage, Application, JobPosting
} from '../../../../types';
import dynamic from 'next/dynamic';
import OutreachModal from '../../../../components/recruiter/OutreachModal';

import {
  ArrowLeft, Sparkles, CheckCircle, MapPin, GraduationCap, ExternalLink,
  Code2, Award, Users, Star, GitBranch, FileText, Zap, Bot,
  Mail, Calendar, TrendingUp, Shield, Eye, ChevronDown, ChevronRight,
  LogOut, Building2, Phone, Briefcase, Clock, Target, X
} from 'lucide-react';

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
    </svg>
  );
}

// Lazy load chart
const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PIPELINE_STAGES: PipelineStage[] = [
  'Discovered', 'Shortlisted', 'Contacted', 'Interview Scheduled', 'Offered', 'Hired'
];

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Discovered':         { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300'   },
  'Shortlisted':        { bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-300'  },
  'Contacted':          { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300'    },
  'Interview Scheduled':{ bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300'   },
  'Offered':            { bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-300'  },
  'Hired':              { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Rejected':           { bg: 'bg-red-100',     text: 'text-red-600',     border: 'border-red-300'     },
};

function SkillBar({ skill, level }: { skill: string; level: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-slate-700">{skill}</span>
        <span className="font-bold text-indigo-600">{level}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RecruiterCandidateProfile() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  const { user, isLoading, logout } = useAuth();

  const [candidate, setCandidate] = useState<CandidateUser | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [postedJobs, setPostedJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showOutreach, setShowOutreach] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [toast, setToast] = useState('');
  const [viewNotified, setViewNotified] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'skills' | 'experience' | 'ai'>('overview');
  const [showStageMenu, setShowStageMenu] = useState(false);

  // Load data
  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'recruiter') {
      router.push('/auth/recruiter');
      return;
    }

    const recruiter = user as RecruiterUser;

    const load = async () => {
      try {
        const c = await api.getCandidate(candidateId);
        setCandidate(c);

        if (!viewNotified) {
          await api.addProfileView(candidateId, {
            recruiterId: recruiter.id,
            recruiterName: recruiter.name,
            company: recruiter.company,
          });
          setViewNotified(true);
        }

        const jobs = await api.listJobs(recruiter.id);
        const allJobs = jobs.length > 0 ? jobs : await api.listJobs();
        setPostedJobs(allJobs);
        const firstJob = allJobs[0];
        if (firstJob) {
          setSelectedJobId(firstJob.id);
          try {
            setMatchResult(await api.computeMatch(c.id, firstJob.skills));
          } catch {
            setMatchResult(computeMatchScore(c, firstJob.skills));
          }
        }

        const apps = await api.listApplications();
        const app = apps.find(a => a.candidateId === c.id);
        if (app) {
          setApplication(app);
          setCurrentStage(app.stage);
        }
      } catch {
        router.push('/recruiter/dashboard');
      }
    };

    load();
  }, [user, isLoading, router, candidateId, viewNotified]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleJobChange = async (jobId: string) => {
    setSelectedJobId(jobId);
    const job = postedJobs.find(j => j.id === jobId);
    if (job && candidate) {
      try {
        setMatchResult(await api.computeMatch(candidate.id, job.skills));
      } catch {
        setMatchResult(computeMatchScore(candidate, job.skills));
      }
    }
  };

  const handleAddToPipeline = async (stage: PipelineStage = 'Shortlisted') => {
    if (!user || !candidate) return;
    try {
      const app = await api.createApplication({
        candidateId: candidate.id,
        stage,
        jobId: selectedJobId || undefined,
        matchScore: matchResult?.overallScore,
      });
      setApplication(app);
      setCurrentStage(stage);
      showToast(`${candidate.name} added to ${stage}!`);
    } catch {
      showToast('Failed to add to pipeline');
    }
  };

  const handleMoveStage = async (stage: PipelineStage) => {
    if (!user || !candidate) return;
    setShowStageMenu(false);
    if (application) {
      try {
        await api.updateApplicationStage(application.id, stage);
        setCurrentStage(stage);
        showToast(`Moved to ${stage}!`);
      } catch {
        showToast('Failed to update stage');
      }
    } else {
      await handleAddToPipeline(stage);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading || !candidate || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const recruiter = user as RecruiterUser;
  const avatarColor = getAvatarColor(candidate.name);
  const selectedJob = postedJobs.find(j => j.id === selectedJobId);

  const skillLevelsToShow = candidate.skillLevels && candidate.skillLevels.length > 0
    ? candidate.skillLevels
    : candidate.skills.slice(0, 8).map((s, i) => ({
        skill: s,
        level: Math.max(40, 95 - i * 8 + (candidate.score || 0) % 10)
      }));

  const radarData = matchResult ? [
    { subject: 'Skills',      A: matchResult.skillMatch,        fullMark: 100 },
    { subject: 'Experience',  A: matchResult.experienceMatch,   fullMark: 100 },
    { subject: 'Projects',    A: matchResult.projectRelevance,  fullMark: 100 },
    { subject: 'Culture',     A: matchResult.culturalFit,       fullMark: 100 },
    { subject: 'Hackathons',  A: matchResult.hackathonBonus,    fullMark: 100 },
  ] : [];

  const verdictColors: Record<string, string> = {
    'Strong Fit':  'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Good Fit':    'bg-blue-100 text-blue-700 border-blue-200',
    'Moderate Fit':'bg-amber-100 text-amber-700 border-amber-200',
    'Weak Fit':    'bg-red-100 text-red-600 border-red-200',
  };

  return (
    <div className="min-h-screen bg-[#f1f5fb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" /> <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Outreach Modal */}
      {showOutreach && (
        <OutreachModal
          candidate={candidate}
          recruiterName={recruiter.name}
          company={recruiter.company}
          jobTitle={selectedJob?.title}
          onClose={() => setShowOutreach(false)}
          onScheduled={(slot) => {
            showToast(`Interview scheduled for ${slot.date} at ${slot.time}!`);
            setShowOutreach(false);
            handleMoveStage('Interview Scheduled');
          }}
        />
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-indigo-950 border-b border-indigo-900 shadow-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold hidden sm:block">Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-indigo-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-white text-sm tracking-tight hidden sm:block">AI TALENT MATRIX</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/recruiter/profile')}
              className="p-2 bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors border border-indigo-800"
              title="Company Profile"
            >
              <Building2 className="w-4 h-4 text-indigo-300" />
            </button>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="p-2 bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors border border-indigo-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ─── Hero Section ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div
            className="h-28 relative"
            style={{ background: `linear-gradient(135deg, hsl(250,70%,25%) 0%, hsl(280,60%,30%) 100%)` }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            {/* View notification badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30">
              <Eye className="w-3 h-3" /> Profile Viewed — Candidate Notified
            </div>
          </div>

          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-black shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(candidate.name)}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black text-slate-900">{candidate.name}</h1>
                    {candidate.verifiedBadge && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold">
                      #{candidate.rank || '–'} Global Rank
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{candidate.id}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    {candidate.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
                    )}
                    {candidate.college && (
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{candidate.college}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="font-bold text-amber-600">{candidate.score} pts</span>
                    </span>
                    <span className="capitalize px-2 py-0.5 bg-slate-100 rounded-full font-semibold">
                      {candidate.experienceType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:pb-1">
                <button
                  onClick={() => setShowOutreach(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200"
                >
                  <Mail className="w-4 h-4" /> Contact & Schedule
                </button>

                {/* Pipeline stage button */}
                <div className="relative">
                  <button
                    onClick={() => currentStage ? setShowStageMenu(s => !s) : handleAddToPipeline()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      currentStage
                        ? `${STAGE_COLORS[currentStage]?.bg} ${STAGE_COLORS[currentStage]?.text} ${STAGE_COLORS[currentStage]?.border} border`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    {currentStage || 'Add to Pipeline'}
                    {currentStage && <ChevronDown className="w-3 h-3 ml-1" />}
                  </button>
                  {showStageMenu && (
                    <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-48">
                      {PIPELINE_STAGES.map(stage => (
                        <button
                          key={stage}
                          onClick={() => handleMoveStage(stage)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${
                            currentStage === stage ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => handleMoveStage('Rejected')}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills chips */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {candidate.skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-semibold">
                  {s}
                </span>
              ))}
            </div>

            {/* About */}
            {candidate.about && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {candidate.about}
              </p>
            )}
          </div>
        </div>

        {/* ─── Job Match Selector + AI Score ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Match Against Job
            </h3>
            <div className="space-y-2">
              {postedJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => handleJobChange(job.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    selectedJobId === job.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold">{job.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{job.location} · {job.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Match Score */}
          {matchResult && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" /> AI Match Analysis
                </h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${verdictColors[matchResult.verdict] || 'bg-slate-100 text-slate-600'}`}>
                  {matchResult.verdict}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Score meters */}
                <div className="space-y-3">
                  {[
                    { label: 'Overall Match', value: matchResult.overallScore, color: 'from-indigo-500 to-purple-500' },
                    { label: 'Skill Match',    value: matchResult.skillMatch,    color: 'from-blue-500 to-indigo-500' },
                    { label: 'Experience',     value: matchResult.experienceMatch, color: 'from-amber-500 to-orange-500' },
                    { label: 'Project Relevance', value: matchResult.projectRelevance, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Cultural Fit',   value: matchResult.culturalFit,   color: 'from-pink-500 to-rose-500' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">{m.label}</span>
                        <span className="font-black text-slate-900">{m.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Gaps */}
                <div className="space-y-4">
                  {matchResult.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-emerald-700 uppercase mb-2">✓ Strengths</h4>
                      <ul className="space-y-1">
                        {matchResult.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {matchResult.gaps.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-red-600 uppercase mb-2">⚠ Gaps</h4>
                      <ul className="space-y-1">
                        {matchResult.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* AI Summary */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-700 uppercase">AI Summary</span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">{matchResult.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Section Tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['overview', 'skills', 'experience', 'ai'] as const).map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeSection === sec
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {sec === 'overview' && '📄 Overview'}
              {sec === 'skills' && '⚡ Skills & Analysis'}
              {sec === 'experience' && '🎓 Background'}
              {sec === 'ai' && '🤖 AI Insights'}
            </button>
          ))}
        </div>

        {/* ─── SECTION: Overview ────────────────────────────────────────────── */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stats */}
            <div className="space-y-5">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 text-sm mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: <Users className="w-4 h-4" />, label: 'Experience', value: candidate.experienceType },
                    { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: candidate.location || 'Not specified' },
                    { icon: <GraduationCap className="w-4 h-4" />, label: 'College', value: candidate.college || 'Not specified' },
                    { icon: <Building2 className="w-4 h-4" />, label: 'University', value: candidate.university || 'Not specified' },
                    ...(candidate.currentCompany ? [{ icon: <Briefcase className="w-4 h-4" />, label: 'Company', value: candidate.currentCompany }] : []),
                    ...(candidate.post ? [{ icon: <Target className="w-4 h-4" />, label: 'Role', value: candidate.post }] : []),
                    { icon: <TrendingUp className="w-4 h-4" />, label: 'Profile', value: `${candidate.profileCompletion}% Complete` },
                    { icon: <Clock className="w-4 h-4" />, label: 'Joined', value: new Date(candidate.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">{item.label}</div>
                        <div className="font-semibold text-slate-800 capitalize">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 text-sm mb-3">Social & Links</h3>
                <div className="space-y-2">
                  {candidate.githubUrl && (
                    <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                      <Code2 className="w-4 h-4" /> GitHub Profile
                      <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  )}
                  {candidate.linkedinUrl && (
                    <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                      <LinkedinIcon className="w-4 h-4" /> LinkedIn Profile
                      <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  )}
                  {candidate.leetcodeUrl && (
                    <a href={candidate.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
                      <Code2 className="w-4 h-4" /> LeetCode Profile
                      <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  )}
                  {!candidate.githubUrl && !candidate.linkedinUrl && !candidate.leetcodeUrl && (
                    <p className="text-xs text-slate-400 text-center py-2">No social links added</p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 text-sm mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-xs truncate">{candidate.email}</span>
                  </div>
                  {candidate.mobile && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-xs">{candidate.mobile}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowOutreach(true)}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            </div>

            {/* Right: Resume + Achievements */}
            <div className="lg:col-span-2 space-y-5">
              {/* Resume */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-500" /> Resume
                </h3>
                {candidate.resumeName ? (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{candidate.resumeName}</p>
                        <p className="text-xs text-slate-500">Resume document</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold">
                      Uploaded ✓
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No resume uploaded by candidate</p>
                  </div>
                )}
              </div>

              {/* Project PPTs */}
              {candidate.projectPPTs && candidate.projectPPTs.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-amber-500" /> Project Presentations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {candidate.projectPPTs.map((ppt, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{ppt}</p>
                          <p className="text-[10px] text-slate-500">Project {i + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hackathons */}
              {candidate.hackathons && candidate.hackathons.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-purple-500" /> Hackathons
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {candidate.hackathons.length} events
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {candidate.hackathons.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Award className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{h.name}</p>
                          <p className="text-xs text-slate-500">{h.role}{h.year ? ` · ${h.year}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {candidate.certificates && candidate.certificates.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-emerald-500" /> Certificates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.certificates.map((cert, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{cert.name}</p>
                          <p className="text-xs text-slate-500">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION: Skills ──────────────────────────────────────────────── */}
        {activeSection === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Bars */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-5">
                <Zap className="w-5 h-5 text-indigo-500" /> Skill Proficiency
              </h3>
              <div className="space-y-4">
                {skillLevelsToShow.map((sl) => (
                  <SkillBar key={sl.skill} skill={sl.skill} level={sl.level} />
                ))}
              </div>
            </div>

            {/* AI Radar Chart */}
            {matchResult && radarData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-purple-500" /> AI Match Radar
                </h3>
                <p className="text-xs text-slate-500 mb-4">vs. <span className="font-bold text-slate-700">{selectedJob?.title || 'Selected Job'}</span></p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <Radar name="Match" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-center">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${verdictColors[matchResult.verdict] || ''}`}>
                    {matchResult.overallScore}% — {matchResult.verdict}
                  </span>
                </div>
              </div>
            )}

            {/* Skill chips categorized */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-black text-slate-900 mb-4">All Skills ({candidate.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(s => {
                  const isRequired = selectedJob?.skills.some(rs => rs.toLowerCase() === s.toLowerCase());
                  return (
                    <span
                      key={s}
                      className={`text-sm px-3 py-1.5 rounded-full font-semibold border ${
                        isRequired
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                      {isRequired && <span className="ml-1 text-[10px] opacity-80">✓ Required</span>}
                    </span>
                  );
                })}
              </div>
              {selectedJob && (
                <p className="text-xs text-slate-400 mt-3">
                  <span className="inline-block w-3 h-3 bg-indigo-600 rounded-full mr-1.5" />
                  Highlighted skills match <span className="font-bold">{selectedJob.title}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION: Experience ──────────────────────────────────────────── */}
        {activeSection === 'experience' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education & Background */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-500" /> Education
              </h3>
              {candidate.college || candidate.university ? (
                <div className="space-y-3">
                  {candidate.college && (
                    <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{candidate.college}</p>
                        <p className="text-xs text-slate-500">College</p>
                      </div>
                    </div>
                  )}
                  {candidate.university && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{candidate.university}</p>
                        <p className="text-xs text-slate-500">University</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No education details provided</p>
              )}

              {/* Work Experience */}
              {(candidate.currentCompany || candidate.previousCompany) && (
                <div>
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-amber-500" /> Work History
                  </h4>
                  <div className="space-y-3">
                    {candidate.currentCompany && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <Briefcase className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{candidate.currentCompany}</p>
                          <p className="text-xs text-slate-500">Current Employer · {candidate.post || 'Engineer'}</p>
                        </div>
                        <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Current</span>
                      </div>
                    )}
                    {candidate.previousCompany && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{candidate.previousCompany}</p>
                          <p className="text-xs text-slate-500">Previous Employer</p>
                          {candidate.reasonForChange && (
                            <p className="text-xs text-slate-400 mt-1 italic">Reason for change: {candidate.reasonForChange}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline / Pipeline status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-purple-500" /> Hiring Pipeline Status
              </h3>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, i) => {
                  const stageIndex = currentStage ? PIPELINE_STAGES.indexOf(currentStage) : -1;
                  const isCompleted = stageIndex > i;
                  const isCurrent = currentStage === stage;
                  const isPending = stageIndex < i;

                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                        isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                        isCompleted ? 'bg-emerald-500 text-white' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {stage}
                        </span>
                        {isCurrent && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold">Current</span>}
                      </div>
                      {!isCurrent && !isCompleted && (
                        <button
                          onClick={() => handleMoveStage(stage)}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
                        >
                          Move →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {!currentStage && (
                <button
                  onClick={() => handleAddToPipeline('Shortlisted')}
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Add to Pipeline
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION: AI Insights ─────────────────────────────────────────── */}
        {activeSection === 'ai' && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Platform Score', value: candidate.score, icon: '🏆', color: 'amber' },
                { label: 'Profile Complete', value: `${candidate.profileCompletion}%`, icon: '📊', color: 'indigo' },
                { label: 'Global Rank', value: `#${candidate.rank || '–'}`, icon: '📈', color: 'purple' },
                { label: 'AI Match', value: matchResult ? `${matchResult.overallScore}%` : '–', icon: '🤖', color: 'emerald' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* AI Recommendations from candidate profile */}
            {candidate.recommendations && candidate.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-indigo-500" /> Candidate AI Recommendations
                  <span className="text-xs font-medium text-slate-400 ml-1">(Assigned by AI agent)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidate.recommendations.slice(0, 4).map((rec, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${
                      rec.type === 'job' || rec.type === 'internship'
                        ? 'bg-indigo-50 border-indigo-200'
                        : rec.type === 'course'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{rec.type === 'job' ? '💼' : rec.type === 'course' ? '📚' : rec.type === 'internship' ? '🎯' : '💡'}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{rec.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{rec.description}</p>
                          {rec.discount && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">{rec.discount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile View History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-blue-500" /> Profile View Activity
              </h3>
              {candidate.profileViews && candidate.profileViews.length > 0 ? (
                <div className="space-y-2">
                  {candidate.profileViews.slice(-5).reverse().map((view, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{view.recruiterName} <span className="font-normal text-slate-500">from</span> {view.company}</p>
                        <p className="text-xs text-slate-400">{new Date(view.viewedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      {i === 0 && <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Latest</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No view history yet</p>
                </div>
              )}
            </div>

            {/* One-click verification */}
            <div className="bg-gradient-to-br from-indigo-950 to-purple-950 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg">AI Verification Status</h3>
                  <p className="text-indigo-300 text-sm mt-1">
                    {candidate.verifiedBadge
                      ? 'This candidate has been fully verified by AI agents — skills, GitHub activity, and certifications are authentic.'
                      : 'Verification pending. Candidate needs to complete AI analysis to earn the verified badge.'}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                      candidate.verifiedBadge ? 'bg-emerald-500 text-white' : 'bg-white/10 text-indigo-300'
                    }`}>
                      <Shield className="w-4 h-4" />
                      {candidate.verifiedBadge ? '✓ Verified' : '⏳ Pending'}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                      candidate.agentAnalysisDone ? 'bg-emerald-500 text-white' : 'bg-white/10 text-indigo-300'
                    }`}>
                      <Bot className="w-4 h-4" />
                      {candidate.agentAnalysisDone ? '✓ AI Analysis Done' : '⏳ Not Analyzed'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

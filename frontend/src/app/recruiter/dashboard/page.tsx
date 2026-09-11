'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { computeMatchScore } from '../../../lib/candidateStore';
import * as api from '../../../lib/api';
import { CandidateUser, RecruiterUser, JobPosting, Application, MatchResult, PipelineStage } from '../../../types';
import dynamic from 'next/dynamic';

// Components
import CandidateCard from '../../../components/recruiter/CandidateCard';
import CompareDrawer from '../../../components/recruiter/CompareDrawer';
import AICopilot from '../../../components/recruiter/AICopilot';
import PipelineBoard from '../../../components/recruiter/PipelineBoard';
import BenchmarkLeaderboard from '../../../components/recruiter/BenchmarkLeaderboard';
import PPTAnalyzerView from '../../../components/recruiter/PPTAnalyzerView';
import FraudTrustView from '../../../components/recruiter/FraudTrustView';
import HackathonPipelineView from '../../../components/recruiter/HackathonPipelineView';

// Lucide icons
import {
  Sparkles, LogOut, Briefcase, Users, Search, MapPin, DollarSign,
  Plus, X, ChevronDown, Filter, SlidersHorizontal, LayoutDashboard,
  Bot, GitMerge, Zap, Building2, CheckCircle, ArrowUpDown, Scale,
  TrendingUp, Clock, Award, Trophy, FileText, ShieldAlert
} from 'lucide-react';

// Lazy load chart to avoid SSR issues
const HiringFunnelChart = dynamic(() => import('../../../components/recruiter/HiringFunnelChart'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'benchmark' | 'discovery' | 'shortlisting' | 'ppt' | 'fraud' | 'hackathon' | 'pipeline' | 'copilot';
type SortBy = 'rank' | 'score' | 'match' | 'newest';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'benchmark', label: '10 Resumes Benchmark', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
  { id: 'discovery', label: 'Discovery', icon: <Search className="w-4 h-4" /> },
  { id: 'shortlisting', label: 'AI Shortlisting', icon: <Zap className="w-4 h-4" /> },
  { id: 'ppt', label: 'PPT Intelligence', icon: <FileText className="w-4 h-4 text-purple-400" /> },
  { id: 'fraud', label: 'Fraud & Trust', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
  { id: 'hackathon', label: 'Hackathons', icon: <Award className="w-4 h-4 text-amber-300" /> },
  { id: 'pipeline', label: 'Pipeline / ATS', icon: <GitMerge className="w-4 h-4" /> },
  { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-4 h-4" /> },
];

const EXPERIENCE_OPTIONS = ['All', 'Fresher', 'Experienced'];
const LOCATION_OPTIONS = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Remote'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
    >
      {label}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Core data
  const [allCandidates, setAllCandidates] = useState<CandidateUser[]>([]);
  const [postedJobs, setPostedJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Discovery state
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('rank');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<CandidateUser[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareMatchResults, setCompareMatchResults] = useState<Record<string, MatchResult>>({});

  // Shortlisting state
  const [shortlistJobId, setShortlistJobId] = useState<string>('');
  const [aiMatchResults, setAiMatchResults] = useState<MatchResult[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Job posting state
  const [jobTitle, setJobTitle] = useState('');
  const [skillsReq, setSkillsReq] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState<'job' | 'internship'>('job');
  const [jobDesc, setJobDesc] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'recruiter') {
      router.push('/auth/recruiter');
      return;
    }

    const loadData = async () => {
      try {
        const [cands, jobs, apps] = await Promise.all([
          api.listCandidates({ sortBy: 'rank' }),
          api.listJobs(user.id),
          api.listApplications(),
        ]);
        setAllCandidates(cands);
        setPostedJobs(jobs.length > 0 ? jobs : await api.listJobs());
        setApplications(apps);
        setShortlistedIds(apps.filter(a => a.stage !== 'Rejected').map(a => a.candidateId));
      } catch {
        showToast('Could not load data — is the backend running?');
      }
    };

    loadData();
  }, [user, isLoading, router]);

  // ── Discovery filters ─────────────────────────────────────────────────────
  const filteredCandidates = useCallback(() => {
    let result = [...allCandidates];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q)) ||
        (c.college || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }

    if (skillFilter) {
      const sf = skillFilter.toLowerCase();
      result = result.filter(c => c.skills.some(s => s.toLowerCase().includes(sf)));
    }

    if (locationFilter !== 'All') {
      result = result.filter(c => (c.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (expFilter !== 'All') {
      result = result.filter(c => c.experienceType === expFilter.toLowerCase());
    }

    if (collegeFilter) {
      const cf = collegeFilter.toLowerCase();
      result = result.filter(c =>
        (c.college || '').toLowerCase().includes(cf) ||
        (c.university || '').toLowerCase().includes(cf)
      );
    }

    // Sort
    switch (sortBy) {
      case 'score': result.sort((a, b) => (b.score || 0) - (a.score || 0)); break;
      case 'rank': result.sort((a, b) => (a.rank || 999) - (b.rank || 999)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'match':
        if (shortlistJobId) {
          const job = postedJobs.find(j => j.id === shortlistJobId);
          if (job) {
            result = result.map(c => ({ c, mr: computeMatchScore(c, job.skills) }))
              .sort((a, b) => b.mr.overallScore - a.mr.overallScore)
              .map(x => x.c);
          }
        }
        break;
    }

    return result;
  }, [allCandidates, searchQuery, skillFilter, locationFilter, expFilter, collegeFilter, sortBy, shortlistJobId, postedJobs]);

  // ── Shortlisting ──────────────────────────────────────────────────────────
  const runAIShortlisting = async () => {
    const job = postedJobs.find(j => j.id === shortlistJobId);
    if (!job) return;
    setIsAnalyzing(true);
    setAiMatchResults([]);
    try {
      const results = await api.batchMatch({ jobId: job.id, limit: 20 });
      setAiMatchResults(results);
    } catch {
      showToast('AI shortlisting failed — check backend connection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Shortlist a candidate ─────────────────────────────────────────────────
  const handleShortlist = async (c: CandidateUser, matchScore?: number) => {
    if (!user) return;
    try {
      await api.createApplication({
        candidateId: c.id,
        stage: 'Shortlisted',
        jobId: shortlistJobId || undefined,
        matchScore,
      });
      const apps = await api.listApplications();
      setApplications(apps);
      setShortlistedIds(prev => [...new Set([...prev, c.id])]);
      showToast(`${c.name} added to pipeline!`);
    } catch {
      showToast('Failed to shortlist candidate');
    }
  };

  // ── Pipeline move ─────────────────────────────────────────────────────────
  const handleMoveStage = async (appId: string, stage: PipelineStage) => {
    try {
      await api.updateApplicationStage(appId, stage);
      const apps = await api.listApplications();
      setApplications(apps);
      showToast(`Moved to ${stage}!`);
    } catch {
      showToast('Failed to update pipeline stage');
    }
  };

  // ── Pipeline stage counts ─────────────────────────────────────────────────
  const stageCounts = (() => {
    const counts: Record<string, number> = {
      'Discovered': 0, 'Shortlisted': 0, 'Contacted': 0,
      'Interview Scheduled': 0, 'Offered': 0, 'Hired': 0
    };
    applications.forEach(a => { if (counts[a.stage] !== undefined) counts[a.stage]++; });
    return counts as any;
  })();

  // ── View candidate ────────────────────────────────────────────────────────
  const handleViewCandidate = (c: CandidateUser) => {
    router.push(`/recruiter/candidate/${c.id}`);
  };

  // ── Compare ───────────────────────────────────────────────────────────────
  const handleSelectForCompare = (c: CandidateUser) => {
    setSelectedForCompare(prev => {
      if (prev.find(p => p.id === c.id)) return prev.filter(p => p.id !== c.id);
      if (prev.length >= 3) { showToast('Max 3 candidates for comparison'); return prev; }
      return [...prev, c];
    });
  };

  const handleOpenCompare = async () => {
    const job = postedJobs.find(j => j.id === shortlistJobId) || postedJobs[0];
    const skills = job ? job.skills : [];
    const results: Record<string, MatchResult> = {};
    try {
      await Promise.all(
        selectedForCompare.map(async c => {
          results[c.id] = await api.computeMatch(c.id, skills);
        })
      );
    } catch {
      selectedForCompare.forEach(c => {
        results[c.id] = computeMatchScore(c, skills);
      });
    }
    setCompareMatchResults(results);
    setShowCompare(true);
  };

  // ── Post Job ──────────────────────────────────────────────────────────────
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !skillsReq || !user) return;
    try {
      const newJob = await api.createJob({
        title: jobTitle,
        company: (user as RecruiterUser).company,
        skills: skillsReq.split(',').map(s => s.trim()).filter(Boolean),
        location,
        salary,
        type: jobType,
        description: jobDesc,
      });
      setPostedJobs(prev => [newJob, ...prev]);
      showToast('Job posted successfully!');
      setJobTitle(''); setSkillsReq(''); setLocation(''); setSalary(''); setJobDesc('');
      setShowJobForm(false);
    } catch {
      showToast('Failed to post job');
    }
  };

  if (isLoading || !user || user.role !== 'recruiter') return null;
  const recruiter = user as RecruiterUser;
  const candidates = filteredCandidates();
  const shortlistJob = postedJobs.find(j => j.id === shortlistJobId);

  return (
    <div className="min-h-screen bg-[#f1f5fb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" /> <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Compare Drawer */}
      {showCompare && selectedForCompare.length >= 2 && (
        <CompareDrawer
          candidates={selectedForCompare}
          matchResults={compareMatchResults}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-indigo-950 border-b border-indigo-900 shadow-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight">AI TALENT MATRIX</div>
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Recruiter Portal</div>
            </div>
          </div>

          {/* Tab Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900'
                    : 'text-indigo-300 hover:text-white hover:bg-indigo-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-white">{recruiter.name}</div>
              <div className="text-[10px] text-indigo-400 font-medium">{recruiter.company}</div>
            </div>
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

        {/* Mobile tab bar */}
        <div className="lg:hidden flex overflow-x-auto border-t border-indigo-900 bg-indigo-950">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-indigo-300 border-b-2 border-indigo-400' : 'text-indigo-600'
              }`}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* ─── TAB: DASHBOARD ───────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Welcome back, {recruiter.name.split(' ')[0]}! 👋</h1>
                <p className="text-slate-500 text-sm">{recruiter.company} • {recruiter.title}</p>
              </div>
              <button
                onClick={() => setShowJobForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Candidates', value: allCandidates.length, icon: <Users className="w-6 h-6" />, color: 'indigo', sub: 'In database' },
                { label: 'Active Jobs', value: postedJobs.length, icon: <Briefcase className="w-6 h-6" />, color: 'amber', sub: 'Posted by you' },
                { label: 'In Pipeline', value: applications.length, icon: <GitMerge className="w-6 h-6" />, color: 'purple', sub: 'Across stages' },
                { label: 'Hired', value: stageCounts['Hired'] || 0, icon: <CheckCircle className="w-6 h-6" />, color: 'emerald', sub: 'Successfully placed' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-${kpi.color}-50 text-${kpi.color}-600`}>
                    {kpi.icon}
                  </div>
                  <div className="text-2xl font-black text-slate-900">{kpi.value}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{kpi.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Funnel Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" /> Hiring Pipeline Funnel
                  </h3>
                  <button onClick={() => setActiveTab('pipeline')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                    View Pipeline →
                  </button>
                </div>
                <HiringFunnelChart stageCounts={stageCounts} />
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Top Candidates
                </h3>
                <div className="space-y-3">
                  {allCandidates.slice(0, 5).map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => handleViewCandidate(c)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-xs font-black text-slate-400 w-5 shrink-0">#{i + 1}</span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: `hsl(${i * 50 + 220}, 70%, 55%)` }}
                      >
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                          {c.verifiedBadge && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{c.skills.slice(0, 2).join(', ')}</p>
                      </div>
                      <div className="text-xs font-black text-indigo-600 shrink-0">{c.score}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="w-full mt-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
                >
                  Browse All Candidates →
                </button>
              </div>
            </div>

            {/* Posted Jobs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" /> Your Posted Jobs
                </h3>
                <button onClick={() => setShowJobForm(true)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                  <Plus className="w-4 h-4" /> Add Job
                </button>
              </div>
              {postedJobs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No jobs posted yet. Click "Post New Job" to start.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {postedJobs.slice(0, 6).map(job => (
                    <div key={job.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          job.type === 'job' || job.type === 'Job' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                        }`}>{job.type}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                          <MapPin className="w-3 h-3" />{job.location}
                          {job.salary && <><span className="mx-1">•</span><DollarSign className="w-3 h-3" />{job.salary}</>}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: DISCOVERY ───────────────────────────────────────────────── */}
        {activeTab === 'discovery' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Candidate Discovery</h2>
                <p className="text-slate-500 text-sm">{candidates.length} candidates found</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={handleOpenCompare}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    <Scale className="w-4 h-4" /> Compare ({selectedForCompare.length})
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                  {(locationFilter !== 'All' || expFilter !== 'All' || skillFilter || collegeFilter) && (
                    <span className="w-2 h-2 bg-indigo-300 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Search + Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, college, ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortBy)}
                  className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white appearance-none font-bold text-slate-700"
                >
                  <option value="rank">Sort: Rank</option>
                  <option value="score">Sort: Score</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="match">Sort: Match %</option>
                </select>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Skill</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        value={skillFilter}
                        onChange={e => setSkillFilter(e.target.value)}
                        placeholder="e.g. React, Python"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">College / University</label>
                    <input
                      value={collegeFilter}
                      onChange={e => setCollegeFilter(e.target.value)}
                      placeholder="e.g. IIT, NIT, VIT"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCATION_OPTIONS.map(loc => (
                        <Chip key={loc} label={loc} active={locationFilter === loc} onClick={() => setLocationFilter(loc)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Experience</label>
                    <div className="flex gap-2">
                      {EXPERIENCE_OPTIONS.map(exp => (
                        <Chip key={exp} label={exp} active={expFilter === exp} onClick={() => setExpFilter(exp)} />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setSkillFilter(''); setLocationFilter('All'); setExpFilter('All'); setCollegeFilter(''); setSearchQuery(''); }}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Compare hint */}
            {selectedForCompare.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-sm">
                <Scale className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 font-semibold">
                  {selectedForCompare.length} candidate{selectedForCompare.length > 1 ? 's' : ''} selected for comparison.
                  {selectedForCompare.length < 2 && ' Select 1 more to compare.'}
                </span>
                {selectedForCompare.length >= 2 && (
                  <button onClick={handleOpenCompare} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold">Compare Now</button>
                )}
              </div>
            )}

            {/* Candidate Grid */}
            {candidates.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No candidates match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {candidates.map(c => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    onView={handleViewCandidate}
                    onShortlist={c => handleShortlist(c)}
                    isShortlisted={shortlistedIds.includes(c.id)}
                    isSelected={selectedForCompare.some(s => s.id === c.id)}
                    onSelect={handleSelectForCompare}
                    showCompare
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: AI SHORTLISTING ─────────────────────────────────────────── */}
        {activeTab === 'shortlisting' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">AI Shortlisting Engine</h2>
              <p className="text-slate-500 text-sm">Select a job → AI ranks all candidates by compatibility</p>
            </div>

            {/* Job Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-3">Select Job to Rank Against</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {postedJobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setShortlistJobId(job.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      shortlistJobId === job.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900">{job.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-semibold">{s}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={runAIShortlisting}
                disabled={!shortlistJobId || isAnalyzing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-200"
              >
                <Zap className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing all candidates...' : 'Run AI Shortlisting'}
              </button>
            </div>

            {/* Analyzing indicator */}
            {isAnalyzing && (
              <div className="bg-indigo-950 rounded-2xl p-6 text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="font-bold text-indigo-200">Running AI analysis on {allCandidates.length} candidates...</p>
                <div className="mt-3 w-64 mx-auto h-1.5 bg-indigo-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {/* AI Results */}
            {aiMatchResults.length > 0 && shortlistJob && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900">
                    AI Rankings for <span className="text-indigo-600">{shortlistJob.title}</span>
                  </h3>
                  <span className="text-xs text-slate-500">{aiMatchResults.length} candidates analyzed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {aiMatchResults.map(mr => {
                    const cand = allCandidates.find(c => c.id === mr.candidateId);
                    if (!cand) return null;
                    return (
                      <CandidateCard
                        key={cand.id}
                        candidate={cand}
                        matchResult={mr}
                        onView={handleViewCandidate}
                        onShortlist={c => handleShortlist(c, mr.overallScore)}
                        isShortlisted={shortlistedIds.includes(cand.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: PIPELINE ────────────────────────────────────────────────── */}
        {activeTab === 'pipeline' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Applicant Tracking System</h2>
                <p className="text-slate-500 text-sm">{applications.length} candidates across {(Object.values(stageCounts) as number[]).filter(v => v > 0).length} stages</p>
              </div>
              <button onClick={() => setActiveTab('shortlisting')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" /> Add Candidates
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <PipelineBoard
                applications={applications}
                candidates={allCandidates}
                onMoveStage={handleMoveStage}
                onViewCandidate={id => router.push(`/recruiter/candidate/${id}`)}
              />
            </div>
          </div>
        )}

        {/* ─── TAB: BENCHMARK (10 RESUMES X 3 JOBS) ────────────────────────── */}
        {activeTab === 'benchmark' && (
          <BenchmarkLeaderboard />
        )}

        {/* ─── TAB: PPT INTELLIGENCE ────────────────────────────────────────── */}
        {activeTab === 'ppt' && (
          <PPTAnalyzerView />
        )}

        {/* ─── TAB: FRAUD & TRUST AUDIT ─────────────────────────────────────── */}
        {activeTab === 'fraud' && (
          <FraudTrustView candidates={allCandidates} />
        )}

        {/* ─── TAB: HACKATHON PIPELINE ──────────────────────────────────────── */}
        {activeTab === 'hackathon' && (
          <HackathonPipelineView />
        )}

        {/* ─── TAB: COPILOT ─────────────────────────────────────────────────── */}
        {activeTab === 'copilot' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">AI Recruitment Copilot</h2>
              <p className="text-slate-500 text-sm">Natural language search powered by AI</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <AICopilot
                recruiter={recruiter}
                allCandidates={allCandidates}
                onViewCandidate={handleViewCandidate}
                onShortlist={c => handleShortlist(c)}
                shortlistedIds={shortlistedIds}
              />
            </div>
          </div>
        )}
      </main>

      {/* Post Job Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowJobForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <h3 className="font-black">Post a New Job</h3>
              <button onClick={() => setShowJobForm(false)} className="p-1.5 bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Job Title *</label>
                <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Required Skills (comma separated) *</label>
                <input required value={skillsReq} onChange={e => setSkillsReq(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
                  <select value={jobType} onChange={e => setJobType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="job">Full-time Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / Bangalore"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Salary / Stipend</label>
                <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="₹12–18 LPA or ₹30k/mo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="Brief job description..." />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-colors">
                Post Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

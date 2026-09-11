'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../lib/api';
import { CandidateUser } from '../../../types';
import { AgentWidget, AgentAnalysisOverlay, ProfileRing } from '../../../components/candidate';
import { AnalysisResult } from '../../../components/candidate/AgentAnalysisOverlay';
import { 
  Sparkles, Upload, FileText, CheckCircle, AlertTriangle, 
  ExternalLink, Plus, Trash2, Edit3, Save, ArrowLeft, Shield
} from 'lucide-react';

// Inline SVG components for brands not in this version of lucide-react
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();

  const [candidate, setCandidate] = useState<CandidateUser | null>(null);
  const [isEditing, setIsEditing] = useState(true); // Default to interactive/insertable
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [auditFeedback, setAuditFeedback] = useState<string[]>([]);

  // Drag & drop states
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isDraggingPPT, setIsDraggingPPT] = useState(false);
  const [isDraggingCert, setIsDraggingCert] = useState(false);

  // Form state
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [ppts, setPpts] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  const [certificates, setCertificates] = useState<{name: string, issuer: string, year: string, fileName?: string}[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({name: '', issuer: '', year: '', fileName: ''});

  const [hackathons, setHackathons] = useState<{name: string, role: string, year: string}[]>([]);
  const [showHackForm, setShowHackForm] = useState(false);
  const [hackForm, setHackForm] = useState({name: '', role: '', year: ''});

  const [about, setAbout] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [location, setLocation] = useState('');

  const [completionPercent, setCompletionPercent] = useState(0);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pptInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const applyCandidateToForm = (c: CandidateUser) => {
    setCandidate(c);
    setResumeName(c.resumeName || null);
    setPpts(c.projectPPTs || []);
    setSkills(c.skills || []);
    setGithubUrl(c.githubUrl || '');
    setLeetcodeUrl(c.leetcodeUrl || '');
    setLinkedinUrl(c.linkedinUrl || '');
    setCertificates((c.certificates || []).map(cert => ({ name: cert.name, issuer: cert.issuer, year: cert.year || '', fileName: cert.fileName || '' })));
    setHackathons((c.hackathons || []).map(h => ({ name: h.name, role: h.role, year: h.year || '' })));
    setAbout(c.about || '');
    setCollege(c.college || '');
    setUniversity(c.university || '');
    setLocation(c.location || '');
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== 'candidate') {
      router.push('/auth/candidate');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const fresh = await api.getCandidate(user.id);
        if (!cancelled) applyCandidateToForm(fresh);
      } catch {
        if (!cancelled) applyCandidateToForm(user as CandidateUser);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isLoading, router]);

  useEffect(() => {
    if (candidate) {
      let filled = 0;
      let total = 9;
      if (githubUrl) filled++;
      if (leetcodeUrl) filled++;
      if (linkedinUrl) filled++;
      if (skills.length > 0) filled++;
      if (resumeName) filled++;
      if (about) filled++;
      if (college || university) filled++;
      if (location) filled++;
      if (ppts.length > 0) filled++;
      setCompletionPercent(Math.min(100, Math.round((filled / total) * 100)));
    }
  }, [githubUrl, leetcodeUrl, linkedinUrl, skills, resumeName, about, college, university, location, ppts, candidate]);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-500 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Candidate Profile...</span>
        </div>
      </div>
    );
  }

  // Quick Demo Auto-Fill function for testing
  const handleAutoFillDemoData = () => {
    setGithubUrl('https://github.com/torvalds');
    setLeetcodeUrl('https://leetcode.com/tourist');
    setLinkedinUrl('https://linkedin.com/in/linustorvalds');
    setResumeName('Alex_Mercer_AI_Engineer_Resume.pdf');
    setPpts(['Distributed_AI_Agent_Architecture.pptx', 'Neural_Graph_Matching_System.pdf']);
    setSkills(['Python', 'TypeScript', 'React', 'PyTorch', 'System Design', 'Next.js', 'Go']);
    setCertificates([
      { name: 'AWS Certified AI Practitioner', issuer: 'Amazon Web Services', year: '2024', fileName: 'AWS_AI_Practitioner.pdf' },
      { name: 'Deep Learning Specialization', issuer: 'Coursera / DeepLearning.AI', year: '2023', fileName: 'DeepLearning_Cert.jpeg' }
    ]);
    setHackathons([
      { name: 'National AI Hackathon 2024', role: 'Team Lead / ML Engineer', year: '2024' }
    ]);
    setAbout('Senior Full-Stack AI Engineer with 4+ years of experience designing high-throughput distributed microservices, neural network pipelines, and reactive web applications.');
    setCollege('IIT Bombay');
    setUniversity('Mumbai University');
    setLocation('Mumbai, Maharashtra, India');
    setSuccessMsg('⚡ Demo Profile Details Populated Successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdate = async () => {
    if (!candidate) return;
    try {
      const updated = await api.updateCandidate(candidate.id, {
        resumeName: resumeName || undefined,
        projectPPTs: ppts,
        skills,
        githubUrl,
        leetcodeUrl,
        linkedinUrl,
        certificates,
        hackathons,
        about,
        college,
        university,
        location,
      });
      applyCandidateToForm(updated);
      await refreshUser();
      setSuccessMsg('Profile details saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Failed to save profile. Is the backend running?');
      setTimeout(() => setErrorMsg(''), 4500);
    }
  };

  const handleAnalyse = () => {
    if (!githubUrl || !leetcodeUrl) {
      setErrorMsg('⚠️ GitHub and LeetCode accounts are mandatory for AI analysis.');
      setTimeout(() => setErrorMsg(''), 4500);
      return;
    }
    setShowAnalysisOverlay(true);
  };

  const handleAnalysisComplete = async (results: AnalysisResult) => {
    if (!candidate) return;
    const isFull = completionPercent >= 80;
    try {
      const updated = await api.updateCandidate(candidate.id, {
        agentAnalysisDone: true,
        skillLevels: results.skillLevels,
        recommendations: results.recommendations as CandidateUser['recommendations'],
        score: results.overallScore,
        verifiedBadge: isFull,
      });
      applyCandidateToForm(updated);
      await refreshUser();
      setShowAnalysisOverlay(false);
      setAuditFeedback(results.auditSuggestions);
      setSuccessMsg('Analysis Complete! Review your score & recommendations below.');
    } catch {
      setErrorMsg('Failed to save analysis results.');
      setTimeout(() => setErrorMsg(''), 4500);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addCert = () => {
    if (certForm.name && certForm.issuer) {
      setCertificates([...certificates, certForm]);
      setCertForm({name: '', issuer: '', year: '', fileName: ''});
      setShowCertForm(false);
    }
  };

  const addHackathon = () => {
    if (hackForm.name && hackForm.role) {
      setHackathons([...hackathons, hackForm]);
      setHackForm({name: '', role: '', year: ''});
      setShowHackForm(false);
    }
  };

  // Drag & Drop handlers for Resume
  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setResumeName(file.name);
      setSuccessMsg(`Uploaded Resume: ${file.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Drag & Drop handlers for PPTs
  const handlePPTDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPPT(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => f.name);
      setPpts([...ppts, ...newFiles]);
      setSuccessMsg(`Added ${newFiles.length} Project Presentation(s)`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Drag & Drop handlers for Certificates
  const handleCertDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCert(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCertForm(prev => ({ ...prev, fileName: file.name, name: prev.name || file.name.replace(/\.[^/.]+$/, "") }));
      setShowCertForm(true);
    }
  };

  const suggestions = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'React', 'Node.js', 'SQL', 'PyTorch'];

  return (
    <div className="min-h-screen bg-[#0A0908] text-stone-300 font-sans selection:bg-amber-500/30 relative">
      
      {showAnalysisOverlay && (
        <AgentAnalysisOverlay candidate={candidate} onComplete={handleAnalysisComplete} />
      )}

      {/* Floating Agent Cluster Widget */}
      <AgentWidget activeAgents={candidate.agentAnalysisDone ? [0, 1, 2, 3] : []} position="top-right" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-stone-800/80">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/candidate/dashboard')}
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-amber-500/50 text-amber-500 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold text-stone-300 hidden sm:inline">Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                Candidate Profile
                {candidate.verifiedBadge && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </h1>
              <p className="text-xs text-stone-400 mt-1">Fill required details, connect accounts, and run multi-agent analysis to boost your rank</p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-end sm:self-auto">
            {/* Demo Quick Fill Button */}
            <button
              onClick={handleAutoFillDemoData}
              className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Insert sample GitHub, LeetCode, Resume, and PPT data"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Auto-Fill Demo Data</span>
            </button>

            {/* Clickable Profile Ring */}
            <ProfileRing 
              percentage={completionPercent} 
              size={75} 
              label=""
              onClick={() => setIsEditing(true)}
            />
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-500/40 text-red-300 rounded-2xl flex items-center gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {/* AI Audit Feedback & Recommendations Banner (If present) */}
        {auditFeedback.length > 0 && (
          <div className="mb-8 p-6 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-5 h-5" />
              <span>AI Profile Audit — How to Improve Your Score</span>
            </div>
            <ul className="space-y-2">
              {auditFeedback.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-stone-300 flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-amber-400">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Progress Steps */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 backdrop-blur-xl space-y-6">
              <div>
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Profile Strength</h3>
                <p className="text-2xl font-black text-white">{completionPercent}% Complete</p>
              </div>

              <ul className="space-y-3 text-xs">
                {[
                  { id: 'basic', label: 'Basic Info', filled: true },
                  { id: 'resume', label: 'Resume PDF', filled: !!resumeName },
                  { id: 'ppts', label: 'Project PPTs', filled: ppts.length > 0 },
                  { id: 'skills', label: 'Skills', filled: skills.length > 0 },
                  { id: 'links', label: 'GitHub & LeetCode', filled: !!githubUrl && !!leetcodeUrl },
                  { id: 'certs', label: 'Certificates', filled: certificates.length > 0 },
                  { id: 'about', label: 'About & Location', filled: !!about && !!location },
                ].map(section => (
                  <li key={section.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-950/40 border border-stone-800/40">
                    <span className={section.filled ? 'text-stone-200 font-medium' : 'text-stone-500'}>{section.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${section.filled ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-600'}`}>
                      {section.filled ? '✓' : '•'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Section 1: Basic Info (Signup Data) */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase px-4 py-1.5 rounded-bl-xl border-b border-l border-amber-500/20">
                Verified Account Details
              </div>
              <h2 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div><label className="text-xs text-stone-500 block mb-1">Full Name</label><div className="text-stone-200 font-semibold">{candidate.name}</div></div>
                <div><label className="text-xs text-stone-500 block mb-1">Unique Candidate ID</label><div className="text-amber-400 font-mono font-bold">{candidate.id}</div></div>
                <div><label className="text-xs text-stone-500 block mb-1">Email</label><div className="text-stone-200 font-medium">{candidate.email}</div></div>
                <div><label className="text-xs text-stone-500 block mb-1">Mobile</label><div className="text-stone-200 font-medium">{candidate.mobile}</div></div>
                <div><label className="text-xs text-stone-500 block mb-1">Experience Level</label><div className="text-stone-200 font-semibold capitalize">{candidate.experienceType}</div></div>
                {candidate.experienceType === 'experienced' && (
                  <>
                    <div><label className="text-xs text-stone-500 block mb-1">Current Company</label><div className="text-stone-200 font-medium">{candidate.currentCompany || 'N/A'}</div></div>
                    <div><label className="text-xs text-stone-500 block mb-1">Previous Company</label><div className="text-stone-200 font-medium">{candidate.previousCompany || 'N/A'}</div></div>
                    <div className="md:col-span-2"><label className="text-xs text-stone-500 block mb-1">Reason for Change</label><div className="text-stone-200 font-medium">{candidate.reasonForChange || 'N/A'}</div></div>
                  </>
                )}
              </div>
            </section>

            {/* Section 2: Resume Upload (Drag & Drop + Local File Picker) */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume PDF Upload
                </h2>
                {resumeName && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Loaded
                  </span>
                )}
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
                onDragLeave={() => setIsDraggingResume(false)}
                onDrop={handleResumeDrop}
                onClick={() => resumeInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDraggingResume 
                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]' 
                    : resumeName 
                    ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400' 
                    : 'border-stone-700 hover:border-amber-500/50 hover:bg-stone-900/80'
                }`}
              >
                <input 
                  type="file" 
                  ref={resumeInputRef} 
                  className="hidden" 
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeName(e.target.files[0].name);
                      setSuccessMsg(`Selected Resume: ${e.target.files[0].name}`);
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }
                  }}
                />
                
                {resumeName ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-white font-semibold text-sm">{resumeName}</div>
                    <div className="text-xs text-stone-400">PDF Document • Ready for AI Parsing</div>
                    <div className="text-xs text-amber-400 underline font-medium mt-1">Click or drag new PDF to replace</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-stone-500" />
                    <div className="text-stone-300 font-medium text-sm">
                      Drag & Drop your Resume PDF here, or <span className="text-amber-400 underline">browse files</span>
                    </div>
                    <div className="text-xs text-stone-500">Supports PDF, DOCX (Max 10MB)</div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Project PPTs Upload (Drag & Drop + Local File Picker) */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Project Presentations (PPT / PPTX / PDF)
              </h2>
              
              <div className="space-y-4">
                {ppts.map((ppt, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-stone-950/60 border border-stone-800/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-sm font-medium text-stone-200">{ppt}</span>
                    </div>
                    <button onClick={() => setPpts(ppts.filter((_, idx) => idx !== i))} className="text-stone-500 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Drag and Drop Zone for PPTs */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingPPT(true); }}
                  onDragLeave={() => setIsDraggingPPT(false)}
                  onDrop={handlePPTDrop}
                  onClick={() => pptInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDraggingPPT
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-stone-700 hover:border-amber-500/50 hover:bg-stone-900/60'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={pptInputRef} 
                    className="hidden" 
                    accept=".ppt,.pptx,.pdf"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).map(f => f.name);
                        setPpts([...ppts, ...newFiles]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-8 h-8 text-stone-500" />
                    <span className="text-xs font-semibold text-stone-300">
                      Drag & Drop PPT/PDF slides here, or <span className="text-amber-400 underline">browse local files</span>
                    </span>
                    <span className="text-[10px] text-stone-500">Evaluates presentation intelligence & architecture skills</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Skills (Programming Languages) */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Skills & Technical Expertise
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {skills.map((skill, i) => (
                  <div key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2 shadow-xs">
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-4">
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(skillInput)}
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="Type a programming language or skill and press Enter"
                />
                <button 
                  onClick={() => addSkill(skillInput)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs rounded-xl transition-colors"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-stone-500 py-1">Quick Add:</span>
                {suggestions.filter(s => !skills.includes(s)).map(s => (
                  <button 
                    key={s} 
                    onClick={() => addSkill(s)}
                    className="text-xs px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-md text-stone-400 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 5: Connect Mandatory & Optional Accounts */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Connect Developer & Social Accounts
              </h2>
              
              <div className="space-y-6">
                {/* GitHub - Demo Card */}
                <div className="bg-stone-950/60 border border-stone-800/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                        <GithubIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          GitHub Profile
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30 uppercase font-extrabold">Mandatory</span>
                        </h3>
                        <p className="text-xs text-stone-400">Used by AI Skill Verification Engine to evaluate commits & repos</p>
                      </div>
                    </div>
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline text-xs font-bold flex items-center gap-1">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      placeholder="https://github.com/username"
                    />
                    <button 
                      onClick={() => setGithubUrl('https://github.com/torvalds')}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold whitespace-nowrap"
                    >
                      ⚡ Demo GitHub
                    </button>
                  </div>
                </div>

                {/* LeetCode */}
                <div className="bg-stone-950/60 border border-stone-800/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-amber-500 font-bold text-lg">
                        LC
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          LeetCode Profile
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30 uppercase font-extrabold">Mandatory</span>
                        </h3>
                        <p className="text-xs text-stone-400">Used by Algorithmic Rating Engine to calculate coding rank</p>
                      </div>
                    </div>
                    {leetcodeUrl && (
                      <a href={leetcodeUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline text-xs font-bold flex items-center gap-1">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      placeholder="https://leetcode.com/username"
                    />
                    <button 
                      onClick={() => setLeetcodeUrl('https://leetcode.com/tourist')}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold whitespace-nowrap"
                    >
                      ⚡ Demo LeetCode
                    </button>
                  </div>
                </div>

                {/* LinkedIn - Demo Card */}
                <div className="bg-stone-950/60 border border-stone-800/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                        <LinkedinIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">LinkedIn Account</h3>
                        <p className="text-xs text-stone-400">Optional but recommended for recruiter search visibility</p>
                      </div>
                    </div>
                    {linkedinUrl && (
                      <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs font-bold flex items-center gap-1">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                    <button 
                      onClick={() => setLinkedinUrl('https://linkedin.com/in/linustorvalds')}
                      className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs text-blue-300 font-bold whitespace-nowrap"
                    >
                      ⚡ Demo LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Certificates (JPEG / PNG / PDF File Upload) */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Certificates (Upload JPEG / PNG / PDF)
                </h2>
                {!showCertForm && (
                  <button onClick={() => setShowCertForm(true)} className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Certificate
                  </button>
                )}
              </div>

              {/* Certificates List */}
              <div className="space-y-4 mb-4">
                {certificates.map((cert, i) => (
                  <div key={i} className="p-4 bg-stone-950/60 border border-stone-800/60 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {cert.fileName?.endsWith('.pdf') ? 'PDF' : 'IMG'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{cert.name}</div>
                        <div className="text-xs text-stone-400">{cert.issuer} • {cert.year} {cert.fileName && `(${cert.fileName})`}</div>
                      </div>
                    </div>
                    <button onClick={() => setCertificates(certificates.filter((_, idx) => idx !== i))} className="text-stone-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Certificate Add Form with Drag & Drop */}
              {showCertForm && (
                <div className="p-6 bg-stone-950 border border-amber-500/40 rounded-2xl space-y-4">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Certificate</div>
                  <input type="text" placeholder="Certificate Name (e.g. AWS Certified AI Specialist)" value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Issuer (e.g. Amazon / Coursera)" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500" />
                    <input type="text" placeholder="Year (e.g. 2024)" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500" />
                  </div>

                  {/* Cert Drag & Drop Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingCert(true); }}
                    onDragLeave={() => setIsDraggingCert(false)}
                    onDrop={handleCertDrop}
                    onClick={() => certInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${isDraggingCert ? 'border-amber-400 bg-amber-500/10' : 'border-stone-800 hover:border-amber-500/50'}`}
                  >
                    <input 
                      type="file" 
                      ref={certInputRef} 
                      className="hidden" 
                      accept=".pdf,.jpeg,.jpg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCertForm(prev => ({ ...prev, fileName: e.target.files![0].name }));
                        }
                      }}
                    />
                    <span className="text-xs text-stone-400">
                      {certForm.fileName ? `File attached: ${certForm.fileName}` : 'Drag & Drop Certificate Image/PDF here, or browse local file'}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowCertForm(false)} className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white">Cancel</button>
                    <button onClick={addCert} className="px-5 py-2 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl hover:bg-amber-400">Save Certificate</button>
                  </div>
                </div>
              )}
            </section>

            {/* Section 7: About, College & Location */}
            <section className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                About & Location
              </h2>
              
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">About Yourself</label>
                <textarea 
                  value={about}
                  onChange={(e) => setAbout(e.target.value.slice(0, 500))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-xs text-stone-200 focus:outline-none focus:border-amber-500 h-28 resize-none"
                  placeholder="Describe your technical background, interest in AI, and top achievements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-2">College</label>
                  <input 
                    type="text" 
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. IIT Bombay / BITS Pilani"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-2">University</label>
                  <input 
                    type="text" 
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Mumbai University"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="City, State, Country (e.g. Mumbai, Maharashtra, India)"
                />
              </div>
            </section>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={handleUpdate}
                className="w-full sm:w-auto px-8 py-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
              
              <button 
                onClick={handleAnalyse}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 text-stone-950 font-black text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-stone-950" />
                Analyse Details with AI Cluster
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CheckCircle, Layers, Play, Brain, Target, Trophy, ShieldCheck, Users, TrendingUp, Bot, GitBranch, Presentation } from 'lucide-react';

const platformModules = [
  {
    id: 'talent-profile',
    name: 'Talent Profile',
    icon: <Brain className="w-4 h-4" />,
    title: 'AI Talent Profile Engine',
    description: 'Automatically builds a candidate\'s digital identity from GitHub, LinkedIn, certifications, and hackathon achievements.',
    status: 'active',
    metric: '360° Verified',
    sampleOutput: `{
  "github_repos": 24,
  "hackathons_won": 3,
  "open_source_prs": 47,
  "certifications": ["AWS", "GCP"],
  "talent_score": 92
}`,
  },
  {
    id: 'ai-matching',
    name: 'AI Matching',
    icon: <Target className="w-4 h-4" />,
    title: 'AI Job Matching Engine',
    description: 'Calculates match percentage based on skill similarity, project relevance, cultural fit, and candidate history.',
    status: 'active',
    metric: '98% Accuracy',
    sampleOutput: `{
  "match_score": 96,
  "skill_similarity": 0.94,
  "cultural_fit": 0.89,
  "project_relevance": 0.97,
  "recommendation": "STRONG_HIRE"
}`,
  },
  {
    id: 'verification',
    name: 'Skill Verify',
    icon: <ShieldCheck className="w-4 h-4" />,
    title: 'AI Skill Verification',
    description: 'Verifies skills through automated coding assessments, GitHub analysis, and AI-driven MCQ evaluations.',
    status: 'active',
    metric: 'Auto-Verified',
    sampleOutput: `{
  "coding_assessment": 88,
  "github_analysis": "PASS",
  "mcq_score": 91,
  "fraud_risk": "NONE",
  "authenticity": 0.99
}`,
  },
  {
    id: 'interview-agent',
    name: 'Interview AI',
    icon: <Bot className="w-4 h-4" />,
    title: 'AI Interview Agent',
    description: 'Conducts intelligent technical and behavioral interviews, generating confidence scores, technical ratings, and hiring recommendations.',
    status: 'active',
    metric: 'Smart Interview',
    sampleOutput: `{
  "technical_rating": 87,
  "confidence_score": 82,
  "communication": 91,
  "behavioral_fit": 88,
  "recommendation": "HIRE"
}`,
  },
  {
    id: 'hackathon',
    name: 'Hackathon',
    icon: <Trophy className="w-4 h-4" />,
    title: 'Hackathon Pipeline',
    description: 'Tracks hackathon performance, winner analytics, team rankings, and innovation scores. Enables direct hiring from competitions.',
    status: 'active',
    metric: 'Direct Hire',
    sampleOutput: `{
  "rank": 1,
  "innovation_score": 94,
  "team_contribution": 0.88,
  "project_impact": "HIGH",
  "recruiter_access": true
}`,
  },
  {
    id: 'ppt-analyzer',
    name: 'PPT Analyzer',
    icon: <Presentation className="w-4 h-4" />,
    title: 'AI PPT Analyzer',
    description: 'Analyzes pitch decks and project presentations for innovation, technical feasibility, business impact, and content quality.',
    status: 'active',
    metric: 'Pitch Scores',
    sampleOutput: `{
  "innovation_score": 91,
  "technical_depth": 87,
  "business_impact": 89,
  "presentation_quality": 85,
  "ai_content_risk": "NONE"
}`,
  },
  {
    id: 'fraud-detection',
    name: 'Fraud Guard',
    icon: <ShieldCheck className="w-4 h-4" />,
    title: 'Trust & Fraud Prevention',
    description: 'Detects fake certificates, plagiarized projects, AI-generated resumes, and duplicate profiles to ensure hiring integrity.',
    status: 'active',
    metric: 'Zero Fraud',
    sampleOutput: `{
  "certificate_valid": true,
  "plagiarism_detected": false,
  "ai_generated_resume": false,
  "duplicate_profile": false,
  "authenticity_score": 0.98
}`,
  },
  {
    id: 'career-guidance',
    name: 'Career AI',
    icon: <TrendingUp className="w-4 h-4" />,
    title: 'AI Career Guidance',
    description: 'Provides personalized career roadmaps, skill gap analysis, certification recommendations, and salary predictions.',
    status: 'active',
    metric: 'Personalized',
    sampleOutput: `{
  "skill_gaps": ["System Design", "Cloud"],
  "next_certs": ["AWS Solutions Architect"],
  "salary_range": "$120k-$145k",
  "career_path": "Staff Engineer"
}`,
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Candidate Onboards',
    sub: 'Links GitHub, LinkedIn, uploads resume',
    detail: 'The platform automatically imports public contributions, project history, certifications, and community activity to build a complete talent profile.',
  },
  {
    step: 2,
    title: 'AI Builds Talent Profile',
    sub: 'Scores 7 dimensions of talent',
    detail: 'AI generates the Talent Score™ covering coding ability, project quality, innovation, leadership, problem solving, and community participation.',
  },
  {
    step: 3,
    title: 'Automated Verification',
    sub: 'Skills & authenticity confirmed',
    detail: 'Automated skill verification runs coding assessments, analyzes repositories, checks for fraud, and validates all certifications and credentials.',
  },
  {
    step: 4,
    title: 'Matched to Opportunities',
    sub: 'AI surfaces best-fit jobs',
    detail: 'Candidates are intelligently matched to relevant job openings based on their verified skills, project history, and career goals.',
  },
];

export const Architecture: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState(platformModules[0]);

  const handleSimulateFlow = () => {
    workflowSteps.forEach((ws, i) => {
      setTimeout(() => setActiveStep(ws.step), i * 700);
    });
    setTimeout(() => setActiveStep(null), workflowSteps.length * 700 + 400);
  };

  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 matrix-image-bg relative overflow-hidden">

      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            From Talent Discovery to <br />
            <span className="text-gold-gradient">Verified Hiring — End to End</span>
          </h2>
          <p className="text-base text-stone-600">
            A unified AI ecosystem connecting candidates, recruiters, hackathons, and communities into one seamless hiring pipeline.
          </p>
        </div>

        {/* Platform Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-700" />
                <h3 className="text-base font-extrabold text-stone-900">For Candidates</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">Profile & Growth</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Build a verified digital talent identity that goes far beyond a resume. Showcase your real capabilities to recruiters worldwide.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-stone-800">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />AI Talent Profile Engine</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Verified Skill Badges</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Career Roadmap & Guidance</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />AI Resume & Portfolio Builder</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-amber-700" />
                <h3 className="text-base font-extrabold text-stone-900">For Recruiters</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">Hire Smarter</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Discover top talent hidden beyond resumes using AI shortlisting, natural language search, and automated skill verification.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-stone-800">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />AI Job Matching Engine</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Recruiter AI Copilot (NLP Search)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Hiring Analytics Dashboard</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Hackathon-to-Hiring Pipeline</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
                <h3 className="text-base font-extrabold text-stone-900">AI Assessment</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">Verified Skills</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Automatically verify every claim — from coding assessments to GitHub analysis, PPT pitch reviews, and fraud detection.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-stone-800">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Coding & MCQ Assessments</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />AI Interview Agent</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />AI PPT & Pitch Analyzer</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Fraud Prevention System</li>
            </ul>
          </div>

        </div>

        {/* Interactive Flow Simulator */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-300 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-200 pb-4">
            <div className="text-left">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-700" />
                Candidate Journey Simulator
              </h3>
              <p className="text-xs text-stone-600">See how a candidate moves from onboarding to job offer through the AI platform</p>
            </div>
            <button
              onClick={handleSimulateFlow}
              disabled={activeStep !== null}
              className="px-6 py-3 rounded-2xl bg-amber-500 text-stone-950 text-xs font-extrabold hover:bg-amber-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Simulate Journey</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  activeStep === ws.step
                    ? 'bg-amber-500 text-stone-950 border-amber-600 scale-105 shadow-xl font-bold'
                    : 'bg-white text-stone-800 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    activeStep === ws.step ? 'bg-stone-950 text-amber-400' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {ws.step}
                  </span>
                  {activeStep === ws.step && (
                    <span className="text-[9px] font-mono uppercase bg-stone-950 text-amber-400 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-extrabold">{ws.title}</h4>
                <p className="text-[11px] opacity-90 mt-1 leading-snug">{ws.detail}</p>
              </div>
            ))}
          </div>

          {/* AI Module Directory */}
          <div className="bg-stone-950 p-6 rounded-2xl border border-amber-500/30 text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-400" />
                AI MODULE INTELLIGENCE CENTER
              </span>
              <div className="flex flex-wrap gap-2">
                {platformModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
                      selectedModule.id === mod.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {mod.icon}
                    {mod.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-mono">
              <div className="lg:col-span-7 space-y-2 text-stone-300">
                <p className="text-amber-300 font-bold text-sm">{selectedModule.title}</p>
                <p className="text-stone-400 leading-relaxed">{selectedModule.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <span>Metric: <strong className="text-emerald-400">{selectedModule.metric}</strong></span>
                  <span>Status: <strong className="text-amber-400">ACTIVE</strong></span>
                </div>
              </div>
              <div className="lg:col-span-5 bg-stone-900 p-3 rounded-xl border border-stone-800 text-[11px] text-amber-400 overflow-x-auto">
                <div className="text-stone-500 text-[9px] mb-1">SAMPLE AI OUTPUT:</div>
                <pre>{selectedModule.sampleOutput}</pre>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

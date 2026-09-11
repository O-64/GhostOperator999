'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Brain, Trophy, ShieldCheck, FileText, Bot, Users, 
  TrendingUp, Target, ArrowUpRight, Mic, GitBranch, Presentation, X, CheckCircle2
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  bullets: string[];
  badge: string;
  color: string;
}

const features: Feature[] = [
  {
    id: 'talent-profile',
    icon: <Brain className="w-6 h-6" />,
    category: 'Candidate',
    title: 'AI Talent Profile Engine',
    description: 'Automatically build a rich talent identity from your GitHub activity, LinkedIn, certifications, and hackathon achievements — far beyond a traditional resume.',
    bullets: ['Auto-generated from GitHub & LinkedIn', 'Hackathon performance tracking', 'Open-source contribution analysis', 'Verified digital identity'],
    badge: '360° Profile',
    color: 'amber',
  },
  {
    id: 'talent-score',
    icon: <Trophy className="w-6 h-6" />,
    category: 'Candidate',
    title: 'AI Talent Score™',
    description: 'Get an overall talent score that reflects your real abilities — covering coding skills, project quality, leadership, innovation, and community participation.',
    bullets: ['Coding ability & consistency', 'Project quality & innovation', 'Leadership & community impact', 'Problem-solving assessment'],
    badge: 'Multi-Dimensional',
    color: 'amber',
  },
  {
    id: 'job-matching',
    icon: <Target className="w-6 h-6" />,
    category: 'Recruiter',
    title: 'AI Job Matching Engine',
    description: 'Instantly match candidates to open roles with AI-calculated compatibility scores based on skill similarity, cultural fit, and project relevance.',
    bullets: ['Candidate match percentage', 'Skill similarity analysis', 'Cultural fit evaluation', 'Project relevance scoring'],
    badge: 'Smart Matching',
    color: 'amber',
  },
  {
    id: 'skill-verification',
    icon: <ShieldCheck className="w-6 h-6" />,
    category: 'Assessment',
    title: 'AI Skill Verification',
    description: 'Automatically verify candidate skills through coding assessments, MCQ evaluations, GitHub repository analysis, and project reviews.',
    bullets: ['Automated coding assessments', 'GitHub repo deep analysis', 'MCQ skill evaluations', 'Fraud & fake profile detection'],
    badge: 'Verified Skills',
    color: 'amber',
  },
  {
    id: 'ai-interview',
    icon: <Mic className="w-6 h-6" />,
    category: 'Assessment',
    title: 'AI Interview Agent',
    description: 'Conduct intelligent technical and behavioral interviews powered by AI. Get detailed reports including confidence scores, technical ratings, and hiring recommendations.',
    bullets: ['Technical interview simulation', 'Behavioral assessment AI', 'Communication evaluation', 'Confidence & readiness scores'],
    badge: 'Smart Interview',
    color: 'amber',
  },
  {
    id: 'ppt-analyzer',
    icon: <Presentation className="w-6 h-6" />,
    category: 'Assessment',
    title: 'AI PPT Analyzer',
    description: 'Upload pitch decks and project presentations for instant AI evaluation. Scores innovation, business impact, technical depth, and presentation quality.',
    bullets: ['Innovation & feasibility scoring', 'Business impact analysis', 'Presentation quality review', 'AI-generated improvement tips'],
    badge: 'Pitch Evaluator',
    color: 'amber',
  },
  {
    id: 'hackathon-pipeline',
    icon: <Trophy className="w-6 h-6" />,
    category: 'Hackathon',
    title: 'Hackathon-to-Hiring Pipeline',
    description: 'Transform hackathon performance into direct hiring opportunities. Recruiters access top performers, winner analytics, and project evaluations in real time.',
    bullets: ['Winner & team rankings', 'Innovation scoring', 'Direct recruiter access', 'Project evaluation reports'],
    badge: 'Hackathon Ready',
    color: 'amber',
  },
  {
    id: 'career-guidance',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Candidate',
    title: 'AI Career Guidance',
    description: 'Receive personalized career roadmaps, skill gap analysis, certification recommendations, and salary predictions to accelerate your growth.',
    bullets: ['Skill gap identification', 'Recommended certifications', 'Career roadmap planning', 'Salary benchmarking'],
    badge: 'Career Coach',
    color: 'amber',
  },
  {
    id: 'resume-builder',
    icon: <FileText className="w-6 h-6" />,
    category: 'Candidate',
    title: 'AI Resume & Portfolio Builder',
    description: 'Generate ATS-friendly resumes, dynamic portfolio websites, cover letters, and company-specific resume optimizations — all powered by AI.',
    bullets: ['ATS-optimized resumes', 'Dynamic portfolio websites', 'Custom cover letters', 'Company-specific tailoring'],
    badge: 'Auto-Generated',
    color: 'amber',
  },
  {
    id: 'team-analytics',
    icon: <GitBranch className="w-6 h-6" />,
    category: 'Assessment',
    title: 'Team Contribution Analytics',
    description: 'Analyze GitHub commits, pull requests, task contributions, and submission history to understand real team dynamics and individual impact.',
    bullets: ['GitHub commit analysis', 'Pull request evaluation', 'Task contribution tracking', 'Collaboration scoring'],
    badge: 'Git Analytics',
    color: 'amber',
  },
  {
    id: 'recruiter-copilot',
    icon: <Bot className="w-6 h-6" />,
    category: 'Recruiter',
    title: 'Recruiter AI Copilot',
    description: 'Search for candidates using natural language. Ask "Find top React developers with hackathon experience from Delhi" and get instant, AI-ranked results.',
    bullets: ['Natural language search', 'AI shortlisting & ranking', 'Hiring analytics dashboard', 'Recruitment pipeline management'],
    badge: 'NLP Search',
    color: 'amber',
  },
  {
    id: 'fraud-detection',
    icon: <ShieldCheck className="w-6 h-6" />,
    category: 'Trust',
    title: 'Trust & Fraud Prevention',
    description: 'AI-powered fraud detection identifies fake certificates, plagiarized projects, AI-generated resumes, and duplicate profiles — ensuring hiring integrity.',
    bullets: ['Fake certificate detection', 'Plagiarism identification', 'AI-resume detection', 'Authenticity scoring'],
    badge: 'Anti-Fraud AI',
    color: 'amber',
  },
];

const categories = [
  { id: 'all', label: 'All Features' },
  { id: 'Candidate', label: 'For Candidates' },
  { id: 'Recruiter', label: 'For Recruiters' },
  { id: 'Assessment', label: 'Assessment Tools' },
  { id: 'Hackathon', label: 'Hackathon' },
  { id: 'Trust', label: 'Trust & Security' },
];

export const FeatureGrids: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<Feature | null>(null);

  const filteredFeatures = selectedCategory === 'all'
    ? features
    : features.filter(f => f.category === selectedCategory);

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50/80 relative">

      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12">

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Everything You Need to <br />
            <span className="text-gold-gradient">Transform Talent Discovery</span>
          </h2>
          <p className="text-base text-stone-600">
            From candidate profile building to recruiter AI copilots — every tool is designed to make hiring smarter, faster, and based on real verified skills.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-300/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => setActiveModal(feature)}
              className="glass-panel p-6 rounded-3xl border border-amber-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-600 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    {feature.badge}
                  </span>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{feature.category}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                    {feature.title}
                    <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100" />
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-2">
                  {feature.bullets.slice(0, 2).map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-semibold text-stone-500">
                <span className="text-xs font-bold text-amber-700 capitalize">{feature.category} Module</span>
                <span className="text-stone-400 group-hover:text-amber-700 underline underline-offset-2">Learn more →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full p-8 rounded-3xl border-2 border-amber-400 shadow-2xl relative text-left space-y-6 max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-2xl border border-amber-300 text-amber-600">
                {activeModal.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700">
                  {activeModal.category} Module
                </span>
                <h3 className="text-2xl font-black text-stone-900">{activeModal.title}</h3>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">{activeModal.description}</p>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-3">
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">Key Capabilities</h4>
              <ul className="space-y-2.5">
                {activeModal.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {activeModal.badge}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-extrabold hover:bg-amber-600 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

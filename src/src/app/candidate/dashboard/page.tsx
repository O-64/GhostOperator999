'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { CandidateUser, JobPosting, CodingQuestion } from '../../../types';
import * as api from '../../../lib/api';

import { CandidateNavbar, ProfileRing, AgentWidget, SkillBarChart, CodeEditor } from '../../../components/candidate';
import { Briefcase, MapPin, DollarSign, CheckCircle, Lock, BookOpen, ChevronRight, Award, Zap, Code2 } from 'lucide-react';

const defaultQuestions: CodingQuestion[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
    language: 'Python',
    starterCode: 'def two_sum(nums, target):\n    # Your solution here\n    pass',
    difficulty: 'Easy'
  },
  {
    id: 'q2',
    title: 'Reverse a Linked List',
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    language: 'Python',
    starterCode: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    # Your solution here\n    pass',
    difficulty: 'Easy'
  },
  {
    id: 'q3',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
    language: 'JavaScript',
    starterCode: 'function isValid(s) {\n    // Your solution here\n}',
    difficulty: 'Medium'
  }
];

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, isLoading, updateCandidateProfile } = useAuth();
  
  const [candidate, setCandidate] = useState<CandidateUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [codingTestOpen, setCodingTestOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== 'candidate') {
      router.push('/auth/candidate');
      return;
    }

    setCandidate(user as CandidateUser);

    api.listJobs().then(setJobs).catch(() => setJobs([]));
  }, [user, isLoading, router]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3000);
  };

  const handleApply = async (jobId: string) => {
    if (candidate && candidate.profileCompletion < 80) {
      alert('Complete your profile to apply to jobs!');
      return;
    }
    try {
      await api.applyToJob(jobId);
      showToast('Applied successfully!');
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : 'Failed to apply';
      showToast(message);
    }
  };

  const handleStartCodingTest = () => {
    const randomQ = defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
    setCurrentQuestion(randomQ);
    setScoreModalOpen(false);
    setCodingTestOpen(true);
  };

  const handleSubmitCode = async (code: string) => {
    showToast('Submitting solution...');
    if (!candidate) return;
    try {
      const newScore = (candidate.score || 0) + 15;
      await updateCandidateProfile({ score: newScore });
      setCandidate(prev => (prev ? { ...prev, score: newScore } : prev));
      showToast('🎉 Score increased by +15 points!');
      setCodingTestOpen(false);
    } catch {
      showToast('Failed to update score');
    }
  };


  if (isLoading || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E0D] text-amber-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider uppercase">Loading Candidate Dashboard...</span>
        </div>
      </div>
    );
  }

  const profileCompletion = candidate.profileCompletion || 0;
  const agentAnalysisDone = candidate.agentAnalysisDone || false;

  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans relative">
      <CandidateNavbar
        candidateName={candidate.name}
        candidateId={candidate.id}
        profileCompletion={candidate.profileCompletion || 0}
        verifiedBadge={candidate.verifiedBadge || false}
        onSearch={(q) => setSearchQuery(q)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-16">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-stone-800 text-white shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between z-10 gap-6">
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {candidate.name}!</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-sm font-medium text-amber-100 uppercase">
                  {candidate.id.substring(0,8).toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-stone-700/50 rounded-full text-sm font-medium text-stone-200 capitalize">
                  {candidate.role}
                </span>
                {agentAnalysisDone && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-sm font-medium text-green-300 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verified & Ranked
                  </span>
                )}
              </div>
              
              {profileCompletion < 80 && (
                <button 
                  onClick={() => router.push('/candidate/profile')}
                  className="mt-4 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all flex items-center gap-2"
                >
                  Complete Your Profile <ChevronRight className="w-5 h-5" />
                  <span className="text-xs bg-stone-900 text-amber-400 px-2 py-0.5 rounded-full ml-1">+80% Visibility</span>
                </button>
              )}
            </div>

            <div 
              onClick={() => router.push('/candidate/profile')}
              className="flex flex-col items-center justify-center shrink-0 cursor-pointer group transition-transform hover:scale-105"
              title="Click to view and complete your profile"
            >
               <ProfileRing 
                 percentage={profileCompletion} 
                 onClick={() => router.push('/candidate/profile')} 
               />
               <p className="mt-2 text-xs font-bold text-amber-300 group-hover:underline flex items-center gap-1">
                 Complete Profile ➔
               </p>
            </div>

            <div className="flex-1 flex flex-col items-end gap-3 text-right">
                <div className="bg-stone-900/50 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full max-w-xs">
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-1">Global Rank</p>
                    <p className="text-2xl font-bold text-amber-400">
                    {agentAnalysisDone ? (candidate.globalRank ? `#${candidate.globalRank} Globally` : (candidate.rank ? `#${candidate.rank} Globally` : '#12 Globally')) : 'Rank Pending'}
                    </p>
                </div>
                <div className="bg-stone-900/50 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full max-w-xs flex justify-between items-center">
                    <div>
                        <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-1">Score</p>
                        <p className="text-xl font-bold text-white">{candidate.score || 0} pts</p>
                    </div>
                    <Award className="w-8 h-8 text-amber-400/50" />
                </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => router.push('/candidate/profile')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col justify-center items-center cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <span className="text-stone-500 text-sm font-medium mb-1 group-hover:text-amber-600">Profile</span>
            <span className="text-2xl font-bold text-stone-800">{profileCompletion}% Complete</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to Edit ➔</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col justify-center items-center">
            <span className="text-stone-500 text-sm font-medium mb-1">Score</span>
            <span className="text-2xl font-bold text-stone-800">{candidate.score || 0} pts</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col justify-center items-center">
            <span className="text-stone-500 text-sm font-medium mb-1">Rank</span>
            <span className="text-2xl font-bold text-stone-800">{agentAnalysisDone ? (candidate.globalRank ? `#${candidate.globalRank}` : (candidate.rank ? `#${candidate.rank}` : '#12')) : 'Pending'}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col justify-center items-center">
            <span className="text-stone-500 text-sm font-medium mb-1">Skills</span>
            <span className="text-2xl font-bold text-stone-800">{candidate.skills?.length || 0} listed</span>
          </div>
        </div>

        {/* Explore Section */}
        <section>
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                    🔍 Explore Opportunities
                </h2>
                {!agentAnalysisDone && (
                    <p className="text-sm text-amber-600 mt-1 bg-amber-100/50 px-3 py-1 rounded-md inline-block">
                        Complete your profile to see personalized matches
                    </p>
                )}
             </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl shrink-0">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 leading-tight">{job.title}</h3>
                    <p className="text-stone-500 text-sm">{job.company}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-md flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {job.type}
                    </span>
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-md flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    {job.salary && (
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-md flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {job.salary}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6 flex-1">
                    {job.skills?.slice(0,3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                            {skill}
                        </span>
                    ))}
                    {(job.skills?.length || 0) > 3 && (
                         <span className="px-2 py-1 bg-stone-50 text-stone-500 text-xs font-medium rounded">
                            +{(job.skills?.length || 0) - 3}
                         </span>
                    )}
                </div>

                <button 
                  onClick={() => handleApply(job.id)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
          {jobs.length > 5 && (
            <div className="mt-6 text-center">
                <button className="px-6 py-2 border-2 border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600 font-medium rounded-xl transition-colors">
                    Load More Jobs
                </button>
            </div>
          )}
        </section>

        {/* New Skills to Learn */}
        <section className="relative">
           <h2 className="text-2xl font-bold text-stone-800 mb-6">Trending Skills to Learn</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'DSA in Python', icon: <BookOpen className="w-6 h-6 text-blue-500" /> },
                { title: 'System Design', icon: <Zap className="w-6 h-6 text-yellow-500" /> },
                { title: 'React Advanced', icon: <BookOpen className="w-6 h-6 text-cyan-500" /> },
                { title: 'ML Fundamentals', icon: <Zap className="w-6 h-6 text-purple-500" /> }
              ].map((skill, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col relative overflow-hidden">
                   {profileCompletion < 60 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                         <Lock className="w-6 h-6 text-stone-500 mb-2" />
                         <span className="text-xs font-bold text-stone-700">Complete Profile to Unlock</span>
                      </div>
                   )}
                   <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mb-4">
                      {skill.icon}
                   </div>
                   <h3 className="font-bold text-stone-800">{skill.title}</h3>
                   <p className="text-stone-500 text-sm mb-4">50+ lessons</p>
                   <button className="mt-auto py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg transition-colors text-sm text-center">
                      Start Learning
                   </button>
                </div>
              ))}
           </div>
        </section>

        {/* Skill Analysis & Recommendations (Only if Analysis Done) */}
        {agentAnalysisDone && (
            <div className="grid lg:grid-cols-2 gap-8">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800 mb-6">Your Skill Level Analysis</h2>
                    <div className="h-64">
                       {/* Render SkillBarChart with mock or real data */}
                       <SkillBarChart skillLevels={candidate.skillLevels || [
                          { skill: 'React', level: 85 },
                          { skill: 'TypeScript', level: 90 },
                          { skill: 'Node.js', level: 75 },
                          { skill: 'System Design', level: 70 }
                        ]} />
                    </div>
                </section>
                
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800 mb-6">AI Recommendations</h2>
                    <div className="space-y-4">
                        {(candidate.recommendations || [
                          { type: 'improvement', title: 'Advanced System Design', description: 'Focus on distributed systems' },
                          { type: 'course', title: 'Open Source Contribution', description: 'Contribute to popular repos' }
                        ]).map((rec: any, i: number) => (
                            <div key={i} className="p-4 bg-stone-50 rounded-xl flex items-center justify-between border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-800">{typeof rec === 'string' ? rec : rec.title}</h4>
                                        <p className="text-xs text-stone-500">{typeof rec === 'string' ? 'Recommended based on your profile' : rec.description}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                    15% OFF
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        )}

        {/* See Your Score Section */}
        <section className="bg-stone-900 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center flex flex-col items-center">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Award className="w-64 h-64 text-white" />
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Your Matrix Score</h2>
             <p className="text-stone-400 mb-8 relative z-10 max-w-md">
                 Increase your score by taking technical assessments and AI interviews. A higher score boosts your visibility to top tech companies.
             </p>
             
             <div className="relative w-48 h-48 flex items-center justify-center z-10 mb-8">
                 {/* Simple Progress Ring Visualization */}
                 <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="16" fill="none" />
                    <circle 
                        cx="96" cy="96" r="88" 
                        stroke="#fbbf24" strokeWidth="16" fill="none" 
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - (candidate.score || 0) / 100)} 
                        strokeLinecap="round"
                    />
                 </svg>
                 <div className="text-center">
                     <span className="block text-5xl font-black text-amber-400">{candidate.score || 0}</span>
                     <span className="block text-sm text-stone-400 uppercase tracking-widest mt-1">out of 100</span>
                 </div>
             </div>

             <button 
                onClick={() => setScoreModalOpen(true)}
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all z-10"
             >
                Improve Your Score
             </button>
        </section>

      </main>

      <AgentWidget />

      {/* Score Modal */}
      {scoreModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
              <button 
                onClick={() => setScoreModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Improve Your Score</h3>
              <p className="text-stone-500 mb-6">Choose an assessment to boost your matrix score.</p>
              
              <div className="space-y-4">
                 <button 
                   onClick={handleStartCodingTest}
                   className="w-full p-4 border-2 border-stone-200 hover:border-amber-400 rounded-2xl flex items-center gap-4 group transition-colors text-left"
                 >
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-800">Coding Test</h4>
                        <p className="text-sm text-stone-500">Solve a quick algorithm challenge (+15 pts)</p>
                    </div>
                 </button>

                 <button 
                   disabled
                   className="w-full p-4 border-2 border-stone-200 rounded-2xl flex items-center gap-4 opacity-60 cursor-not-allowed text-left relative overflow-hidden"
                 >
                    <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center text-stone-500">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-800">AI Interview</h4>
                        <p className="text-sm text-stone-500">Mock technical interview (+30 pts)</p>
                    </div>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-stone-200 text-stone-600 text-xs font-bold rounded">
                        Coming Soon
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {codingTestOpen && currentQuestion && (
        <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-md z-[60] flex flex-col p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Coding Assessment: <span className="text-amber-400">{currentQuestion.title}</span></h3>
                <button 
                    onClick={() => setCodingTestOpen(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
            
            <div className="flex-1 bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 flex flex-col lg:flex-row">
                {/* Problem Description */}
                <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-stone-800 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                            currentQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {currentQuestion.difficulty}
                        </span>
                        <span className="px-2.5 py-1 bg-stone-800 text-stone-400 text-xs font-bold rounded">
                            {currentQuestion.language}
                        </span>
                    </div>
                    <div className="prose prose-invert prose-sm">
                        <p className="whitespace-pre-wrap text-stone-300 leading-relaxed">
                            {currentQuestion.description}
                        </p>
                    </div>
                </div>
                
                {/* Editor Area */}
                <div className="flex-1 flex flex-col relative">
                    <CodeEditor 
                        question={currentQuestion}
                        onSubmit={handleSubmitCode}
                    />
                </div>
            </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-stone-900 text-white font-medium rounded-full shadow-2xl flex items-center gap-3 z-[70] animate-bounce-short">
            <CheckCircle className="w-5 h-5 text-amber-400" />
            {toastMessage}
        </div>
      )}
    </div>
  );
}

// Removed duplicate Code function - now using Code2 from lucide-react

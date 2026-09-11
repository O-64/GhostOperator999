"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Mic, 
  Users, 
  BarChart2, 
  AlertTriangle, 
  FileSearch, 
  Compass,
  CheckCircle,
  ArrowRight,
  Cpu
} from "lucide-react";

export interface AnalysisResult {
  rank: number;
  skillLevels: { skill: string; level: number }[];
  recommendations: { type: string; title: string; description: string }[];
  overallScore: number;
}

import { CandidateUser } from "../../types";

export interface AnalysisResult {
  rank: number;
  skillLevels: { skill: string; level: number }[];
  recommendations: { type: string; title: string; description: string }[];
  overallScore: number;
  auditSuggestions: string[];
}

interface AgentAnalysisOverlayProps {
  candidate?: CandidateUser | null;
  onComplete: (results: AnalysisResult) => void;
}

const AGENTS = [
  { id: 0, name: "AI Skill Verification Engine", icon: Shield },
  { id: 1, name: "AI Interview Engine", icon: Mic },
  { id: 2, name: "Team Fit & Contribution Analytics", icon: Users },
  { id: 3, name: "Presentation & PPT Intelligence", icon: BarChart2 },
  { id: 4, name: "Fraud & Integrity Detection", icon: AlertTriangle },
  { id: 5, name: "Resume & Document Screening", icon: FileSearch },
  { id: 6, name: "Career Growth & Guidance Engine", icon: Compass },
];

export default function AgentAnalysisOverlay({ candidate, onComplete }: AgentAnalysisOverlayProps) {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [agentStatus, setAgentStatus] = useState<"Queued" | "Thinking..." | "Working..." | "Done ✓">("Thinking...");
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isComplete) return;

    let statusTimer: NodeJS.Timeout;
    let agentTimer: NodeJS.Timeout;

    const runAgent = () => {
      setAgentStatus("Thinking...");
      
      statusTimer = setTimeout(() => {
        setAgentStatus("Working...");
        
        statusTimer = setTimeout(() => {
          setAgentStatus("Done ✓");
          
          agentTimer = setTimeout(() => {
            if (currentAgentIndex < AGENTS.length - 1) {
              setCurrentAgentIndex(prev => prev + 1);
              setProgress(((currentAgentIndex + 1) / AGENTS.length) * 100);
            } else {
              setIsComplete(true);
              setProgress(100);
            }
          }, 600);
        }, 800);
      }, 700);
    };

    runAgent();

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(agentTimer);
    };
  }, [currentAgentIndex, isComplete]);

  const handleComplete = () => {
    // Audit profile completeness to produce dynamic feedback
    const auditSuggestions: string[] = [];
    let baseScore = candidate?.score || 60;
    
    if (!candidate?.githubUrl) {
      auditSuggestions.push("⚠️ Connect your GitHub account to verify commit history and code quality.");
      baseScore -= 15;
    }
    if (!candidate?.leetcodeUrl) {
      auditSuggestions.push("⚠️ Connect your LeetCode profile to calculate algorithmic problem-solving score.");
      baseScore -= 15;
    }
    if (!candidate?.projectPPTs || candidate.projectPPTs.length === 0) {
      auditSuggestions.push("⚠️ Upload Project PPTs/PDFs so AI PPT Analyzer can evaluate system architecture.");
      baseScore -= 10;
    }
    if (!candidate?.resumeName) {
      auditSuggestions.push("⚠️ Upload your Resume PDF for Resume Screening Agent parsing.");
      baseScore -= 10;
    }
    if (!candidate?.certificates || candidate.certificates.length === 0) {
      auditSuggestions.push("⚠️ Upload Certificates (JPEG/PDF) to boost credibility and team analytics.");
      baseScore -= 5;
    }
    if (!candidate?.skills || candidate.skills.length < 3) {
      auditSuggestions.push("⚠️ Add at least 3-5 programming languages/skills to improve job match accuracy.");
      baseScore -= 5;
    }

    const calculatedScore = Math.max(35, Math.min(98, baseScore + 25));
    const calculatedRank = Math.max(1, Math.floor(100 - calculatedScore * 0.9));

    const generatedSkillLevels = (candidate?.skills && candidate.skills.length > 0)
      ? candidate.skills.map(s => ({ skill: s, level: Math.floor(Math.random() * 25) + 70 }))
      : [
          { skill: "React", level: 85 },
          { skill: "TypeScript", level: 88 },
          { skill: "Python", level: 80 },
        ];

    onComplete({
      rank: calculatedRank,
      overallScore: calculatedScore,
      skillLevels: generatedSkillLevels,
      auditSuggestions,
      recommendations: [
        { type: "course", title: "Advanced System Design & Scalability", description: "Learn distributed caching & microservices" },
        { type: "improvement", title: "GitHub Open Source Contributions", description: "Contribute to popular AI repositories" },
        { type: "practice", title: "Algorithm Optimization", description: "Solve medium/hard dynamic programming problems" },
      ]
    });
  };

  const CurrentIcon = AGENTS[currentAgentIndex]?.icon || Cpu;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-md overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] animate-scanline" />
      </div>

      {!isComplete ? (
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
          <h2 className="text-2xl font-mono text-amber-500 mb-12 tracking-widest uppercase animate-pulse">
            Neural Analysis in Progress
          </h2>

          <div className="relative w-40 h-40 mb-12">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="w-full h-full border-4 border-amber-500/30 transform rotate-45 rounded-2xl flex items-center justify-center relative bg-stone-900/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] transition-all duration-500">
              <div className="transform -rotate-45">
                <CurrentIcon className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
              </div>
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute -inset-4 border border-amber-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute -inset-8 border border-amber-500/10 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
          </div>

          <div className="text-center w-full mb-8 h-20 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300">
              {AGENTS[currentAgentIndex].name}
            </h3>
            <p className={`text-lg font-mono ${
              agentStatus === "Done ✓" ? "text-emerald-400" : 
              agentStatus === "Working..." ? "text-amber-400" : "text-stone-400"
            }`}>
              {agentStatus}
            </p>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-xs font-mono text-stone-500 mb-2">
              <span>System Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/30 blur" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {AGENTS.map((agent, idx) => (
                <div 
                  key={agent.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx < currentAgentIndex ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    idx === currentAgentIndex ? 'bg-amber-500 animate-ping shadow-[0_0_8px_#f59e0b]' : 
                    'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center bg-stone-900/80 p-10 rounded-3xl border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-500 max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h2>
          <p className="text-stone-400 mb-8 text-center">Your profile has been fully evaluated by our AI cluster.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50 text-center">
              <p className="text-stone-400 text-sm mb-1">Overall Rank</p>
              <p className="text-3xl font-bold text-white">#42</p>
              <p className="text-xs text-stone-500 mt-1">Top 5%</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50 text-center">
              <p className="text-stone-400 text-sm mb-1">Matrix Score</p>
              <p className="text-3xl font-bold text-amber-400">92<span className="text-lg text-stone-500">/100</span></p>
              <p className="text-xs text-stone-500 mt-1">Exceptional</p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full group relative flex items-center justify-center px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold text-lg hover:from-amber-500 hover:to-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
            <span>View Your Results</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}} />
    </div>
  );
}

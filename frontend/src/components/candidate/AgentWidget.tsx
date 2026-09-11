"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AgentWidgetProps {
  activeAgents?: number[];
  position?: 'bottom-right' | 'top-right';
}

const AGENTS = [
  { 
    id: 0, name: "AI Skill Verification", shortName: "SkillVerify",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400/50', glow: 'shadow-emerald-500/50'
  },
  { 
    id: 1, name: "AI Interview Agent", shortName: "Interview",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M9 5a3 3 0 106 0 3 3 0 00-6 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-400/50', glow: 'shadow-blue-500/50'
  },
  { 
    id: 2, name: "Team Contribution Analytics", shortName: "TeamAnalytics",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-400/50', glow: 'shadow-violet-500/50'
  },
  { 
    id: 3, name: "AI PPT Analyzer", shortName: "PPT-Intel",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-400/50', glow: 'shadow-orange-500/50'
  },
  { 
    id: 4, name: "Fraud Detection Agent", shortName: "FraudGuard",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-400/50', glow: 'shadow-red-500/50'
  },
  { 
    id: 5, name: "Resume Screening Agent", shortName: "ResumeAI",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-400/50', glow: 'shadow-cyan-500/50'
  },
  { 
    id: 6, name: "Career Guidance Agent", shortName: "CareerAI",
    symbol: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-400/50', glow: 'shadow-amber-500/50'
  },
];

const STATUS_CYCLE = ["Idle", "Thinking...", "Working...", "Analyzing..."];

// The diamond-shaped collapsed button that always sits in corner
function DiamondButton({ hasActive, agentCount, onClick, agentId }: {
  hasActive: boolean; agentCount: number; onClick: () => void; agentId?: number;
}) {
  const [pulse, setPulse] = useState(0);
  const agent = agentId !== undefined ? AGENTS[agentId] : null;

  useEffect(() => {
    if (!hasActive) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 4), 900);
    return () => clearInterval(t);
  }, [hasActive]);

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      {/* Outer glow ring */}
      {hasActive && (
        <div className="absolute inset-[-8px] rounded-xl bg-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
      )}
      
      {/* Diamond shape */}
      <div className="relative w-14 h-14 flex items-center justify-center"
        style={{ transform: 'rotate(45deg)' }}>
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all duration-300
          ${hasActive
            ? 'bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border-amber-400/80 shadow-lg shadow-amber-500/40'
            : 'bg-gradient-to-br from-stone-900 to-stone-800 border-stone-600/60 shadow-md group-hover:border-amber-400/60'}
        `}>
          {/* Inner icon — unrotated */}
          <div style={{ transform: 'rotate(-45deg)' }} className="flex flex-col items-center gap-0.5">
            {/* Neural network dots pattern */}
            <svg viewBox="0 0 20 20" fill="none" className={`w-6 h-6 ${hasActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-amber-400'} transition-colors`}>
              <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.7"/>
              <circle cx="10" cy="3" r="2" fill="currentColor"/>
              <circle cx="15" cy="5" r="1.5" fill="currentColor" opacity="0.7"/>
              <circle cx="3" cy="10" r="1.5" fill="currentColor" opacity="0.5"/>
              <circle cx="10" cy="10" r="2.5" fill="currentColor" className={hasActive ? 'animate-pulse' : ''}/>
              <circle cx="17" cy="10" r="1.5" fill="currentColor" opacity="0.5"/>
              <circle cx="5" cy="15" r="1.5" fill="currentColor" opacity="0.7"/>
              <circle cx="10" cy="17" r="2" fill="currentColor"/>
              <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.7"/>
              {/* Connections */}
              <line x1="5" y1="5" x2="10" y2="3" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="10" y1="3" x2="15" y2="5" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="5" y1="5" x2="10" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="10" y1="3" x2="10" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="15" y1="5" x2="10" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="10" y1="10" x2="5" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="10" y1="10" x2="10" y2="17" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
              <line x1="10" y1="10" x2="15" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Status label outside diamond */}
      {hasActive && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-amber-400 tracking-widest uppercase">
            {STATUS_CYCLE[pulse]}
          </span>
        </div>
      )}

      {/* Active count badge */}
      {hasActive && agentCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg border border-stone-900 z-10">
          {agentCount}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
        <div className="bg-stone-900 border border-stone-700 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl font-medium">
          AI Agent Cluster
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-stone-900" />
        </div>
      </div>
    </div>
  );
}

export default function AgentWidget({ activeAgents = [], position = 'bottom-right' }: AgentWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [agentStatuses, setAgentStatuses] = useState<Record<number, number>>({});

  useEffect(() => {
    if (activeAgents.length === 0) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUS_CYCLE.length);
      // Random per-agent status cycling
      const newStatuses: Record<number, number> = {};
      activeAgents.forEach(id => {
        newStatuses[id] = Math.floor(Math.random() * STATUS_CYCLE.length);
      });
      setAgentStatuses(newStatuses);
    }, 1200);
    return () => clearInterval(interval);
  }, [activeAgents]);

  const hasActive = activeAgents.length > 0;

  // Position classes
  const posClass = position === 'top-right'
    ? 'fixed top-20 right-6 z-50'
    : 'fixed bottom-6 right-6 z-50';

  if (!expanded) {
    return (
      <div className={`${posClass} flex flex-col items-center gap-8`}>
        <DiamondButton
          hasActive={hasActive}
          agentCount={activeAgents.length}
          onClick={() => setExpanded(true)}
        />
      </div>
    );
  }

  // Expanded panel position
  const panelClass = position === 'top-right'
    ? 'fixed top-20 right-6 z-50 w-80'
    : 'fixed bottom-6 right-6 z-50 w-80';

  return (
    <div className={`${panelClass} bg-[#0f0e0d]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden`}
      style={{ boxShadow: '0 0 40px rgba(245,158,11,0.08), 0 25px 50px rgba(0,0,0,0.5)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-stone-900 to-stone-800">
        <div className="flex items-center gap-2.5">
          {/* Mini diamond */}
          <div className="w-7 h-7 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasActive ? 'bg-amber-500/20 border-amber-400/60' : 'bg-stone-800 border-stone-600'}`}>
              <div style={{ transform: 'rotate(-45deg)' }}>
                <div className={`w-2 h-2 rounded-full ${hasActive ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'}`} />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xs text-white tracking-wide">AI AGENT CLUSTER</h3>
            <p className="text-[10px] text-stone-400">
              {hasActive ? `${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''} running` : 'All agents idle'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

      {/* Agent List */}
      <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
        {AGENTS.map((agent) => {
          const isActive = activeAgents.includes(agent.id);
          const agentStatus = agentStatuses[agent.id] ?? 0;
          
          return (
            <div key={agent.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
              isActive 
                ? `${agent.bg} ${agent.border} shadow-sm` 
                : 'border-transparent hover:bg-white/5'
            }`}>
              {/* Diamond icon */}
              <div className="relative shrink-0">
                {isActive && (
                  <div className={`absolute inset-0 ${agent.bg} rounded-lg blur-sm animate-pulse`} />
                )}
                <div className="relative w-9 h-9 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                    isActive ? `${agent.bg} ${agent.border}` : 'bg-stone-900/60 border-stone-700/60'
                  }`}>
                    <div style={{ transform: 'rotate(-45deg)' }} className={isActive ? agent.color : 'text-stone-500'}>
                      {agent.symbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent info */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-stone-500'}`}>
                  {agent.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isActive ? `${agent.color.replace('text-', 'bg-')} animate-pulse` : 'bg-stone-700'
                  }`} />
                  <p className={`text-[10px] font-medium ${isActive ? agent.color : 'text-stone-600'}`}>
                    {isActive ? STATUS_CYCLE[agentStatus] : 'Idle'}
                  </p>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${agent.color} ${agent.bg} border ${agent.border}`}>
                  ON
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-stone-900/60 flex items-center justify-between">
        <span className="text-[10px] text-stone-500 font-medium">AI Talent Matrix Agents</span>
        <div className="flex gap-1">
          {AGENTS.slice(0, 5).map(a => (
            <div key={a.id} className={`w-1.5 h-1.5 rounded-full transition-colors ${activeAgents.includes(a.id) ? a.color.replace('text-', 'bg-') : 'bg-stone-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

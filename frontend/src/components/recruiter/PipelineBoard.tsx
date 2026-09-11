'use client';
import { Application, CandidateUser, PipelineStage } from '../../types';
import { getAvatarColor } from '../../lib/candidateStore';
import { ChevronRight, CheckCircle, Clock, Mail, Star } from 'lucide-react';

interface Props {
  applications: Application[];
  candidates: CandidateUser[];
  onMoveStage: (appId: string, stage: PipelineStage) => void;
  onViewCandidate: (candidateId: string) => void;
}

const STAGES: PipelineStage[] = [
  'Discovered', 'Shortlisted', 'Contacted', 'Interview Scheduled', 'Offered', 'Hired'
];

const STAGE_CONFIG: Record<PipelineStage, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Discovered': {
    color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200',
    icon: <Star className="w-3.5 h-3.5" />
  },
  'Shortlisted': {
    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  'Contacted': {
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    icon: <Mail className="w-3.5 h-3.5" />
  },
  'Interview Scheduled': {
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  'Offered': {
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    icon: <ChevronRight className="w-3.5 h-3.5" />
  },
  'Hired': {
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  'Rejected': {
    color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
};

export default function PipelineBoard({ applications, candidates, onMoveStage, onViewCandidate }: Props) {
  const findCandidate = (id: string) => candidates.find(c => c.id === id);

  const getCandidateName = (id: string) => {
    const c = findCandidate(id);
    return c ? c.name : id;
  };

  const getCandidateInitials = (id: string) => {
    const c = findCandidate(id);
    if (!c) return '??';
    return c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getCandidateColor = (id: string) => {
    const c = findCandidate(id);
    return c ? getAvatarColor(c.name) : '#6366f1';
  };

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const idx = STAGES.indexOf(current as any);
    if (idx === -1 || idx >= STAGES.length - 1) return null;
    return STAGES[idx + 1];
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-slate-300" />
        </div>
        <p className="font-semibold text-slate-600">No candidates in pipeline yet</p>
        <p className="text-sm mt-1">Shortlist candidates from Discovery or AI Shortlisting to add them here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage);
          const cfg = STAGE_CONFIG[stage];

          return (
            <div key={stage} className="w-56 shrink-0">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border} mb-3`}>
                <div className={`flex items-center gap-1.5 font-bold text-xs ${cfg.color}`}>
                  {cfg.icon}
                  <span>{stage}</span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                  {stageApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {stageApps.map(app => {
                  const nextStage = getNextStage(app.stage as PipelineStage);
                  return (
                    <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2" onClick={() => onViewCandidate(app.candidateId)}>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ background: getCandidateColor(app.candidateId) }}
                        >
                          {getCandidateInitials(app.candidateId)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{getCandidateName(app.candidateId)}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{app.candidateId}</p>
                        </div>
                      </div>

                      {app.matchScore !== undefined && (
                        <div className="text-[10px] text-indigo-600 font-bold mb-2">
                          ⚡ {app.matchScore}% Match
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mb-2">
                        {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>

                      {nextStage && (
                        <button
                          onClick={() => onMoveStage(app.id, nextStage)}
                          className="w-full flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Move to {nextStage} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {app.stage === 'Hired' && (
                        <div className="text-center text-[10px] font-bold text-emerald-600 py-1.5">✓ Hired</div>
                      )}
                    </div>
                  );
                })}

                {stageApps.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-400">No candidates</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

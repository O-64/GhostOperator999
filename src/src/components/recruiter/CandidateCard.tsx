'use client';
import { CandidateUser, MatchResult } from '../../types';
import { getAvatarColor } from '../../lib/candidateStore';
import { CheckCircle, MapPin, GraduationCap, Zap, GitBranch, Award, ChevronRight, UserPlus } from 'lucide-react';

interface Props {
  candidate: CandidateUser;
  matchResult?: MatchResult;
  onView: (c: CandidateUser) => void;
  onShortlist?: (c: CandidateUser) => void;
  isShortlisted?: boolean;
  isSelected?: boolean;
  onSelect?: (c: CandidateUser) => void;
  showCompare?: boolean;
}

export default function CandidateCard({
  candidate, matchResult, onView, onShortlist, isShortlisted, isSelected, onSelect, showCompare
}: Props) {
  const initials = candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColor = getAvatarColor(candidate.name);

  const verdictColor: Record<string, string> = {
    'Strong Fit': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Good Fit': 'text-blue-600 bg-blue-50 border-blue-200',
    'Moderate Fit': 'text-amber-600 bg-amber-50 border-amber-200',
    'Weak Fit': 'text-red-500 bg-red-50 border-red-200',
  };

  return (
    <div className={`group relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden
      ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>

      {/* Selection checkbox */}
      {showCompare && (
        <button
          onClick={() => onSelect?.(candidate)}
          className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 hover:border-indigo-400'}`}
        >
          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </button>
      )}

      {/* Header */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-sm truncate">{candidate.name}</h4>
            {candidate.verifiedBadge && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{candidate.post || 'Software Developer'}</p>
          {candidate.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400">{candidate.location}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Rank</div>
          <div className="text-xl font-black text-indigo-600">#{candidate.rank ?? '—'}</div>
        </div>
      </div>

      {/* Match Score Bar */}
      {matchResult && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Match</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verdictColor[matchResult.verdict]}`}>
              {matchResult.verdict}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                matchResult.overallScore >= 80 ? 'bg-emerald-500' :
                matchResult.overallScore >= 65 ? 'bg-blue-500' :
                matchResult.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${matchResult.overallScore}%` }}
            />
          </div>
          <div className="text-right text-xs font-black text-slate-700 mt-0.5">{matchResult.overallScore}%</div>
        </div>
      )}

      {/* Score & Profile */}
      {!matchResult && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${candidate.profileCompletion}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">{candidate.profileCompletion}% Profile</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-slate-600">Score: {candidate.score}</span>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold border border-indigo-100">{s}</span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-semibold">+{candidate.skills.length - 4}</span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {candidate.college && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <GraduationCap className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{candidate.college}</span>
          </div>
        )}
        {candidate.githubUrl && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span>GitHub</span>
          </div>
        )}
        {candidate.hackathons && candidate.hackathons.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600">
            <Award className="w-3 h-3" />
            <span>{candidate.hackathons.length} Hackathon{candidate.hackathons.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-1 border-t border-slate-100 flex gap-2 mt-auto">
        <button
          onClick={() => onView(candidate)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          Full Profile <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {onShortlist && (
          <button
            onClick={() => onShortlist(candidate)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
              isShortlisted
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
            }`}
            title={isShortlisted ? 'Already shortlisted' : 'Shortlist candidate'}
          >
            <UserPlus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

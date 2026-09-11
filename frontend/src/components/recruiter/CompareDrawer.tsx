'use client';
import { CandidateUser, MatchResult } from '../../types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { getAvatarColor } from '../../lib/candidateStore';
import { CheckCircle, MapPin, GraduationCap, X, Zap } from 'lucide-react';

interface Props {
  candidates: CandidateUser[];
  matchResults: Record<string, MatchResult>;
  onClose: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];
const DIM_LABELS: Record<string, string> = {
  skillMatch: 'Skills',
  experienceMatch: 'Experience',
  projectRelevance: 'Projects',
  culturalFit: 'Culture',
  hackathonBonus: 'Hackathons',
};

export default function CompareDrawer({ candidates, matchResults, onClose }: Props) {
  const radarData = Object.keys(DIM_LABELS).map(key => {
    const entry: Record<string, string | number> = { subject: DIM_LABELS[key] };
    candidates.forEach(c => {
      const mr = matchResults[c.id];
      entry[c.name] = mr ? (mr as any)[key] : 0;
    });
    return entry;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h2 className="text-lg font-black text-slate-900">Compare Candidates</h2>
          <button onClick={onClose} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Radar Chart */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" /> AI Dimension Comparison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  {candidates.map((c, i) => (
                    <Radar
                      key={c.id}
                      name={c.name}
                      dataKey={c.name}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    formatter={(value: any) => [`${value}%`]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-2">
              {candidates.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs font-semibold text-slate-600">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side comparison */}
          <div className={`grid grid-cols-1 sm:grid-cols-${candidates.length} divide-x divide-slate-100`}
            style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
            {candidates.map((c, idx) => {
              const mr = matchResults[c.id];
              const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const color = COLORS[idx];
              return (
                <div key={c.id} className="p-5">
                  {/* Identity */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: color }}>
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-sm text-slate-900">{c.name}</p>
                        {c.verifiedBadge && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      {c.location && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3" />{c.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Score */}
                  {mr && (
                    <div className="mb-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="text-center">
                        <div className="text-3xl font-black" style={{ color }}>{mr.overallScore}%</div>
                        <div className="text-xs font-bold text-slate-500">Overall Match</div>
                        <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                          mr.verdict === 'Strong Fit' ? 'bg-emerald-100 text-emerald-700' :
                          mr.verdict === 'Good Fit' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'}`}>
                          {mr.verdict}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {Object.entries(DIM_LABELS).map(([key, label]) => (
                          <div key={key}>
                            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                              <span>{label}</span><span className="font-bold">{(mr as any)[key]}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${(mr as any)[key]}%`, background: color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* College */}
                  {c.college && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{c.college}</span>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.skills.slice(0, 6).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold border border-indigo-100">{s}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-lg font-black text-slate-800">{c.score}</div>
                      <div className="text-[10px] text-slate-500">Score</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-lg font-black text-slate-800">#{c.rank ?? '—'}</div>
                      <div className="text-[10px] text-slate-500">Rank</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-lg font-black text-slate-800">{c.hackathons?.length || 0}</div>
                      <div className="text-[10px] text-slate-500">Hackathons</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-lg font-black text-slate-800">{c.certificates?.length || 0}</div>
                      <div className="text-[10px] text-slate-500">Certs</div>
                    </div>
                  </div>

                  {/* Summary */}
                  {mr?.summary && (
                    <p className="text-[11px] text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {mr.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

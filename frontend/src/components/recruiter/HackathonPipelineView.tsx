'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { Trophy, Award, Zap, Users, ExternalLink, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function HackathonPipelineView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invitedTeams, setInvitedTeams] = useState<string[]>([]);

  useEffect(() => {
    api.getHackathonData()
      .then(res => setData(res))
      .catch(err => console.error('Hackathon data error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleFastTrackInvite = (teamName: string) => {
    setInvitedTeams(prev => [...prev, teamName]);
  };

  if (loading) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <div className="text-sm font-bold text-slate-600">Loading Hackathon Pipeline Data...</div>
      </div>
    );
  }

  const hackathons = data?.activeHackathons || [];
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-amber-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" /> Hackathon-to-Hiring Pipeline (Mandatory)
            </div>
            <h2 className="text-2xl font-black tracking-tight">Hackathon Performance Tracking & Top Performer Pipeline</h2>
            <p className="text-amber-200/80 text-sm mt-1 max-w-2xl">
              Direct recruiter access to verified hackathon winners, team rankings, innovation evaluation metrics, and priority interview fast-tracks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
              <div className="text-xl font-black text-amber-300">{stats.fastTrackedCandidates || 16}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Fast-Tracked Candidates</div>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
              <div className="text-xl font-black text-emerald-300">{stats.recruiterOfferRate || '68%'}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Offer Conversion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hackathons List */}
      <div className="space-y-6">
        {hackathons.map((hack: any) => (
          <div key={hack.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {hack.status}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{hack.title}</h3>
                <p className="text-xs text-slate-500">Organized by {hack.organizer} • {hack.participants} participants • {hack.teamsCount} teams</p>
              </div>
              {hack.winnerTeam && hack.winnerTeam !== 'TBD' && (
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" /> Champion Team: {hack.winnerTeam}
                </div>
              )}
            </div>

            {/* Team Rankings Table */}
            <div className="space-y-3">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Ranked Finalist Teams & Projects:</div>
              <div className="grid grid-cols-1 gap-3">
                {hack.topRankings?.map((team: any) => {
                  const isInvited = invitedTeams.includes(team.team);

                  return (
                    <div
                      key={team.team}
                      className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          team.rank === 1 ? 'bg-amber-400 text-white' : team.rank === 2 ? 'bg-slate-400 text-white' : 'bg-amber-800 text-white'
                        }`}>
                          #{team.rank}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                            <span>Team {team.team}</span>
                            <span className="text-xs font-normal text-slate-600">— {team.project}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Members: {team.members?.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-center text-xs">
                          <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold">Innovation</div>
                            <div className="font-black text-indigo-600">{team.innovationScore}%</div>
                          </div>
                          <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold">Tech Depth</div>
                            <div className="font-black text-purple-600">{team.techScore}%</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFastTrackInvite(team.team)}
                          disabled={isInvited}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            isInvited
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                        >
                          {isInvited ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Interview Invited
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" /> Fast-Track Invite
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

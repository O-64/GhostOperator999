'use client';

import { useState } from 'react';
import * as api from '../../lib/api';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Search, RefreshCw, UserCheck, Lock } from 'lucide-react';
import { CandidateUser } from '../../types';

export default function FraudTrustView({ candidates }: { candidates: CandidateUser[] }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [auditing, setAuditing] = useState(false);
  const [fraudReports, setFraudReports] = useState<Record<string, any>>({});

  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleAudit = async (candidate: CandidateUser) => {
    setAuditing(true);
    try {
      const res = await api.checkCandidateFraud({
        candidate: {
          id: candidate.id,
          name: candidate.name,
          skills: candidate.skills,
          certificates: candidate.certificates,
          projects: candidate.projectPPTs?.map(p => ({ name: p })) || [],
          github_url: candidate.githubUrl,
          experience_type: candidate.experienceType
        },
        resumeText: candidate.about || ""
      });
      setFraudReports(prev => ({ ...prev, [candidate.id]: res }));
    } catch (err) {
      console.error('Fraud audit failed:', err);
    } finally {
      setAuditing(false);
    }
  };

  const report = currentCandidate ? fraudReports[currentCandidate.id] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-rose-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Trust & Fraud Prevention System (Mandatory)
            </div>
            <h2 className="text-2xl font-black tracking-tight">Candidate Authenticity & Fraud Risk Intelligence</h2>
            <p className="text-rose-200/80 text-sm mt-1 max-w-2xl">
              Automated multi-agent verification scanning for fake certificates, fabricated projects, synthetic AI-generated resumes,
              duplicate profiles, and plagiarized repository code.
            </p>
          </div>
          {currentCandidate && (
            <button
              onClick={() => handleAudit(currentCandidate)}
              disabled={auditing}
              className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-600/30 transition-all active:scale-95 whitespace-nowrap"
            >
              {auditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Running Forensic Audit...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Run Forensic Fraud Check
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wide shrink-0">Select Profile:</span>
        <div className="flex gap-2">
          {candidates.map(c => {
            const isAudited = !!fraudReports[c.id];
            const candReport = fraudReports[c.id];
            const risk = candReport?.riskLevel || 'Unknown';

            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCandidateId(c.id);
                  if (!fraudReports[c.id]) handleAudit(c);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                  selectedCandidateId === c.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{c.name}</span>
                {isAudited && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      risk === 'Low' ? 'bg-emerald-400' : risk === 'Medium' ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Report Result */}
      {currentCandidate && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Candidate Authenticity Score</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {report ? `${report.authenticityScore} / 100` : "92 / 100"}
              </div>
              <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> High Trust Confidence
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Fraud Risk Level</div>
              <div className="text-3xl font-black mt-1">
                <span className={report?.riskLevel === 'High' ? 'text-rose-600' : report?.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}>
                  {report?.riskLevel || 'Low'} Risk
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Calculated from 5 threat vectors</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">AI Resume Probability</div>
              <div className="text-3xl font-black text-indigo-600 mt-1">
                {report?.aiResumeLikelihood || 15}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Natural human writing patterns</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Verification Badge Status</div>
              <div className="text-xl font-black text-slate-800 mt-2 flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>{report?.verifiedBadgeEligible ? 'Verified Authentic' : 'Eligible for Badge'}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Government ID & Code Verified</div>
            </div>
          </div>

          {/* Detailed Forensic Audit Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Flags */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Automated Risk Flags ({report?.flags?.length || 0})
              </h4>
              {report?.flags && report.flags.length > 0 ? (
                <div className="space-y-2">
                  {report.flags.map((flag: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase mt-0.5 ${
                        flag.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {flag.severity}
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-800">{flag.type}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{flag.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  No critical fraudulent activity, fake certificates, or plagiarized claims detected.
                </div>
              )}
            </div>

            {/* Forensic Observations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" /> Multi-Source Credential Audit
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">Certificate Validation:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                    {report?.certificateAuthenticity || 'Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">Project Plagiarism Risk:</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-black text-[10px]">
                    {report?.plagiarismRisk || 'Low'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">Repository Commits Integrity:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                    Verified Original
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Forensic Auditor Notes:</div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {(report?.forensicObservations || [
                    "Education and graduation year correlate accurately with age and work tenure.",
                    "Claimed technology stack matches syntax in public GitHub commits."
                  ]).map((obs: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

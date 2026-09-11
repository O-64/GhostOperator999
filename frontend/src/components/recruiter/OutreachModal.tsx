'use client';
import { useState } from 'react';
import { CandidateUser, InterviewSlot } from '../../types';
import { X, Mail, Globe, Calendar, Video, MapPin, Copy, CheckCircle, ExternalLink } from 'lucide-react';

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
    </svg>
  );
}

interface Props {
  candidate: CandidateUser;
  recruiterName: string;
  company: string;
  jobTitle?: string;
  onClose: () => void;
  onScheduled?: (slot: InterviewSlot) => void;
}

type OutreachTab = 'message' | 'schedule';
type MessageChannel = 'gmail' | 'linkedin' | 'web';

const MESSAGE_TEMPLATES: Record<MessageChannel, (c: CandidateUser, recruiterName: string, company: string, jobTitle?: string) => string> = {
  gmail: (c, rn, comp, jt) => `Subject: Exciting Opportunity at ${comp} — ${jt || 'Software Engineer Role'}

Hi ${c.name.split(' ')[0]},

I came across your profile on AI Talent Matrix and was genuinely impressed by your background in ${c.skills.slice(0, 3).join(', ')}.

At ${comp}, we're looking for talented individuals like yourself, and I believe your skill set — particularly in ${c.skills[0]} — aligns perfectly with our ${jt || 'open role'}.

I'd love to set up a quick 20-minute call to tell you more about the opportunity and learn about your goals.

Are you open to a conversation this week?

Best regards,
${rn}
${comp}`,

  linkedin: (c, rn, comp, jt) => `Hi ${c.name.split(' ')[0]},

I'm ${rn} from ${comp}. Your profile caught my eye — especially your expertise in ${c.skills[0]}${c.hackathons?.length ? ` and your hackathon experience` : ''}.

We have an exciting ${jt || 'engineering role'} that I think would be a great fit. Would love to connect and share more details!

Open to a chat?`,

  web: (c, rn, comp, jt) => `Hi ${c.name.split(' ')[0]},

We've reviewed your AI Talent Matrix profile and are impressed by your capabilities in ${c.skills.slice(0, 2).join(' and ')}.

${comp} is actively hiring for ${jt || 'software engineering positions'}, and you're among our top candidates.

Please reply to express your interest and we'll schedule a call at your convenience.

Regards,
${rn} | ${comp}`,
};

export default function OutreachModal({ candidate, recruiterName, company, jobTitle, onClose, onScheduled }: Props) {
  const [tab, setTab] = useState<OutreachTab>('message');
  const [channel, setChannel] = useState<MessageChannel>('gmail');
  const [copied, setCopied] = useState(false);

  // Interview form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [mode, setMode] = useState<'Online' | 'Offline'>('Online');
  const [link, setLink] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduled, setScheduled] = useState(false);

  const message = MESSAGE_TEMPLATES[channel](candidate, recruiterName, company, jobTitle);

  const handleGmail = () => {
    const subject = encodeURIComponent(`Opportunity at ${company} — ${jobTitle || 'Software Engineer Role'}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleLinkedin = () => {
    if (candidate.linkedinUrl) {
      window.open(candidate.linkedinUrl, '_blank');
    }
    handleCopy();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedule = () => {
    if (!date || !time) return;
    const slot: InterviewSlot = { date, time, mode, link: mode === 'Online' ? link : undefined, venue: mode === 'Offline' ? venue : undefined };
    onScheduled?.(slot);
    setScheduled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-base">Outreach: {candidate.name}</h3>
            <p className="text-indigo-200 text-xs">{candidate.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('message')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'message' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> Send Message</div>
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'schedule' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> Schedule Interview</div>
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {tab === 'message' && (
            <div className="space-y-4">
              {/* Channel Select */}
              <div className="grid grid-cols-3 gap-2">
                {(['gmail', 'linkedin', 'web'] as MessageChannel[]).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-bold ${
                      channel === ch ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {ch === 'gmail' && <Mail className="w-5 h-5 text-red-500" />}
                    {ch === 'linkedin' && <LinkedinIcon className="w-5 h-5 text-blue-600" />}
                    {ch === 'web' && <Globe className="w-5 h-5 text-emerald-500" />}
                    <span className="capitalize">{ch === 'web' ? 'Web' : ch === 'gmail' ? 'Gmail' : 'LinkedIn'}</span>
                  </button>
                ))}
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Generated Message</label>
                <textarea
                  readOnly
                  value={message}
                  rows={10}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 font-mono resize-none focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors border ${
                    copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                {channel === 'gmail' && (
                  <button onClick={handleGmail} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" /> Open Gmail
                  </button>
                )}
                {channel === 'linkedin' && (
                  <button onClick={handleLinkedin} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
                    <LinkedinIcon className="w-4 h-4" /> Open LinkedIn
                  </button>
                )}
                {channel === 'web' && (
                  <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">
                    <Copy className="w-4 h-4" /> Copy & Use
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="space-y-4">
              {scheduled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="font-black text-slate-900 text-lg">Interview Scheduled!</h4>
                  <p className="text-slate-500 text-sm mt-2">
                    {mode} interview on {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {time}
                  </p>
                  <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm">Done</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Time *</label>
                      <input type="time" value={time} onChange={e => setTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Online', 'Offline'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${mode === m ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                          {m === 'Online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {mode === 'Online' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Meet Link (optional)</label>
                      <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                  )}

                  {mode === 'Offline' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Venue (optional)</label>
                      <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Office address or location"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                  )}

                  <button
                    onClick={handleSchedule}
                    disabled={!date || !time}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Confirm Schedule
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

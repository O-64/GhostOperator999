'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../lib/api';
import { CandidateUser } from '../../../types';
import { CandidateNavbar } from '../../../components/candidate';
import { Search, Filter, ShieldCheck, X } from 'lucide-react';

const SKILLS = ['Python', 'JS', 'React', 'Java', 'ML', 'Go'];

const CandidatePublicCard = ({ candidate, onClick }: { candidate: CandidateUser; onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-amber-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-400 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
            {candidate.name}
            {candidate.verifiedBadge && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
          </h3>
          <p className="text-xs text-stone-500 font-mono">ID: {candidate.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-stone-400">Rank</span>
            <span className="text-xl font-black text-amber-600">#{candidate.rank || 'N/A'}</span>
          </div>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full border-[3px] border-amber-100 group-hover:border-amber-300 transition-colors">
            <span className="text-[10px] font-bold text-stone-700">{candidate.profileCompletion}%</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-amber-500"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * candidate.profileCompletion) / 100}
              />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-2">
        {candidate.skills.slice(0, 5).map(skill => (
          <span key={skill} className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-[10px] font-semibold">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 5 && (
          <span className="px-2 py-1 bg-stone-100 text-stone-400 rounded-md text-[10px] font-semibold">
            +{candidate.skills.length - 5}
          </span>
        )}
      </div>
    </div>
  );
};

export default function CandidateSearchPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<'all' | 'fresher' | 'experienced'>('all');
  const [rankRange, setRankRange] = useState<number>(100);
  
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateUser | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== 'candidate') {
      router.push('/auth/candidate');
      return;
    }

    api
      .listCandidates({ sortBy: 'rank' })
      .then(all => setCandidates(all.filter(c => c.id !== user.id)))
      .catch(() => setCandidates([]));
  }, [user, isLoading, router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const filteredCandidates = candidates.filter(c => {
    // Search match
    const searchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Skill match
    const skillMatch = selectedSkills.length === 0 || selectedSkills.every(s => c.skills.includes(s));
    
    // Experience match
    const isFresher = c.experienceType === 'fresher';
    const expMatch = experience === 'all' || (experience === 'fresher' && isFresher) || (experience === 'experienced' && !isFresher);
    
    // Rank match (rank <= rankRange)
    const rankMatch = (c.rank || 999) <= rankRange;

    return searchMatch && skillMatch && expMatch && rankMatch;
  });

  if (isLoading || !user || user.role !== 'candidate') return null;

  const candidateUser = user as any;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <CandidateNavbar
        candidateName={candidateUser.name || 'Candidate'}
        candidateId={candidateUser.id || 'CAND-001'}
        profileCompletion={candidateUser.profileCompletion || 20}
        verifiedBadge={candidateUser.verified || false}
        onSearch={(q) => setSearchQuery(q)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="glass-panel p-5 rounded-2xl bg-white/60 border border-amber-200/50 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4 text-stone-800 font-bold border-b border-amber-100 pb-2">
                <Filter className="w-4 h-4 text-amber-500" />
                Filters
              </div>
              
              {/* Skills Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">Skills</h4>
                <div className="space-y-2">
                  {SKILLS.map(skill => (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSkills.includes(skill) ? 'bg-amber-500 border-amber-500' : 'border-stone-300 group-hover:border-amber-400'}`}>
                        {selectedSkills.includes(skill) && <ShieldCheck className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">Experience</h4>
                <div className="flex flex-col gap-2">
                  {['all', 'fresher', 'experienced'].map(exp => (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${experience === exp ? 'border-amber-500' : 'border-stone-300 group-hover:border-amber-400'}`}>
                        {experience === exp && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      <span className="text-sm font-medium text-stone-700 capitalize group-hover:text-amber-700">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rank Range Filter */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider flex justify-between">
                  <span>Max Rank</span>
                  <span className="text-amber-600 font-bold">{rankRange}</span>
                </h4>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={rankRange} 
                  onChange={(e) => setRankRange(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                placeholder="Search candidates by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm text-sm"
              />
            </div>

            <div className="mb-4 text-sm font-semibold text-stone-600">
              {filteredCandidates.length} candidates found
            </div>

            {/* Grid */}
            {filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map(cand => (
                  <CandidatePublicCard 
                    key={cand.id} 
                    candidate={cand} 
                    onClick={() => setSelectedCandidate(cand)} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl bg-white/40 border border-stone-200">
                <Search className="w-12 h-12 text-stone-300 mb-4" />
                <h3 className="text-lg font-bold text-stone-700">No candidates found</h3>
                <p className="text-sm text-stone-500 max-w-sm mt-2">Try adjusting your filters or search query to find more talent.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200 flex flex-col max-h-[90vh]">
            <div className="p-5 flex justify-between items-start border-b border-stone-100 bg-stone-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full border-2 border-amber-300 overflow-hidden shadow-sm">
                  <img src={selectedCandidate.avatar || '/default-avatar.png'} alt={selectedCandidate.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    {selectedCandidate.name}
                    {selectedCandidate.verifiedBadge && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                  </h2>
                  <p className="text-sm text-stone-500 font-mono">ID: {selectedCandidate.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-stone-400 hover:text-stone-700 bg-white rounded-lg border border-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Platform Rank</div>
                  <div className="text-2xl font-black text-amber-600">#{selectedCandidate.rank || 'N/A'}</div>
                </div>
                <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Hackathons</div>
                  <div className="text-2xl font-black text-stone-700">{selectedCandidate.hackathons?.length || 0}</div>
                </div>
                <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Certificates</div>
                  <div className="text-2xl font-black text-stone-700">{selectedCandidate.certificates?.length || 0}</div>
                </div>
              </div>

              {selectedCandidate.about && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-stone-800 mb-2">About</h4>
                  <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">{selectedCandidate.about}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-stone-800 mb-2">Verified Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
              <p className="text-[11px] text-stone-500 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Internal profile details, contact info, and assessments are private.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

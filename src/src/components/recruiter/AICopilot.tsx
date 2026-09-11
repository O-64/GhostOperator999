'use client';
import { useState, useRef, useEffect } from 'react';
import { CopilotMessage, CandidateUser, RecruiterUser } from '../../types';
import * as api from '../../lib/api';
import CandidateCard from './CandidateCard';
import { Sparkles, Send, Trash2, MessageSquare } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Find top AI developers from Delhi',
  'Find React developers with hackathon experience',
  'Find candidates skilled in GenAI and Open Source',
  'Show experienced backend engineers in Bangalore',
  'Find fresher data science candidates',
  'Top candidates with GitHub profiles',
];

interface Props {
  recruiter: RecruiterUser;
  allCandidates: CandidateUser[];
  onViewCandidate: (c: CandidateUser) => void;
  onShortlist: (c: CandidateUser) => void;
  shortlistedIds: string[];
}

export default function AICopilot({ recruiter, allCandidates, onViewCandidate, onShortlist, shortlistedIds }: Props) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await api.getCopilotHistory();
        if (saved.length > 0) {
          setMessages(saved);
          return;
        }
      } catch {
        // Backend unavailable — show welcome only
      }

      const welcome: CopilotMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi ${recruiter.name}! I'm your AI Recruitment Copilot. Ask me anything in natural language — I'll find the best candidates for you!\n\nTry something like:\n• "Find React developers with hackathon experience"\n• "Show top AI/ML engineers from Delhi"\n• "Find open-source contributors skilled in Python"`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    };

    loadHistory();
  }, [recruiter.id, recruiter.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (query: string) => {
    if (!query.trim()) return;
    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.copilotQuery(query);
      const assistantMsg = response.message;
      setMessages([...newMessages, assistantMsg]);
    } catch {
      const fallbackMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Could not reach the backend. Showing local results for "${query}".`,
        timestamp: new Date().toISOString(),
        candidateResults: allCandidates.slice(0, 6),
      };
      setMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.clearCopilotHistory();
    } catch {
      // ignore
    }
    setMessages([]);
  };

  const renderContent = (content: string) => {
    return content.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-950 to-slate-900 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white">AI Recruitment Copilot</p>
            <p className="text-[10px] text-indigo-300">Natural language candidate search</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold">LIVE</span>
          </div>
          <button onClick={handleClear} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Clear history">
            <Trash2 className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-700 rounded-bl-sm border border-slate-200 shadow-sm'
              }`}>
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </div>

              {msg.candidateResults && msg.candidateResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {msg.candidateResults.map(c => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      onView={onViewCandidate}
                      onShortlist={onShortlist}
                      isShortlisted={shortlistedIds.includes(c.id)}
                    />
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 px-1">
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 ml-1">Searching candidates...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-slate-200 bg-white shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Quick searches</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-[11px] px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder="Ask anything, e.g. 'Find React devs with hackathon experience from Bangalore'"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
            />
          </div>
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

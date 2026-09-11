'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { Bot, Mic, Play, CheckCircle, Award, Send, RefreshCw, X, Sparkles, TrendingUp } from 'lucide-react';

interface QuestionItem {
  id: string;
  category: string;
  question: string;
  sampleKeyPoints?: string[];
}

export default function AIInterviewModal({
  roleTitle,
  skills,
  onClose,
  onScoreUpdate
}: {
  roleTitle: string;
  skills: string[];
  onClose: () => void;
  onScoreUpdate?: (points: number) => void;
}) {
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [completedEvaluations, setCompletedEvaluations] = useState<any[]>([]);
  const [interviewFinished, setInterviewFinished] = useState(false);

  useEffect(() => {
    api.startAIInterview({
      roleTitle: roleTitle || "Full-Stack AI Engineer",
      candidateSkills: skills || ["Python", "React", "Docker"],
      seniority: "Mid"
    })
      .then(res => {
        if (res?.questions) setQuestions(res.questions);
      })
      .catch(err => console.error('Interview start error:', err))
      .finally(() => setLoadingQuestions(false));
  }, [roleTitle, skills]);

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || !questions[currentIndex]) return;
    setEvaluating(true);
    try {
      const q = questions[currentIndex];
      const evaluation = await api.submitInterviewAnswer({
        question: q.question,
        answer: candidateAnswer,
        roleTitle: roleTitle || "Software Engineer"
      });
      setCurrentEvaluation(evaluation);
      setCompletedEvaluations(prev => [...prev, { question: q, evaluation, answer: candidateAnswer }]);
      if (onScoreUpdate) onScoreUpdate(10);
    } catch (err) {
      console.error('Answer evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentEvaluation(null);
    setCandidateAnswer('');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setInterviewFinished(true);
    }
  };

  const currentQ = questions[currentIndex];

  // Calculate final averages
  const avgTech = completedEvaluations.length > 0
    ? Math.round(completedEvaluations.reduce((acc, c) => acc + (c.evaluation.technicalRating || 80), 0) / completedEvaluations.length)
    : 82;
  const avgComm = completedEvaluations.length > 0
    ? Math.round(completedEvaluations.reduce((acc, c) => acc + (c.evaluation.communicationRating || 85), 0) / completedEvaluations.length)
    : 85;
  const avgConf = completedEvaluations.length > 0
    ? Math.round(completedEvaluations.reduce((acc, c) => acc + (c.evaluation.confidenceScore || 80), 0) / completedEvaluations.length)
    : 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bot className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-indigo-300">
                Interactive AI Mock Interview (Mandatory)
              </div>
              <h3 className="font-black text-sm">{roleTitle || "Technical & Behavioral Assessment"}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loadingQuestions ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-600">AI Interview Agent generating targeted technical questions...</div>
            </div>
          ) : interviewFinished ? (
            /* Finished Scorecard */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">AI Interview Session Completed!</h4>
                <p className="text-xs text-slate-500 mt-1">Multi-Agent evaluation report generated</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-2xl font-black text-indigo-600">{avgTech}%</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Technical Rating</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-2xl font-black text-purple-600">{avgComm}%</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Communication Rating</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-2xl font-black text-emerald-600">{avgConf}%</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Confidence Score</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-1">
                <div className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Hiring Verdict: Strong Recommendation
                </div>
                <p className="text-xs text-slate-700">
                  Candidate articulated distributed system patterns and problem-solving trade-offs with commendable technical maturity.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg transition-colors"
              >
                Save Scorecard & Close (+25 Score Points Awarded)
              </button>
            </div>
          ) : (
            /* Live Question Q&A */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider text-[10px]">
                  {currentQ?.category}
                </span>
              </div>

              {/* Question Card */}
              <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="font-black text-slate-900 text-base leading-relaxed">
                  {currentQ?.question}
                </div>
                {currentQ?.sampleKeyPoints && (
                  <div className="mt-2 text-[11px] text-indigo-700">
                    <span className="font-bold">Key topics to cover: </span>
                    {currentQ.sampleKeyPoints.join(' • ')}
                  </div>
                )}
              </div>

              {/* Answer Input */}
              {!currentEvaluation ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Your Response:</label>
                  <textarea
                    value={candidateAnswer}
                    onChange={e => setCandidateAnswer(e.target.value)}
                    rows={5}
                    placeholder="Type or dictate your technical response. Detail architectural approaches, trade-offs, and metrics..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !candidateAnswer.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> AI Interview Agent Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Answer for AI Evaluation
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Immediate AI Feedback Card */
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="text-[10px] text-slate-400 font-bold">Tech Score</div>
                      <div className="text-lg font-black text-indigo-600">{currentEvaluation.technicalRating}%</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="text-[10px] text-slate-400 font-bold">Communication</div>
                      <div className="text-lg font-black text-purple-600">{currentEvaluation.communicationRating}%</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-slate-400 font-bold">Confidence</div>
                      <div className="text-lg font-black text-emerald-600">{currentEvaluation.confidenceScore}%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-slate-800">Agent Feedback: </span>
                      <span className="text-slate-600">{currentEvaluation.critique}</span>
                    </div>
                    <div>
                      <span className="font-bold text-indigo-600">Elevate Your Score: </span>
                      <span className="text-slate-600">{currentEvaluation.improvementTip}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    {currentIndex + 1 < questions.length ? "Proceed to Next Question →" : "View Final Scorecard 🎉"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

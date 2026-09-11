'use client';

import { useState } from 'react';
import * as api from '../../lib/api';
import { Upload, FileText, Sparkles, CheckCircle, AlertTriangle, ShieldCheck, Cpu, TrendingUp, Award, Layers } from 'lucide-react';

export default function PPTAnalyzerView() {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleDeckSelected, setSampleDeckSelected] = useState(false);

  const sampleDeckText = `
Slide 1: Autonomous Multi-Agent DevOps SRE Platform (GhostOperator)
Problem: Cloud microservice outages cause $300k/hr downtime. Manual incident triage takes 45 minutes on average.
Solution: An autonomous swarm of 6 specialized AI agents that monitor Prometheus alerts, inspect distributed traces, diagnose root causes, and submit verified GitOps rollback PRs.
Technical Architecture:
- Framework: Python, FastAPI, LangGraph, vLLM
- Embeddings: Sentence-Transformers with FAISS vector search
- Telemetry: OpenTelemetry, Kafka streaming, PostgreSQL
- Security: Zero-trust eBPF container sandbox
Market & Business Impact:
- Target Market: 45,000 mid-to-large engineering teams running Kubernetes
- Total Addressable Market (TAM): $6.8 Billion
- Pricing: $49/node/mo SaaS
- Feasibility: Working MVP deployed across 3 pilot Kubernetes clusters reducing MTTR by 82%.
`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSampleDeckSelected(false);
      triggerAnalysis(file);
    }
  };

  const triggerAnalysis = async (file?: File) => {
    setAnalyzing(true);
    try {
      let payload: any = {};
      if (file) {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const b64 = await base64Promise;
        payload = {
          fileName: file.name,
          base64Data: b64,
          isPptx: file.name.endsWith('.pptx') || file.name.endsWith('.ppt')
        };
      } else {
        payload = {
          fileName: "GhostOperator_Architecture_PitchDeck.pptx",
          textContent: sampleDeckText,
          isPptx: false
        };
      }

      const res = await api.analyzePPT(payload);
      setReport(res);
    } catch (err) {
      console.error('PPT Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSampleDeck = () => {
    setSampleDeckSelected(true);
    setSelectedFile(null);
    triggerAnalysis();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Presentation & Pitch Intelligence (Mandatory)
            </div>
            <h2 className="text-2xl font-black tracking-tight">AI PPT Analyzer & Presentation Intelligence</h2>
            <p className="text-purple-200/80 text-sm mt-1 max-w-2xl">
              Upload candidate project presentations or startup pitch decks (.pptx / .pdf). Automatically evaluates problem understanding,
              technical depth, commercial feasibility, and detects AI-generated content.
            </p>
          </div>
          <button
            onClick={loadSampleDeck}
            disabled={analyzing}
            className="px-5 py-3 bg-purple-600/50 hover:bg-purple-600 border border-purple-400/40 text-white rounded-2xl font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
          >
            ⚡ Test with Sample Architecture Pitch
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-purple-50/30">
          <input
            type="file"
            accept=".pptx,.ppt,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-base font-black text-slate-800">
            {selectedFile ? selectedFile.name : "Click or drag & drop a PPT / PDF presentation"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Supports PowerPoint (.pptx, .ppt) and PDF slide decks up to 50MB</p>
        </label>
      </div>

      {/* Loading state */}
      {analyzing && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-base font-black text-slate-900">AI Presentation Agent Analyzing Slides...</div>
          <p className="text-xs text-slate-500">Evaluating technical feasibility, business potential, and scanning for AI-generated text.</p>
        </div>
      )}

      {/* Report Dashboard */}
      {report && !analyzing && (
        <div className="space-y-6">
          {/* Top Pitch Scores Meter */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-purple-600">{report.overallPitchScore} / 100</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Overall Pitch Score</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-indigo-600">{report.innovationScore}%</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Innovation Score</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-emerald-600">{report.technicalFeasibilityScore}%</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Technical Feasibility</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-blue-600">{report.businessPotentialScore}%</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Business Potential</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-amber-600">{report.presentationQualityScore}%</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Presentation Quality</div>
            </div>
          </div>

          {/* AI Content Detection Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">AI Content & Plagiarism Scan</div>
                <div className="text-base font-black text-slate-900">
                  {report.aiContentDetection?.verdict || "Authentic / Human-crafted"}
                </div>
                <div className="text-xs text-slate-600">{report.aiContentDetection?.explanation}</div>
              </div>
            </div>
            <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <div className="text-xs font-bold text-indigo-400">AI Likelihood</div>
              <div className="text-xl font-black text-indigo-700">{report.aiContentDetection?.aiLikelihoodPercent || 15}%</div>
            </div>
          </div>

          {/* Detailed Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Executive Summary & Architecture */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Presentation Summary
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{report.executiveSummary}</p>
              </div>
              {report.technicalArchitectureNotes && (
                <div>
                  <h4 className="text-xs font-black text-purple-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> Technical Depth & Architecture Notes
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{report.technicalArchitectureNotes}</p>
                </div>
              )}
            </div>

            {/* Strengths & Improvement Suggestions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Presentation Strengths
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {report.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Recommendations for Pitch Deck Improvement
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {report.areasForImprovement?.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
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

"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { X, Code2, PlayCircle, Loader2 } from "lucide-react";

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface CodeEditorProps {
  question: CodingQuestion;
  onSubmit: (code: string) => void;
  onClose?: () => void;
}

export default function CodeEditor({ question, onSubmit, onClose }: CodeEditorProps) {
  const [code, setCode] = useState(question.starterCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "Medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "Hard": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-stone-400 bg-stone-400/10 border-stone-400/20";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      
      // Move cursor after inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(code);
      setIsSubmitting(false);
    }, 2000);
  };

  // Generate an array of line numbers based on the code's newline count
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  return (
    <div className="w-full h-full bg-[#1e1e1e] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-stone-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-[#333333]">
        <div className="flex items-center space-x-3 text-stone-300">
          <Code2 className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold">{question.title}</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Description */}
        <div className="w-full md:w-1/3 bg-[#1e1e1e] border-r border-[#333333] p-6 overflow-y-auto custom-scrollbar text-stone-300 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {question.language}
            </span>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none mt-4">
            <p className="whitespace-pre-wrap leading-relaxed text-stone-300">
              {question.description}
            </p>
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#1e1e1e] relative">
          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers */}
            <div className="w-12 bg-[#1e1e1e] border-r border-[#333333] text-right py-4 pr-2 text-[#858585] font-mono text-sm select-none overflow-hidden">
              {lineNumbers.map(n => (
                <div key={n} className="leading-6">{n}</div>
              ))}
            </div>
            
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm leading-6 resize-none focus:outline-none whitespace-pre overflow-y-auto custom-scrollbar"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}
            />
          </div>
        </div>
      </div>

      {/* Footer Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-t border-[#333333]">
        <div className="flex items-center text-sm text-[#858585] font-mono">
          <span>{question.language.toLowerCase()}</span>
          <span className="mx-3">•</span>
          <span>UTF-8</span>
          <span className="mx-3">•</span>
          <span>Spaces: 2</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {onClose && (
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-md transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

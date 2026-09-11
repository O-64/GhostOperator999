"use client";
import Image from 'next/image';
import { useState } from 'react';
import DragAndDropUpload from '@/components/DragAndDropUpload';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

export default function DemoPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [presFile, setPresFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const handleAnalyze = () => {
    if (!resumeFile && !presFile) return;
    setAnalysis('');
    // simulate processing delay
    setTimeout(() => {
      const mockResult = {
        resumeScore: Math.floor(Math.random() * 100),
        presScore: Math.floor(Math.random() * 100),
        insights: 'Great match for AI‑driven roles!'
      };
      setAnalysis(JSON.stringify(mockResult, null, 2));
    }, 2000);
  };

  const handleGitHubConnect = () => {
    setShowGitHubModal(true);
  };

  const closeModal = () => setShowGitHubModal(false);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF9E5] to-[#FFF3C4] flex flex-col items-center py-12 p-4">
      <div className="max-w-4xl w-full bg-white/30 backdrop-blur-lg rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Interactive Demo</h1>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <DragAndDropUpload label="Resume (PDF/Docx)" onFileSelect={setResumeFile} />
          <DragAndDropUpload label="Presentation (PPTX)" onFileSelect={setPresFile} />
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={handleAnalyze} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Analyze Content
          </button>
          <button onClick={handleGitHubConnect} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
            Connect GitHub
          </button>
        </div>
        {analysis && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap">{analysis}</pre>
        )}
      </div>
      {showGitHubModal && (
        <Modal title="GitHub Connection" onClose={closeModal}>
          <p className="mb-4">To continue, please <a href="/candidate/signup" className="text-indigo-600 underline">sign up as a Candidate</a> or <a href="/recruiter/signup" className="text-indigo-600 underline">as a Recruiter</a>.</p>
          <button onClick={closeModal} className="px-3 py-1 bg-indigo-600 text-white rounded">Close</button>
        </Modal>
      )}
      {showToast && <Toast message="Demo already used!" onClose={() => setShowToast(false)} />}
    </section>
  );
}

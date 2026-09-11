'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { FeatureGrids } from '../components/FeatureGrids';
import { AiMatchSimulator } from '../components/AiMatchSimulator';
import { Architecture } from '../components/Architecture';
import { RolePortalsPreview } from '../components/RolePortalsPreview';
import { MetricsAndTestimonials } from '../components/MetricsAndTestimonials';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { User, UserRole } from '../types';
import { Sparkles, CheckCircle2, X, Briefcase, UserCheck, LogOut, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<'candidate' | 'recruiter'>('recruiter');
  const [activePortalModal, setActivePortalModal] = useState<'candidate' | 'recruiter' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', role: 'candidate' | 'recruiter' = 'candidate') => {
    if (role === 'recruiter') {
      router.push('/auth/recruiter');
    } else {
      router.push('/auth/candidate');
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name}! Session active as ${loggedInUser.role.toUpperCase()}.`);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePortalModal(null);
    showToast('Logged out of demo session successfully.');
  };

  const handleOpenDemoPortal = (role: 'candidate' | 'recruiter') => {
    setActivePortalModal(role);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen dim-yellow-overlay text-stone-900 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      
      {/* Header Navigation */}
      <Navbar
        userRole={user ? user.role : null}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenDemoPortal={handleOpenDemoPortal}
      />

      {/* Main Single Page Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onExploreSimulator={() => {
            setActiveSection('simulator');
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Feature Grids */}
        <FeatureGrids />

        {/* Interactive AI Match Simulator - show only for candidates or unauthenticated */}
        {(!user || user.role === 'candidate') && <AiMatchSimulator />}

        {/* Modular Architecture Breakdown (Next.js SPA vs Python AI Agents) */}
        <Architecture />

        {/* Role Portals Preview */}
        <RolePortalsPreview onOpenAuth={handleOpenAuth} />

        {/* Metrics & Testimonials */}
        <MetricsAndTestimonials />

        {/* Product Advertisement Pricing */}
        <Pricing onOpenAuth={handleOpenAuth} />

      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Seamless Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Active User Portal Modal (When logged in or requested) */}
      {activePortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-4xl w-full p-8 rounded-3xl border-2 border-amber-400 shadow-2xl relative text-left space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActivePortalModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-200 pb-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-stone-950">
                {activePortalModal === 'recruiter' ? <Briefcase className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700">
                  ACTIVE DEMO SESSION PORTAL
                </span>
                <h3 className="text-2xl font-black text-stone-900">
                  {activePortalModal === 'recruiter' ? 'Recruiter Command Dashboard' : 'Candidate Skill & Vector Workspace'}
                </h3>
              </div>
            </div>

            {activePortalModal === 'recruiter' ? (
              /* Detailed Recruiter Interactive Workspace */
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'} className="w-10 h-10 rounded-full border border-amber-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">{user?.name || 'Sarah Jenkins'}</h4>
                      <p className="text-xs text-stone-600">{user?.title || 'Head of Talent Acquisition'} • {user?.companyOrTarget || 'Nexus AI Software'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
                    RECRUITER AUTHENTICATED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-3">
                    <h5 className="text-xs font-bold text-stone-900 uppercase">Active Engineering Requisitions</h5>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-stone-50 rounded-xl flex justify-between">
                        <span>Staff AI / ML Engineer</span>
                        <strong className="text-amber-700">98% Top Match</strong>
                      </div>
                      <div className="p-2.5 bg-stone-50 rounded-xl flex justify-between">
                        <span>Principal Full Stack Architect</span>
                        <strong className="text-amber-700">95% Top Match</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-950 text-amber-400 p-5 rounded-2xl border border-amber-500/30 space-y-3 font-mono text-xs">
                    <div className="text-stone-400 text-[10px]">CONNECTED PYTHON BACKEND SERVICE:</div>
                    <p className="text-emerald-400">✓ FastAPI Router: https://api.aitalent.io/v1</p>
                    <p className="text-emerald-400">✓ Vector Search Index: FAISS 1536-dim</p>
                    <p className="text-emerald-400">✓ Compliance Engine: NYC LL144 Passed</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Detailed Candidate Interactive Workspace */
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} className="w-10 h-10 rounded-full border border-emerald-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">{user?.name || 'Alexandra Vance'}</h4>
                      <p className="text-xs text-stone-600">{user?.title || 'Staff AI/ML Engineer'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
                    CANDIDATE AUTHENTICATED
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-3">
                  <h5 className="text-xs font-bold text-stone-900 uppercase">Your Matched Opportunities</h5>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-stone-900">Lead AI Systems Engineer @ FinTech Global</strong>
                      <p className="text-stone-500 text-[11px]">Salary Benchmark: $240k - $280k • Remote</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg">98% Match</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-amber-200">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-300"
              >
                Log Out Session
              </button>
              <button
                onClick={() => setActivePortalModal(null)}
                className="px-6 py-2.5 bg-amber-500 text-stone-950 text-xs font-extrabold rounded-xl hover:bg-amber-600"
              >
                Close Portal View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

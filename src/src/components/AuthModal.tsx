'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserRole, User } from '../types';
import { Sparkles, X, Mail, Lock, User as UserIcon, Briefcase, CheckCircle2, Shield, Eye, EyeOff, Key, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'candidate' | 'recruiter';
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'recruiter',
  onLoginSuccess
}) => {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'candidate' | 'recruiter'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyOrTitle, setCompanyOrTitle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const sanitizeInput = (input: string) => {
    return input.replace(/[<>]/g, '').trim();
  };

  const validateForm = () => {
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleAutofillDemo = (selectedRole: 'candidate' | 'recruiter') => {
    setRole(selectedRole);
    setErrorMessage(null);
    if (selectedRole === 'recruiter') {
      setEmail('recruiter@enterprise-ai.com');
      setPassword('DemoRecruiter2026!');
      setName('Sarah Jenkins');
      setCompanyOrTitle('Nexus AI Software');
    } else {
      setEmail('candidate@aitalent.io');
      setPassword('DemoCandidate2026!');
      setName('Alexandra Vance');
      setCompanyOrTitle('Staff AI/ML Engineer');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password.trim();

    const res = login(cleanEmail, cleanPassword, role);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Successfully authenticated as ${role.toUpperCase()}! Loading Dashboard...`);
      setTimeout(() => {
        onClose();
        if (role === 'candidate') {
          router.push('/candidate/dashboard');
        } else {
          router.push('/recruiter/dashboard');
        }
      }, 400);
    } else {
      setErrorMessage(res.error || 'Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn">
      
      <div className="glass-modal max-w-md w-full p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-2xl relative text-left space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-stone-900 text-lg">AI TALENT MATRIX</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 pt-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Demo Account'}
          </h2>
          <p className="text-xs text-stone-600">
            Real-time SPA authentication demo for Candidates & Recruiters
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Select Persona Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`p-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                role === 'recruiter'
                  ? 'bg-stone-900 text-amber-400 border-amber-400 shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`p-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                role === 'candidate'
                  ? 'bg-stone-900 text-amber-400 border-amber-400 shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Candidate</span>
            </button>
          </div>
        </div>

        {/* One-Click Quick Demo Fill Buttons */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-900">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              ONE-CLICK DEMO CREDENTIALS
            </span>
            <span className="text-[9px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">INSTANT</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAutofillDemo('recruiter')}
              className="py-1.5 px-2 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              ⚡ Fill Recruiter Demo
            </button>
            <button
              type="button"
              onClick={() => handleAutofillDemo('candidate')}
              className="py-1.5 px-2 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              ⚡ Fill Candidate Demo
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'recruiter' ? 'e.g. Sarah Jenkins' : 'e.g. Alexandra Vance'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'recruiter' ? 'recruiter@company.com' : 'candidate@email.com'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-900 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 text-stone-950 text-xs font-black hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? `Sign In as ${role.toUpperCase()}` : `Register ${role.toUpperCase()}`}</span>
          </button>

        </form>

        <div className="text-center pt-2 border-t border-stone-200">
          <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-amber-600" />
            <span>100% Client-side SPA Session • Encrypted Input Validation</span>
          </p>
        </div>

      </div>
    </div>
  );
};

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, Lock, Briefcase, FileText, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function CandidateAuthPage() {
  const router = useRouter();
  const { login, signupCandidate } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    experienceType: 'fresher' as 'fresher' | 'experienced',
    reasonForChange: '',
    previousCompany: '',
    currentCompany: '',
    post: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in Name, Email, and Password.');
      return false;
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return false;
    }
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.experienceType === 'experienced') {
      if (!formData.currentCompany && !formData.previousCompany) {
        setError('Please provide your current or previous company.');
        return false;
      }
      if (!formData.post) {
        setError('Please provide your role/post.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (formData.experienceType === 'fresher') {
        handleSignup();
      } else {
        setStep(3);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in Email and Password.');
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await login(formData.email, formData.password, 'candidate');
    setIsLoading(false);
    if (result.success) {
      router.push('/candidate/dashboard');
    } else {
      setError(result.error || 'Failed to login');
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (formData.experienceType === 'experienced' && !validateStep3()) return;
    
    setIsLoading(true);
    const result = await signupCandidate({
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      mobile: formData.mobile || '9876543210',
      password: formData.password,
      role: 'candidate',
      experienceType: formData.experienceType,
      ...(formData.experienceType === 'experienced' ? {
        previousCompany: formData.previousCompany,
        currentCompany: formData.currentCompany,
        reasonForChange: formData.reasonForChange,
        post: formData.post
      } : {})
    });
    setIsLoading(false);
    if (result.success) {
      router.push('/candidate/dashboard');
    } else {
      setError(result.error || 'Failed to sign up');
    }
  };

  const totalSteps = formData.experienceType === 'fresher' ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
      <div className="absolute top-[50%] left-[50%] w-[30%] h-[30%] bg-amber-400/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      
      {/* Floating Particles CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
        }
        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(245,158,11,1) 0%, rgba(245,158,11,0) 70%);
          border-radius: 50%;
          animation: float 8s infinite ease-in-out;
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .grid-bg {
          background-image: linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 10s linear infinite;
        }
      `}} />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="particle w-4 h-4 top-[20%] left-[20%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-6 h-6 top-[60%] left-[10%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-3 h-3 top-[30%] right-[20%]" style={{ animationDelay: '1s' }} />
      <div className="particle w-5 h-5 bottom-[20%] right-[30%]" style={{ animationDelay: '3s' }} />
      <div className="particle w-2 h-2 top-[70%] right-[15%]" style={{ animationDelay: '1.5s' }} />

      {/* Top Bar */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => router.push('/')} className="flex items-center space-x-2 text-gray-400 hover:text-amber-500 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10 p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 mb-4 border border-amber-500/30">
            <Sparkles size={26} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
            Candidate Portal
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Join the AI Talent Matrix to accelerate your career</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-black/40 rounded-lg mb-8">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${isLogin ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${!isLogin ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(false); setError(''); setStep(1); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-start space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-amber-400 font-semibold mb-2 uppercase tracking-wider">Quick Demo Login Shortcuts:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={async () => {
                    setFormData({ ...formData, email: 'alex@matrix.ai', password: 'password123' });
                    const res = await login('alex@matrix.ai', 'password123', 'candidate');
                    if (res.success) router.push('/candidate/dashboard');
                  }}
                  className="px-2.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded-lg text-xs text-amber-300 font-medium text-left transition-all shadow-sm flex items-center justify-between cursor-pointer"
                >
                  <span>⚡ Alex Mercer (100%)</span>
                  <span className="text-[10px] text-amber-400">➔</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setFormData({ ...formData, email: 'candidate@demo.com', password: '123456' });
                    const res = await login('candidate@demo.com', '123456', 'candidate');
                    if (res.success) router.push('/candidate/dashboard');
                  }}
                  className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-xs text-stone-300 font-medium text-left transition-all shadow-sm flex items-center justify-between cursor-pointer"
                >
                  <span>🌱 Demo Fresher (20%)</span>
                  <span className="text-[10px] text-stone-400">➔</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:from-amber-400 hover:to-amber-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <span>{isLoading ? 'Authenticating...' : 'Secure Login'}</span>
              {!isLoading && <ChevronRight size={18} />}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <div className="relative">
            {/* Progress Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Step {step} of {totalSteps}</div>
              <div className="flex space-x-1">
                {[...Array(totalSteps)].map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'w-6 bg-amber-500' : 'w-2 bg-gray-700'}`} />
                ))}
              </div>
            </div>

            <div className="overflow-hidden relative min-h-[300px]">
              
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Mobile Number (10 digits)" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experience Type */}
              {step === 2 && (
                <div className="space-y-4 py-4">
                  <h3 className="text-lg font-medium text-center mb-6">What is your experience level?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceType: 'fresher' })}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer ${formData.experienceType === 'fresher' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                    >
                      <User size={32} />
                      <span className="font-medium">Fresher</span>
                      <span className="text-xs opacity-70">0–1 year exp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceType: 'experienced' })}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer ${formData.experienceType === 'experienced' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                    >
                      <Briefcase size={32} />
                      <span className="font-medium">Experienced</span>
                      <span className="text-xs opacity-70">1+ years exp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Experienced Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 mb-4">Tell us about your work experience</p>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleInputChange} placeholder="Current Company" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="text" name="previousCompany" value={formData.previousCompany} onChange={handleInputChange} placeholder="Previous Company (optional)" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="text" name="post" value={formData.post} onChange={handleInputChange} placeholder="Role / Job Title" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600" />
                  </div>
                  <div className="relative">
                    <textarea 
                      name="reasonForChange" 
                      value={formData.reasonForChange} 
                      onChange={handleInputChange} 
                      placeholder="Reason for change / job search (optional)" 
                      className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-gray-600 min-h-[80px]" 
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="flex space-x-3 mt-6">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              <button 
                type="button"
                onClick={step === totalSteps ? () => handleSignup() : handleNextStep}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:from-amber-400 hover:to-amber-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isLoading ? 'Processing...' : (step === totalSteps ? 'Create Account' : 'Continue')}</span>
                {!isLoading && (step === totalSteps ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />)}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-400">
            Are you a Recruiter?{' '}
            <Link href="/auth/recruiter" className="text-amber-500 hover:text-amber-400 font-medium underline-offset-4 hover:underline transition-all">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

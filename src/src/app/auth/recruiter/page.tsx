"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Building, Lock, Briefcase, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function RecruiterAuthPage() {
  const router = useRouter();
  const { login, signupRecruiter } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateSignup = () => {
    if (!formData.name || !formData.email || !formData.company || !formData.title || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await login(formData.email, formData.password, 'recruiter');
    setIsLoading(false);
    if (result.success) {
      router.push('/recruiter/dashboard');
    } else {
      setError(result.error || 'Failed to login');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsLoading(true);
    setError('');
    const result = await signupRecruiter({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      title: formData.title,
      password: formData.password,
      role: 'recruiter'
    });
    setIsLoading(false);
    if (result.success) {
      router.push('/recruiter/dashboard');
    } else {
      setError(result.error || 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/15 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-violet-500/10 rounded-full blur-[80px]" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-blue {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.6; }
        }
        .particle-blue {
          position: absolute;
          background: radial-gradient(circle, rgba(99,102,241,1) 0%, rgba(99,102,241,0) 70%);
          border-radius: 50%;
          animation: float-blue 7s infinite ease-in-out;
        }
        @keyframes gridMoveBlue {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .grid-bg-blue {
          background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMoveBlue 10s linear infinite;
        }
      `}} />
      <div className="absolute inset-0 grid-bg-blue opacity-50" />
      <div className="particle-blue w-4 h-4 top-[15%] left-[25%]" style={{ animationDelay: '0s' }} />
      <div className="particle-blue w-7 h-7 top-[70%] left-[15%]" style={{ animationDelay: '2.5s' }} />
      <div className="particle-blue w-3 h-3 top-[35%] right-[25%]" style={{ animationDelay: '1s' }} />
      <div className="particle-blue w-5 h-5 bottom-[15%] right-[20%]" style={{ animationDelay: '4s' }} />

      {/* Top Bar */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => router.push('/')} className="flex items-center space-x-2 text-gray-400 hover:text-indigo-400 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10 p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30">
            <Building size={26} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-500">
            Enterprise Portal
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Discover top AI-verified talent for your organization</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-black/40 rounded-lg mb-8">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Log In
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

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
              <label className="text-xs text-gray-400 uppercase font-semibold">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                  placeholder="name@company.com"
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
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-indigo-400 font-semibold mb-2 uppercase tracking-wider">Quick Demo Recruiter Shortcuts:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, email: 'recruiter@matrix.ai', password: 'password123' });
                    const res = login('recruiter@matrix.ai', 'password123', 'recruiter');
                    if (res.success) router.push('/recruiter/dashboard');
                  }}
                  className="px-2.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 rounded-lg text-xs text-indigo-300 font-medium text-left transition-all shadow-sm flex items-center justify-between"
                >
                  <span>🏢 Sarah (Nexus AI)</span>
                  <span className="text-[10px] text-indigo-400">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, email: 'recruiter@company.com', password: '123456' });
                    const res = login('recruiter@company.com', '123456', 'recruiter');
                    if (res.success) router.push('/recruiter/dashboard');
                  }}
                  className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-xs text-stone-300 font-medium text-left transition-all shadow-sm flex items-center justify-between"
                >
                  <span>💼 Enterprise Recruiter</span>
                  <span className="text-[10px] text-stone-400">➔</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 hover:from-indigo-400 hover:to-indigo-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <span>{isLoading ? 'Authenticating...' : 'Secure Login'}</span>
              {!isLoading && <ChevronRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Work Email" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company Name" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm" className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Shield size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-300">Enterprise accounts get access to AI-verified candidate profiles, skill analytics, and smart job matching.</p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 hover:from-indigo-400 hover:to-indigo-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <span>{isLoading ? 'Processing...' : 'Create Account'}</span>
              {!isLoading && <CheckCircle2 size={18} />}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-400">
            Looking for a job?{' '}
            <Link href="/auth/candidate" className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline transition-all">
              Candidate Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

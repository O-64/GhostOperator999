'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../lib/api';
import { RecruiterUser } from '../../../types';
import {
  ArrowLeft, Building2, User, Mail, Globe, MapPin, Users, Briefcase,
  CheckCircle, Sparkles, LogOut, Save, ShieldCheck, Target, TrendingUp,
  FileText, Award
} from 'lucide-react';

export default function RecruiterProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateRecruiterProfile } = useAuth();

  const [form, setForm] = useState<Partial<RecruiterUser>>({
    name: '',
    email: '',
    title: '',
    company: '',
    industry: '',
    teamSize: '10-50',
    website: '',
    headquarters: '',
    companyDescription: '',
  });

  const [toast, setToast] = useState('');
  const [stats, setStats] = useState({ jobsCount: 0, candidatesContacted: 0, hiredCount: 0 });

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'recruiter') {
        router.push('/auth/recruiter');
        return;
      }
      const rec = user as RecruiterUser;
      setForm({
        name: rec.name || '',
        email: rec.email || '',
        title: rec.title || '',
        company: rec.company || '',
        industry: rec.industry || 'Information Technology',
        teamSize: rec.teamSize || '50-200',
        website: rec.website || `https://www.${rec.company.toLowerCase().replace(/[^a-z]/g, '') || 'company'}.com`,
        headquarters: rec.headquarters || 'Bangalore, India',
        companyDescription: rec.companyDescription || `${rec.company} is a forward-thinking technology company hiring top engineering talent via AI Talent Matrix.`,
      });

      // Load stats
      api.listJobs(rec.id).then(jobs => {
        api.listApplications().then(apps => {
          const hired = apps.filter(a => a.stage === 'Hired').length;
          setStats({
            jobsCount: jobs.length,
            candidatesContacted: apps.length,
            hiredCount: hired,
          });
        });
      }).catch(() => {});
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateRecruiterProfile(form);
      setToast('Company profile saved successfully!');
      setTimeout(() => setToast(''), 3500);
    } catch {
      setToast('Failed to save profile');
      setTimeout(() => setToast(''), 3500);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rec = user as RecruiterUser;

  return (
    <div className="min-h-screen bg-[#f1f5fb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" /> <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-indigo-950 border-b border-indigo-900 shadow-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold hidden sm:block">Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-indigo-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-white text-sm tracking-tight hidden sm:block">AI TALENT MATRIX</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="p-2 bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors border border-indigo-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-black shrink-0">
                <Building2 className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black">{form.company || 'Your Company'}</h1>
                  <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Employer
                  </span>
                </div>
                <p className="text-indigo-200 text-sm mt-1">{form.title || 'Recruiter'} · {rec.email}</p>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">ID: {rec.id}</p>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
              <div className="text-center">
                <div className="text-xl font-black text-indigo-200">{stats.jobsCount}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-semibold">Active Jobs</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-black text-indigo-200">{stats.candidatesContacted}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-semibold">In Pipeline</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-black text-emerald-400">{stats.hiredCount}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-semibold">Hired</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal & Account Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Personal Account
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Email is tied to your account login.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Designation</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Technical Recruiter"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="font-black text-slate-900 text-sm">Quick Shortcuts</h3>
              <button
                type="button"
                onClick={() => router.push('/recruiter/dashboard')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 transition-colors flex items-center justify-between"
              >
                <span>Go to Recruiter Portal</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Middle/Right Column: Company Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Company Profile Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="e.g. Fintech, Artificial Intelligence"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Size</label>
                  <select
                    name="teamSize"
                    value={form.teamSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1-10">1-10 employees (Startup)</option>
                    <option value="10-50">10-50 employees</option>
                    <option value="50-200">50-200 employees</option>
                    <option value="200-1000">200-1000 employees</option>
                    <option value="1000+">1000+ employees (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Website</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headquarters Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="headquarters"
                    value={form.headquarters}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India / San Francisco, CA"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Overview / Description</label>
                <textarea
                  name="companyDescription"
                  value={form.companyDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your company culture, mission, tech stack, and what makes working here great..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200"
                >
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole, User } from '../types';
import { Sparkles, User as UserIcon, Briefcase, LogIn, UserPlus, LogOut, Menu, X, Shield, Cpu, UserCheck } from 'lucide-react';

interface NavbarProps {
  userRole: UserRole;
  user: User | null;
  onOpenAuth: (mode: 'login' | 'signup', defaultRole?: 'candidate' | 'recruiter') => void;
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenDemoPortal: (role: 'candidate' | 'recruiter') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  user,
  onOpenAuth,
  onLogout,
  activeSection,
  setActiveSection,
  onOpenDemoPortal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'simulator', label: 'AI Matcher' },
    { id: 'architecture', label: 'How It Works' },
    { id: 'demo-portal', label: 'Demo' },
    { id: 'pricing', label: 'Pricing' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="glass-panel border-b border-amber-200/60 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">AI TALENT</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  MATRIX
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 tracking-wide">
                AI Talent Intelligence Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1.5 rounded-full border border-amber-200/50">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeSection === link.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/30'
                    : 'text-stone-700 hover:text-amber-700 hover:bg-stone-200/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* User State & Auth Actions - Visible on sm and up */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-amber-50/90 p-1.5 pr-4 rounded-full border border-amber-300/80 shadow-xs">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-amber-400 object-cover"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-stone-900 max-w-[110px] truncate">{user.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      user.role === 'recruiter' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">{user.companyOrTarget || user.title}</p>
                </div>
                <button
                  onClick={() => onOpenDemoPortal(user.role)}
                  className="ml-2 text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                >
                  View Portal
                </button>
                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/candidate"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-amber-100/60 border border-stone-300/70 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  Candidate Login
                </Link>
                <Link
                  href="/auth/recruiter"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Post a Job
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle - Visible on sm and below */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-amber-100/70 text-stone-800 border border-amber-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-stone-50/95 border-t border-amber-200 space-y-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold ${
                    activeSection === link.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-amber-100/60 rounded-xl">
                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{user.name} ({user.role})</div>
                      <div className="text-[10px] text-stone-600">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { onOpenDemoPortal(user.role); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold text-center"
                  >
                    Open {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Portal'}
                  </button>
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-bold text-center"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { router.push('/auth/candidate'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    Candidate Login
                  </button>
                  <button
                    onClick={() => { router.push('/auth/recruiter'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Post a Job
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

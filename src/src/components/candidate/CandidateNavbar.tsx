"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Filter, 
  Bell, 
  CheckCircle, 
  ChevronDown, 
  User, 
  LayoutDashboard, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface CandidateNavbarProps {
  candidateName: string;
  candidateId: string;
  profileCompletion: number;
  verifiedBadge: boolean;
  onSearch: (q: string) => void;
}

export default function CandidateNavbar({
  candidateName,
  candidateId,
  profileCompletion,
  verifiedBadge,
  onSearch,
}: CandidateNavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-amber-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group">
            <div className="p-2 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Sparkles className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
            </div>
            <span className="ml-3 font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-amber-700">
              AI TALENT MATRIX
            </span>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-stone-200 rounded-full leading-5 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all sm:text-sm text-stone-900 placeholder-stone-400"
                placeholder="Search jobs, skills, or insights..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:bg-stone-100 rounded-r-full px-2 transition-colors">
                <Filter className="h-4 w-4 text-stone-400 hover:text-amber-600" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => router.push('/candidate/profile')}
              className="hidden sm:flex flex-col items-end cursor-pointer group hover:opacity-90 transition-opacity"
              title="Click to view and complete profile"
            >
              <span className="text-xs text-stone-500 font-medium group-hover:text-amber-600">Profile Score ({profileCompletion}%)</span>
              <div className="w-24 h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <button className="relative p-2 rounded-full text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="relative">
              <button
                className="flex items-center space-x-3 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex flex-col items-end hidden md:flex">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-semibold text-stone-900">{candidateName}</span>
                    {verifiedBadge && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <span className="text-xs text-stone-500 font-mono bg-stone-100 px-1.5 rounded-md mt-0.5">ID: {candidateId}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                  {getInitials(candidateName)}
                </div>
                <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-stone-100 focus:outline-none animate-in fade-in slide-in-from-top-2">
                  <div className="py-2">
                    <Link
                      href="/candidate/profile"
                      className="group flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4 text-stone-400 group-hover:text-amber-500" />
                      My Profile
                    </Link>
                    <Link
                      href="/candidate/dashboard"
                      className="group flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4 text-stone-400 group-hover:text-amber-500" />
                      Dashboard
                    </Link>
                  </div>
                  <div className="py-2">
                    <button
                      className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { setDropdownOpen(false); logout(); router.push('/'); }}
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

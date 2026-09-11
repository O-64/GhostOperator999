'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { CandidateUser, RecruiterUser } from '../types';
import * as api from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';

export type { CandidateUser, RecruiterUser };

export type ActiveUser = CandidateUser | RecruiterUser;

interface AuthContextProps {
  user: ActiveUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'candidate' | 'recruiter') => Promise<{ success: boolean; error?: string }>;
  signupCandidate: (data: Omit<CandidateUser, 'id' | 'profileCompletion' | 'agentAnalysisDone' | 'verifiedBadge' | 'rank' | 'score' | 'skills' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  signupRecruiter: (data: Omit<RecruiterUser, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCandidateProfile: (patch: Partial<CandidateUser>) => Promise<void>;
  updateRecruiterProfile: (patch: Partial<RecruiterUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  signup: (data: Partial<ActiveUser> & { role: 'candidate' | 'recruiter' }) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.get()) {
      setUser(null);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (tokenStorage.get()) {
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string, role: 'candidate' | 'recruiter') => {
    try {
      const loggedIn =
        role === 'candidate'
          ? await api.loginCandidate(email, password)
          : await api.loginRecruiter(email, password);
      setUser(loggedIn);
      return { success: true };
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : 'Failed to login';
      return { success: false, error: message };
    }
  };

  const signupCandidate = async (
    data: Omit<CandidateUser, 'id' | 'profileCompletion' | 'agentAnalysisDone' | 'verifiedBadge' | 'rank' | 'score' | 'skills' | 'createdAt'>
  ) => {
    try {
      const created = await api.signupCandidate({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        experienceType: data.experienceType,
        previousCompany: data.previousCompany,
        currentCompany: data.currentCompany,
        reasonForChange: data.reasonForChange,
        post: data.post,
      });
      setUser(created);
      return { success: true };
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : 'Failed to sign up';
      return { success: false, error: message };
    }
  };

  const signupRecruiter = async (data: Omit<RecruiterUser, 'id' | 'createdAt'>) => {
    try {
      const created = await api.signupRecruiter({
        name: data.name,
        email: data.email,
        password: data.password,
        company: data.company,
        title: data.title,
        industry: data.industry,
        teamSize: data.teamSize,
        website: data.website,
        headquarters: data.headquarters,
        companyDescription: data.companyDescription,
      });
      setUser(created);
      return { success: true };
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : 'Failed to sign up';
      return { success: false, error: message };
    }
  };

  const updateCandidateProfile = async (patch: Partial<CandidateUser>) => {
    if (!user || user.role !== 'candidate') return;
    const updated = await api.updateCandidate(user.id, patch);
    setUser(updated);
  };

  const updateRecruiterProfile = async (patch: Partial<RecruiterUser>) => {
    if (!user || user.role !== 'recruiter') return;
    const updated = await api.updateRecruiter(user.id, patch);
    setUser(updated);
  };

  const logout = () => {
    api.logoutApi();
    setUser(null);
  };

  const signup = (_data: Partial<ActiveUser> & { role: 'candidate' | 'recruiter' }) => {
    // Legacy compat for landing page Navbar — demo-only
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signupCandidate,
        signupRecruiter,
        updateCandidateProfile,
        updateRecruiterProfile,
        refreshUser,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

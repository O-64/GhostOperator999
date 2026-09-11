"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy redirect — new auth is at /auth/candidate
export default function CandidateLoginPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/auth/candidate'); }, [router]);
  return null;
}

"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy redirect — new auth is at /auth/recruiter
export default function RecruiterLoginPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/auth/recruiter'); }, [router]);
  return null;
}

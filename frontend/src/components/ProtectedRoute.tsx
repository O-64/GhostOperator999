// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Props = {
  requiredRole: "candidate" | "recruiter";
  children: React.ReactNode;
};

export const ProtectedRoute = ({ requiredRole, children }: Props) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    } else if (user.role !== requiredRole) {
      // redirect to proper dashboard if logged in with different role
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router, requiredRole]);

  // While redirecting, render nothing
  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

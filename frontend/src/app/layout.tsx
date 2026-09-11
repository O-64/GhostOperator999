import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

// NOTE: Intentionally NOT using next/font/google here. That loader fetches
// font files from Google Fonts at *build time* — if the build machine has
// no internet access (or Google Fonts is slow/blocked), `next build` fails
// outright. Neither `--font-inter` nor `--font-mono` were referenced by any
// CSS/Tailwind config in this project (every `font-mono`/`font-sans` class
// used across components is Tailwind's own built-in utility), so removing
// this loader is a zero-visual-impact change that makes the build fully
// offline-safe — important right before a live presentation.

export const metadata: Metadata = {
  title: "AI Talent Matrix | AI-Powered Recruiter Intelligence Platform",
  description: "The AI recruiter platform that ranks, verifies, and shortlists candidates automatically. Multi-agent resume screening, skill-gap analysis, fraud detection, PPT/pitch intelligence, and hackathon-to-hiring pipelines — built for recruiting teams that want signal, not noise.",
  keywords: ["AI Recruiting Platform", "Recruiter Copilot", "Resume Screening AI", "Multi-Agent Hiring", "Candidate Fraud Detection", "AI Talent Intelligence", "Applicant Tracking System"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
    >
<body className="min-h-full flex flex-col font-sans bg-[#FAF8F3] text-stone-900">
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
    </html>
  );
}

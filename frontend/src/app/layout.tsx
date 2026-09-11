import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AI Talent Matrix | Next-Gen AI Talent Intelligence Platform",
  description: "Autonomous AI-driven recruitment and candidate matching platform featuring Next.js 14 SPA architecture and Python AI microservices. Instant vector matching, skill matrix, and unbiased screening.",
  keywords: ["AI Talent Intelligence", "Autonomous Recruitment Agents", "Python Vector Matching", "Next.js 14 SPA", "Talent Acquisition", "PyTorch AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth`}
    >
<body className="min-h-full flex flex-col font-sans bg-[#FAF8F3] text-stone-900">
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
    </html>
  );
}

"use client";
import Link from 'next/link';
import { useAuth } from "../context/AuthContext";
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/30 backdrop-blur-md shadow-md">
      <Link href="/" className="text-2xl font-bold text-indigo-800">
        AI Talent Matrix
      </Link>
      <nav className="flex items-center space-x-4">
        <Link href="/" className="text-gray-700 hover:text-indigo-600">
          Home
        </Link>
        <Link href="/demo" className="text-gray-700 hover:text-indigo-600">
          Demo
        </Link>
        {user ? (
          <>
            {user.role === 'candidate' && (
              <Link href="/candidate/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
            )}
            {user.role === 'recruiter' && (
              <Link href="/recruiter/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/candidate/login" className="text-gray-700 hover:text-indigo-600">
              Candidate Login
            </Link>
            <Link href="/recruiter/login" className="text-gray-700 hover:text-indigo-600">
              Recruiter Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

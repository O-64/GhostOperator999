import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // All public paths (auth pages, landing, demo)
  const publicPaths = [
    '/',
    '/demo',
    '/auth/candidate',
    '/auth/recruiter',
    '/candidate/login',
    '/candidate/signup',
    '/recruiter/login',
    '/recruiter/signup',
  ];

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Allow all candidate and recruiter routes — session auth is client-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/candidate/:path*', '/recruiter/:path*', '/auth/:path*'],
};

import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value; // fallback for cookie, but we mainly use localStorage
  const url = request.nextUrl.pathname;

  // Public routes (no authentication required)
  const isPublicRoute = ['/login', '/register', '/request-otp', '/verify-otp', '/forgot-password'].includes(url);
  const isResetRoute = url.startsWith('/reset-password/');
  
  // Private routes (require authentication)
  const isPrivateRoute = url.startsWith('/profile') || url.startsWith('/change-password') || url.startsWith('/admin');

  // For this middleware to work with localStorage is tricky; we rely on cookie as well.
  // We'll check cookie 'accessToken' (set by backend) or use a custom cookie.
  // For simplicity, if you want to keep using localStorage, you can disable middleware or skip check.
  // But we assume backend sets httpOnly cookie as well.
  if (isPrivateRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access public routes, redirect to profile
  if (token && (isPublicRoute || isResetRoute)) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/request-otp',
    '/verify-otp',
    '/forgot-password',
    '/reset-password/:path*',
    '/profile/:path*',
    '/change-password',
    '/admin/:path*',
  ],
};
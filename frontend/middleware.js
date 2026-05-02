import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const url = request.nextUrl.pathname;

  // اگر لاگین نیست و به صفحات خصوصی می‌رود → هدایت به لاگین
  if (!token && (url.startsWith('/profile') || url.startsWith('/change-password') || url.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اگر لاگین است و به صفحات auth می‌رود → هدایت به پروفایل
  if (token && (url === '/login' || url === '/register' || url === '/request-otp' || url === '/verify-otp' || url === '/forgot-password')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/request-otp', '/verify-otp', '/forgot-password', '/profile/:path*', '/change-password', '/admin/:path*'],
};
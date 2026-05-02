import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const url = request.nextUrl.pathname;

  const isAuthPage = url === '/login' || url === '/register' || url === '/request-otp' || url === '/verify-otp' || url === '/forgot-password';
  const isPrivatePage = url.startsWith('/profile') || url.startsWith('/change-password') || url.startsWith('/admin');

  // اگر کاربر لاگین نیست و به صفحات خصوصی می‌رود → هدایت به لاگین
  if (!token && (isPrivatePage || url === '/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اگر کاربر لاگین است و به صفحات لاگین/ثبت‌نام می‌رود → هدایت به پروفایل
  if (token && (isAuthPage || url === '/')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/request-otp', '/verify-otp', '/forgot-password', '/profile/:path*', '/change-password', '/admin/:path*'],
};
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // خواندن توکن از کوکی (همان accessToken که بک‌اند ست می‌کند)
  const token = request.cookies.get('accessToken')?.value;
  const url = request.nextUrl.pathname;

  // مسیرهای عمومی (بدون نیاز به لاگین)
  const publicRoutes = [
    '/', '/courses', '/course', '/about', '/contact',
    '/login', '/register', '/forgot-password', '/request-otp',
    '/verify-otp', '/reset-password',
  ];
  const isPublicRoute = publicRoutes.some(route => url === route || url.startsWith(route + '/'));

  // مسیرهای اختصاصی (نیاز به لاگین)
  const protectedRoutes = [
    '/dashboard', '/profile', '/change-password', '/cart', '/checkout',
    '/payment/success', '/payment/cancel', '/instructor', '/admin',
  ];
  const isProtectedRoute = protectedRoutes.some(route => url.startsWith(route));

  // مسیرهای مدیریتی که فقط ادمین/مدرس باید دسترسی داشته باشند – خود صفحات چک نقش می‌کنند
  // اینجا فقط لاگین بودن بررسی می‌شود

  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', url);
    return NextResponse.redirect(redirectUrl);
  }

  // اگر کاربر لاگین است و به صفحه لاگین/ثبت‌نام رفته باشد، به داشبورد هدایت شود
  if (token && (url === '/login' || url === '/register' || url === '/request-otp' || url === '/verify-otp')) {
    return NextResponse.redirect(new URL('/dashboard/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/courses/:path*',
    '/course/:path*',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/forgot-password',
    '/request-otp',
    '/verify-otp',
    '/reset-password/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/change-password',
    '/cart',
    '/checkout',
    '/payment/:path*',
    '/instructor/:path*',
    '/admin/:path*',
  ],
};
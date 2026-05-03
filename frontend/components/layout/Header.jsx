'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ShoppingCart, BookOpen, User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/courses', label: 'دوره‌ها', icon: <BookOpen className="w-4 h-4 ml-1" /> },
    { href: '/about', label: 'درباره ما' },
    { href: '/contact', label: 'تماس با ما' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* لوگو */}
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-xl font-bold text-primary">EduNest</span>
        </Link>

        {/* دسکتاپ: ناوبری */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* دسکتاپ: دکمه‌های کاربر */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || ''} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/my-courses')}>
                  <User className="ml-2 h-4 w-4" /> پنل کاربری
                </DropdownMenuItem>
                {user.role === 'instructor' && (
                  <DropdownMenuItem onClick={() => router.push('/instructor/courses')}>
                    <Settings className="ml-2 h-4 w-4" /> پنل مدرس
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                    <Settings className="ml-2 h-4 w-4" /> پنل ادمین
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="ml-2 h-4 w-4" /> خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">ورود</Button>
              </Link>
              <Link href="/register">
                <Button>ثبت‌نام</Button>
              </Link>
            </>
          )}
        </div>

        {/* دکمه منو موبایل */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* منوی موبایل */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b shadow-lg p-4 flex flex-col gap-4 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <hr />
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  router.push('/dashboard/my-courses');
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-left py-2"
              >
                پنل کاربری
              </button>
              <button onClick={handleLogout} className="text-sm text-left py-2 text-red-600">
                خروج
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">ورود</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">ثبت‌نام</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
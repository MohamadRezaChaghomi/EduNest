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
import { Menu, X, BookOpen, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" dir="rtl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-xl font-bold text-primary">EduNest</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || ''} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
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
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="ml-2 h-4 w-4" /> پنل کاربری
                </DropdownMenuItem>
                {user.role === 'instructor' && (
                  <DropdownMenuItem onClick={() => router.push('/instructor/courses')}>
                    <LayoutDashboard className="ml-2 h-4 w-4" /> پنل مدرس
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="منو"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <hr className="border-border" />
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="bg-primary/10 text-primary">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  router.push('/dashboard/profile');
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-right py-2 text-foreground hover:text-primary transition"
              >
                پنل کاربری
              </button>
              {user.role === 'instructor' && (
                <button
                  onClick={() => {
                    router.push('/instructor/courses');
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-right py-2 text-foreground hover:text-primary transition"
                >
                  پنل مدرس
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    router.push('/admin/users');
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-right py-2 text-foreground hover:text-primary transition"
                >
                  پنل ادمین
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-right py-2 text-destructive hover:text-destructive/80 transition"
              >
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
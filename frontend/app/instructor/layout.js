// app/instructor/layout.js
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { href: '/instructor', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'دوره‌های من', icon: BookOpen },
  { href: '/instructor/courses/new', label: 'دوره جدید', icon: PlusCircle },
  { href: '/instructor/analytics', label: 'آمار فروش', icon: BarChart3 },
];

export default function InstructorLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'instructor' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div className="flex justify-center items-center h-screen">در حال بارگذاری...</div>;
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* سایدبار */}
      <aside className="w-64 bg-white shadow-md sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">پنل مدرس</h2>
          <p className="text-sm text-gray-500">{user.name}</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
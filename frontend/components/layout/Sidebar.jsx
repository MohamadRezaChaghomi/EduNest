'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, LockKeyhole, Users, FileText, BookOpen, ShoppingBag, Ticket } from 'lucide-react';

const navItems = [
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
  { href: '/dashboard/change-password', label: 'تغییر رمز', icon: LockKeyhole },
  { href: '/dashboard/my-courses', label: 'دوره‌های من', icon: BookOpen },
  { href: '/dashboard/tickets', label: 'تیکت‌ها', icon: Ticket },
];

const adminItems = [
  { href: '/admin/users', label: 'مدیریت کاربران', icon: Users },
  { href: '/admin/logs', label: 'گزارش‌ها', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])];

  return (
    <aside className="w-64 border-l border-border bg-muted/10 p-4 h-screen sticky top-16 overflow-y-auto" dir="rtl">
      <nav className="space-y-1">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
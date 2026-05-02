'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/change-password', label: 'Change Password', icon: '🔒' },
];

const adminItems = [
  { href: '/admin/users', label: 'Manage Users', icon: '👥' },
  { href: '/admin/logs', label: 'Audit Logs', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])];

  return (
    <aside className="w-64 border-r bg-muted/10 p-4">
      <nav className="space-y-1">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
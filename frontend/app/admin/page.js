// app/admin/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Star, Ticket } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, reviews: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // فرض کنید یک endpoint برای آمار دارید – اگر ندارید می‌توانید چند درخواست موازی بزنید
        const [users, courses, reviews, tickets] = await Promise.all([
          api.admin.getUsers({ limit: 1 }).then(res => res.total),
          api.courses.getAllAdmin({ limit: 1 }).then(res => res.total),
          api.admin.getPendingReviews?.().then(res => res.total) || 0,
          api.admin.getTickets?.().then(res => res.total) || 0,
        ]);
        setStats({ users, courses, reviews, tickets });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'کاربران', value: stats.users, icon: Users, color: 'bg-blue-500' },
    { title: 'دوره‌ها', value: stats.courses, icon: BookOpen, color: 'bg-green-500' },
    { title: 'نظرات جدید', value: stats.reviews, icon: Star, color: 'bg-yellow-500' },
    { title: 'تیکت‌های باز', value: stats.tickets, icon: Ticket, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">داشبورد مدیریت</h1>
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// app/instructor/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({ coursesCount: 0, studentsCount: 0, totalEarnings: 0, monthlyEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchStats = async () => {
      try {
        // اگر endpoint آمار مدرس در بک‌اند پیاده نشده، می‌توانید از داده‌های واقعی استفاده کنید
        // در اینجا یک fallback نمایشی قرار می‌دهیم
        const data = {
          coursesCount: 5,
          studentsCount: 128,
          totalEarnings: 12500000,
          monthlyEarnings: 3200000,
        };
        if (isMounted.current) setStats(data);
      } catch (err) {
        if (isMounted.current) toast.error('خطا در دریافت آمار');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted.current = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">داشبورد مدرس</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">دوره‌ها</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">دانشجوها</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کل فروش</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} تومان</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">فروش این ماه</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyEarnings.toLocaleString()} تومان</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
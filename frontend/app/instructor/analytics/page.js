// app/instructor/analytics/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorAnalyticsPage() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    coursesSold: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchAnalytics = async () => {
      try {
        // در صورت وجود endpoint واقعی، جایگزین کنید
        const data = {
          totalEarnings: 15750000,
          monthlyEarnings: 4200000,
          coursesSold: 38,
          totalStudents: 156,
        };
        if (isMounted.current) setStats(data);
      } catch (err) {
        if (isMounted.current) toast.error('خطا در دریافت آمار');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchAnalytics();
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
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">آمار فروش و عملکرد</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyEarnings.toLocaleString()} تومان</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">تعداد فروش دوره</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کل دانشجوها</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
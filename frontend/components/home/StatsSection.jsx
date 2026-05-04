'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StatsSection() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    instructors: 0,
    earnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.stats.getSiteStats();
        setStats({
          courses: data.courses || 0,
          students: data.students || 0,
          instructors: data.instructors || 0,
          earnings: data.earnings || 0,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-primary text-primary-foreground" dir="rtl">
        <div className="container mx-auto px-4 text-center">در حال بارگذاری آمار...</div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-primary text-primary-foreground" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">{stats.courses.toLocaleString()}+</div>
            <div className="text-lg opacity-90">دوره آموزشی</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">{stats.students.toLocaleString()}+</div>
            <div className="text-lg opacity-90">دانشجو فعال</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">{stats.instructors.toLocaleString()}+</div>
            <div className="text-lg opacity-90">مدرس مجرب</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">{stats.earnings.toLocaleString()}+</div>
            <div className="text-lg opacity-90">تومان فروش</div>
          </div>
        </div>
      </div>
    </section>
  );
}
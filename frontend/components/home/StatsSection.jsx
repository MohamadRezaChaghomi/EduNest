'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StatsSection() {
  const [stats, setStats] = useState({ courses: 0, students: 0, instructors: 0, earnings: 0 });
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
        // در صورت خطا، می‌توان مقادیر پیش‌فرض را نگه داشت
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null; // یا نمایش اسپینر

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold">{stats.courses}+</div>
            <div className="text-lg opacity-90">دوره آموزشی</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{stats.students}+</div>
            <div className="text-lg opacity-90">دانشجو فعال</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{stats.instructors}+</div>
            <div className="text-lg opacity-90">مدرس مجرب</div>
          </div>
          <div>
            {/* اصلاح: earnings به جای earths */}
            <div className="text-4xl font-bold">{stats.earnings.toLocaleString()}+</div>
            <div className="text-lg opacity-90">تومان فروش</div>
          </div>
        </div>
      </div>
    </section>
  );
}
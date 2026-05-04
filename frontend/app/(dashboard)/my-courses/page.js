// app/dashboard/my-courses/page.js
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const orders = await api.orders.getMyOrders();
        const courseIds = orders.flatMap(order => order.items.map(item => item.course));
        const courseDetails = await Promise.all(
          courseIds.map(id => api.courses.getById(id).catch(() => null))
        );
        setCourses(courseDetails.filter(c => c !== null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
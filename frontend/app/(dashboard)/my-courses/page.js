// app/dashboard/my-courses/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await api.courses.getMyCourses(); // این endpoint باید دوره‌هایی که کاربر در آنها دانشجو است را برگرداند
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (courses.length === 0) return <div>شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function CourseInfo({ course }) {
  const discountPrice = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>مدرس: {course.instructor?.name}</span>
        <span>⭐ {course.ratingAverage || 0} ({course.ratingCount || 0} نظر)</span>
        <span>👥 {course.enrolledCount || 0} دانشجو</span>
        <span>📊 {course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}</span>
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
    </div>
  );
}
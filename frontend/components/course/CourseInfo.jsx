'use client';

import { Badge } from '@/components/ui/badge';

export default function CourseInfo({ course }) {
  const levelMap = {
    beginner: 'مبتدی',
    intermediate: 'متوسط',
    advanced: 'پیشرفته',
  };

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <span>👨‍🏫 مدرس: {course.instructor?.name}</span>
        <span>⭐ {course.ratingAverage?.toFixed(1) || 0} ({course.ratingCount || 0} نظر)</span>
        <span>👥 {course.enrolledCount || 0} دانشجو</span>
        <span>📊 {levelMap[course.level] || course.level}</span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
    </div>
  );
}
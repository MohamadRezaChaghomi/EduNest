// components/home/PopularCourses.jsx
import CourseCard from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PopularCourses({ courses }) {
  if (!courses || courses.length === 0) return null;
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">دوره‌های محبوب</h2>
          <Link href="/courses">
            <Button variant="link">مشاهده همه</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
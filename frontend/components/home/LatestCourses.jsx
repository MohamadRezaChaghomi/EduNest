import CourseCard from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LatestCourses({ courses }) {
  if (!courses?.length) return null;

  return (
    <section className="py-16 bg-muted/30" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-foreground">جدیدترین دوره‌ها</h2>
          <Link href="/courses">
            <Button variant="link" className="text-primary hover:text-primary/80">
              مشاهده همه &larr;
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
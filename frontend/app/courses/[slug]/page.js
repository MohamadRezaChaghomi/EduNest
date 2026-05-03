// app/course/[slug]/page.js
import { api } from '@/lib/api';
import CourseInfo from '@/components/course/CourseInfo';
import CourseCurriculum from '@/components/course/CourseCurriculum';
import CourseReviews from '@/components/course/CourseReviews';
import BuyCard from '@/components/course/BuyCard';   // <-- اضافه شد
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const courses = await api.courses.getAll({ limit: 100 });
  return courses.courses.map(course => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  let course;
  try {
    course = await api.courses.getBySlug(slug);
  } catch (error) {
    if (error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CourseInfo course={course} />
          <CourseCurriculum sections={course.sections} />
          <CourseReviews courseId={course._id} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BuyCard course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
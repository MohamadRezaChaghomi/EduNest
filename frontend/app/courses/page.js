// app/courses/page.js
import CourseCard from '@/components/course/CourseCard';
import { api } from '@/lib/api';
import { CourseFilters } from './CourseFilters'; // یک Client Component جداگانه

// صفحه به یک Server Component async تبدیل شده است.
export default async function CoursesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  // دریافت داده دسته‌بندی‌ها و دوره‌ها به‌صورت مستقیم در سمت سرور
  const [categoriesData, coursesData] = await Promise.all([
    api.categories.getAll(),
    api.courses.getAll({
      search: resolvedSearchParams?.search || '',
      category: resolvedSearchParams?.category || '',
      level: resolvedSearchParams?.level || '',
      page: parseInt(resolvedSearchParams?.page) || 1,
      limit: 12,
    })
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">دوره‌های آموزشی</h1>

      {/* کامپوننت فیلترها که 'use client' است و state خود را مدیریت می‌کند */}
      <CourseFilters initialFilters={resolvedSearchParams} />

      {/* بخش نمایش دوره‌ها که دیگر نیازی به state و useEffect ندارد */}
      {coursesData.courses.length === 0 ? (
        <div className="text-center py-20">دوره‌ای یافت نشد.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {coursesData.courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* کامپوننت صفحه‌بندی نیز می‌تواند یک Client Component باشد */}
      {/* <PaginationComponent currentPage={coursesData.currentPage} totalPages={coursesData.totalPages} /> */}
    </div>
  );
}
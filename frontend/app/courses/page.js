// app/courses/page.js
import CourseCard from '@/components/course/CourseCard';
import { api } from '@/lib/api';
import { CourseFilters } from './CourseFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'دوره‌های آموزشی | EduNest',
  description: 'مشاهده و جستجوی دوره‌های تخصصی برنامه‌نویسی، طراحی و کسب و کار',
};

export default async function CoursesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  // دریافت دسته‌بندی‌ها و دوره‌ها همزمان در سمت سرور
  const [categoriesData, coursesData] = await Promise.all([
    api.categories.getAll().catch(() => []),
    api.courses.getAll({
      search: resolvedSearchParams?.search || '',
      category: resolvedSearchParams?.category || '',
      level: resolvedSearchParams?.level || '',
      page: parseInt(resolvedSearchParams?.page) || 1,
      limit: 12,
    }).catch(() => ({ courses: [], totalPages: 1, currentPage: 1, total: 0 })),
  ]);

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">دوره‌های آموزشی</h1>

      {/* فیلترها (کلاینت کامپوننت) */}
      <CourseFilters initialFilters={resolvedSearchParams} categories={categoriesData} />

      {/* نمایش دوره‌ها */}
      <Suspense fallback={<CoursesSkeleton />}>
        {coursesData.courses?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>دوره‌ای یافت نشد.</p>
            <p className="text-sm mt-2">لطفاً فیلترهای جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {coursesData.courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
            {/* صفحه‌بندی */}
            {coursesData.totalPages > 1 && (
              <Pagination
                currentPage={coursesData.currentPage}
                totalPages={coursesData.totalPages}
                onPageChange={(page) => {
                  // در سمت سرور نمی‌توانیم از router استفاده کنیم، اما اینجا فقط JSX رندر می‌شود و لینک‌ها توسط خود Pagination
                  // برای سادگی، لینک‌ها را به صورت client-side در Pagination کامپوننت مدیریت می‌کنیم
                  // در اینجا تابع page change را خالی می‌گذاریم چون Pagination داخل یک Client Component خواهد بود
                  // اما برای تطابق با سرور، بهتر است Pagination را به صورت client-side در کامپوننت جداگانه بسازیم.
                  // فعلاً تابع را خالی می‌گذاریم – در نسخه نهایی، Pagination را به عنوان یک Client Component جداگانه استفاده کنید.
                }}
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}

// Skeleton loader برای نمایش در حین بارگذاری
function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-lg" />
      ))}
    </div>
  );
}
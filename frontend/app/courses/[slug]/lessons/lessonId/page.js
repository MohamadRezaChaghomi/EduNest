// app/course/[slug]/lessons/[lessonId]/page.js
import { api } from '@/lib/api';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'; // اگر از next-auth استفاده می‌کنید – یا از کوکی خودتان
import LessonPlayer from '@/components/lesson/LessonPlayer';
import LessonSidebar from '@/components/lesson/LessonSidebar';
import LessonComments from '@/components/lesson/LessonComments';

// تابع کمکی برای بررسی دسترسی (سرور ساید)
async function checkAccess(course, userId) {
  // اگر درس رایگان است، دسترسی آزاد
  // در غیر این صورت بررسی کنید کاربر در students دوره هست یا نه
  // این منطق را در بک‌اند هم می‌توانید پیاده کنید
  return true; // فعلاً همیشه true برای تست
}

export default async function LessonPage({ params }) {
  const { slug, lessonId } = await params;
  
  // دریافت اطلاعات دوره و درس
  const course = await api.courses.getBySlug(slug);
  if (!course) notFound();
  
  let lesson;
  try {
    lesson = await api.lessons.getLessonById(lessonId);
  } catch (err) {
    notFound();
  }
  
  // پیدا کردن بخش مربوط به این درس
  const section = course.sections.find(s => s.lessons?.some(l => l._id === lessonId));
  if (!section) notFound();
  
  // بررسی دسترسی (در سمت سرور - ساده)
  // در حالت واقعی، توکن کاربر را از کوکی خوانده و با students دوره مقایسه کنید
  const hasAccess = lesson.isFree || true; // موقتاً true
  
  if (!hasAccess) {
    redirect(`/course/${slug}`);
  }
  
  // ساخت لیست درس‌های دوره برای سایدبار
  const allLessons = [];
  for (const sec of course.sections) {
    for (const les of sec.lessons) {
      allLessons.push({
        ...les,
        sectionTitle: sec.title,
        sectionId: sec._id,
      });
    }
  }
  const currentIndex = allLessons.findIndex(l => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* سایدبار راست (لیست درس‌ها) */}
      <LessonSidebar
        sections={course.sections}
        currentLessonId={lessonId}
        courseSlug={slug}
      />
      
      {/* محتوای اصلی */}
      <div className="flex-1 p-6">
        <LessonPlayer
          lesson={lesson}
          course={course}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
        />
        <LessonComments lessonId={lessonId} />
      </div>
    </div>
  );
}
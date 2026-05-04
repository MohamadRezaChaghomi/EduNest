// app/course/[slug]/lessons/[lessonId]/page.js
import { api } from '@/lib/api';
import { notFound, redirect } from 'next/navigation';
import LessonPlayer from '@/components/lesson/LessonPlayer';
import LessonSidebar from '@/components/lesson/LessonSidebar';
import LessonComments from '@/components/lesson/LessonComments';
import { cookies } from 'next/headers';

// Helper to get current user ID from cookie/token (simplified – adapt to your auth method)
async function getCurrentUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  // You may want to verify token and extract user id
  // For now, return null to assume not logged in (adjust as needed)
  return null; // Placeholder – implement your own logic
}

export default async function LessonPage({ params }) {
  const { slug, lessonId } = await params;

  // Fetch course with all sections and lessons
  const course = await api.courses.getBySlug(slug).catch(() => null);
  if (!course) notFound();

  // Fetch specific lesson
  let lesson;
  try {
    lesson = await api.lessons.getById(lessonId);
  } catch (err) {
    notFound();
  }

  // Find section that contains this lesson (for sidebar navigation)
  const section = course.sections?.find((s) =>
    s.lessons?.some((l) => l._id === lessonId)
  );
  if (!section) notFound();

  // Check access: free lesson or user is enrolled/instructor/admin
  const userId = await getCurrentUserId(); // You may implement real user check
  const isEnrolled = course.students?.includes(userId) || false;
  const isInstructor = course.instructor?._id === userId || false;
  const isAdmin = false; // check user role from session
  const hasAccess = lesson.isFree || isEnrolled || isInstructor || isAdmin;

  if (!hasAccess) {
    redirect(`/course/${slug}`);
  }

  // Build all lessons list for sidebar and navigation
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
  const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background" dir="rtl">
      {/* Sidebar (lessons list) */}
      <LessonSidebar
        sections={course.sections}
        currentLessonId={lessonId}
        courseSlug={slug}
      />

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6">
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
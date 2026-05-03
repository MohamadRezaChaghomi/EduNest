'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Lock, PlayCircle, CheckCircle } from 'lucide-react';

export default function LessonSidebar({ sections, currentLessonId, courseSlug }) {
  return (
    <aside className="w-full lg:w-80 bg-white border-l overflow-y-auto h-screen sticky top-0">
      <div className="p-4 border-b">
        <h2 className="font-bold">سرفصل‌های دوره</h2>
      </div>
      <div className="divide-y">
        {sections.map((section) => (
          <div key={section._id} className="p-2">
            <div className="font-semibold text-sm text-gray-700 mb-2">{section.title}</div>
            <ul className="space-y-1">
              {section.lessons?.map((lesson) => {
                const isActive = lesson._id === currentLessonId;
                const isLocked = !lesson.isFree; // در حالت واقعی بر اساس خرید بررسی کنید
                return (
                  <li key={lesson._id}>
                    <Link
                      href={`/course/${courseSlug}/lessons/${lesson._id}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md text-sm hover:bg-gray-100 transition",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="flex-1 line-clamp-2">{lesson.title}</span>
                      {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
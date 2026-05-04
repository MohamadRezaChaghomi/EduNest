'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Lock, PlayCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LessonSidebar({ sections, currentLessonId, courseSlug }) {
  const { user } = useAuth();

  // Check if user has access to a lesson (if free OR purchased)
  // In real app, this info should come from backend (course.students includes user)
  // For now, assume all lessons are accessible if user is logged in (or free)
  // You can enhance with actual purchase check via context/props.
  const hasAccess = (lesson) => {
    if (lesson.isFree) return true;
    if (user) return true; // TODO: check actual enrollment in course
    return false;
  };

  return (
    <aside className="w-full lg:w-80 border-l border-border bg-card overflow-y-auto h-screen sticky top-0" dir="rtl">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-foreground">سرفصل‌های دوره</h2>
      </div>
      <div className="divide-y divide-border">
        {sections.map((section) => (
          <div key={section._id} className="p-3">
            <div className="font-semibold text-sm text-foreground mb-2">{section.title}</div>
            <ul className="space-y-1">
              {section.lessons?.map((lesson) => {
                const isActive = lesson._id === currentLessonId;
                const accessible = hasAccess(lesson);
                return (
                  <li key={lesson._id}>
                    {accessible ? (
                      <Link
                        href={`/course/${courseSlug}/lessons/${lesson._id}`}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md text-sm transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <PlayCircle className="w-4 h-4 text-green-500" />
                        <span className="flex-1 line-clamp-2">{lesson.title}</span>
                        {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-md text-sm text-muted-foreground cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        <span className="flex-1 line-clamp-2">{lesson.title}</span>
                      </div>
                    )}
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
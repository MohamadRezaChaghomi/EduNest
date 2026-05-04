'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonPlayer({ lesson, course, prevLesson, nextLesson }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!lesson?.videoUrl) return;
    const saved = localStorage.getItem(`lesson_progress_${lesson._id}`);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [lesson._id, lesson.videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
      // Save every 5 seconds or on pause
      if (videoRef.current.currentTime > 0) {
        localStorage.setItem(`lesson_progress_${lesson._id}`, videoRef.current.currentTime);
      }
    }
  };

  const handleEnded = () => {
    // Optional: mark lesson as completed via API
    if (nextLesson) {
      toast.info('در حال رفتن به درس بعدی...');
      router.push(`/course/${course.slug}/lessons/${nextLesson._id}`);
    } else {
      toast.success('به پایان دوره رسیدید!');
    }
  };

  const handleVideoError = () => {
    setError('خطا در بارگذاری ویدیو. لطفاً دوباره تلاش کنید.');
    setIsLoading(false);
  };

  const handleCanPlay = () => setIsLoading(false);

  if (!lesson) return null;

  return (
    <div className="bg-card border-border rounded-lg shadow mb-6 overflow-hidden" dir="rtl">
      <div className="aspect-video bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            controls
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleVideoError}
            onCanPlay={handleCanPlay}
          />
        )}
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground mt-2">{lesson.description}</p>
        )}
        {/* Progress bar optional */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-3">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => prevLesson && router.push(`/course/${course.slug}/lessons/${prevLesson._id}`)}
            disabled={!prevLesson}
          >
            <ChevronLeft className="ml-2 h-4 w-4" /> درس قبلی
          </Button>
          <Button
            onClick={() => nextLesson && router.push(`/course/${course.slug}/lessons/${nextLesson._id}`)}
            disabled={!nextLesson}
          >
            درس بعدی <ChevronRight className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
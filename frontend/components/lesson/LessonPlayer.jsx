'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function LessonPlayer({ lesson, course, prevLesson, nextLesson }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  
  // ذخیره آخرین موقعیت پخش (در localStorage یا API)
  useEffect(() => {
    const saved = localStorage.getItem(`lesson_progress_${lesson._id}`);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [lesson._id]);
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
      if (videoRef.current.currentTime > 0) {
        localStorage.setItem(`lesson_progress_${lesson._id}`, videoRef.current.currentTime);
      }
    }
  };
  
  const handleEnded = () => {
    // علامت گذاری درس به عنوان دیده شده (اختیاری)
    // api.lessons.markCompleted(lesson._id);
    if (nextLesson) {
      router.push(`/course/${course.slug}/lessons/${nextLesson._id}`);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="aspect-video bg-black">
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          controls
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        <p className="text-gray-600 mt-2">{lesson.description}</p>
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => prevLesson && router.push(`/course/${course.slug}/lessons/${prevLesson._id}`)}
            disabled={!prevLesson}
          >
            <ChevronLeft className="ml-2" /> درس قبلی
          </Button>
          <Button
            onClick={() => nextLesson && router.push(`/course/${course.slug}/lessons/${nextLesson._id}`)}
            disabled={!nextLesson}
          >
            درس بعدی <ChevronRight className="mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
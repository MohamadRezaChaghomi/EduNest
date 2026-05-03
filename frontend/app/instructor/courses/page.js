// app/instructor/courses/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.courses.getMyCourses();
        setCourses(data);
      } catch (err) {
        toast.error('خطا در دریافت دوره‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (!confirm('آیا از حذف این دوره مطمئن هستید؟')) return;
    try {
      await api.courses.delete(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
      toast.success('دوره حذف شد');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">شما هنوز دوره‌ای ایجاد نکرده‌اید.</p>
        <Link href="/instructor/courses/new">
          <Button>ایجاد دوره جدید</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">دوره‌های من</h1>
        <Link href="/instructor/courses/new">
          <Button>+ دوره جدید</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Card key={course._id}>
            <CardHeader>
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {course.students?.length || 0} دانشجو
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">{course.shortDescription || course.description}</p>
              <div className="mt-2 font-bold text-primary">
                {course.discountPrice ? (
                  <>
                    <span>{course.discountPrice.toLocaleString()} تومان</span>
                    <span className="line-through text-gray-400 mr-2">{course.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span>{course.price.toLocaleString()} تومان</span>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/course/${course.slug}`)}>
                <Eye className="w-4 h-4 ml-1" /> دیدن
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/instructor/courses/${course._id}/edit`)}>
                <Edit className="w-4 h-4 ml-1" /> ویرایش
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/instructor/courses/${course._id}/curriculum`)}>
                <BookOpen className="w-4 h-4 ml-1" /> سرفصل‌ها
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(course._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
// app/instructor/courses/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchCourses = async () => {
      try {
        const data = await api.courses.getMyCourses();
        if (isMounted.current) setCourses(data.data || data);
      } catch (err) {
        if (isMounted.current) toast.error('خطا در بارگذاری دوره‌ها');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchCourses();
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (courseId) => {
    if (confirm('آیا از حذف این دوره مطمئن هستید؟')) {
      try {
        await api.courses.delete(courseId);
        toast.success('دوره حذف شد');
        setCourses(prev => prev.filter(c => c._id !== courseId));
      } catch (err) {
        toast.error(err.message || 'خطا در حذف دوره');
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">دوره‌های من</h1>
        <Link href="/instructor/courses/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> دوره جدید
          </Button>
        </Link>
      </div>
      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">هیچ دوره‌ای ایجاد نکرده‌اید.</p>
            <Link href="/instructor/courses/new">
              <Button variant="link">اولین دوره را بسازید</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="border-border">
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                    {course.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                  </Badge>
                  <Badge variant={course.isApproved ? 'default' : 'destructive'}>
                    {course.isApproved ? 'تأیید شده' : 'در انتظار تأیید'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.shortDescription || 'بدون توضیح کوتاه'}
                </p>
                <p className="text-primary font-bold mt-2">
                  {course.price.toLocaleString()} تومان
                </p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Link href={`/courses/${course.slug}`} target="_blank">
                  <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                </Link>
                <Link href={`/instructor/courses/${course._id}/edit`}>
                  <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                </Link>
                <Link href={`/instructor/courses/${course._id}/curriculum`}>
                  <Button variant="outline" size="sm">سرفصل‌ها</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleDelete(course._id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
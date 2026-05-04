// app/admin/courses/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', isApproved: '', isPublished: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.isApproved !== '') params.isApproved = filters.isApproved;
        if (filters.isPublished !== '') params.isPublished = filters.isPublished;
        const data = await api.courses.getAllAdmin(params);
        if (isMounted.current) setCourses(data.data || data);
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری دوره‌ها');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchCourses();
    return () => { isMounted.current = false; };
  }, [filters, refreshKey]);

  const handleApprove = async (courseId, approve) => {
    try {
      await api.courses.update(courseId, { isApproved: approve });
      toast.success(approve ? 'دوره تأیید شد' : 'تأیید برداشته شد');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'خطا در تغییر وضعیت تأیید');
    }
  };

  const handlePublish = async (courseId, publish) => {
    try {
      await api.courses.update(courseId, { isPublished: publish });
      toast.success(publish ? 'دوره منتشر شد' : 'انتشار لغو شد');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'خطا در تغییر وضعیت انتشار');
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('آیا از حذف این دوره مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) return;
    try {
      await api.courses.delete(courseId);
      toast.success('دوره حذف شد');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'خطا در حذف دوره');
    }
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">مدیریت دوره‌ها</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="جستجوی عنوان..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-64"
        />
        <Select value={filters.isApproved} onValueChange={(val) => setFilters({ ...filters, isApproved: val })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="وضعیت تأیید" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="true">تأیید شده</SelectItem>
            <SelectItem value="false">تأیید نشده</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.isPublished} onValueChange={(val) => setFilters({ ...filters, isPublished: val })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="وضعیت انتشار" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="true">منتشر شده</SelectItem>
            <SelectItem value="false">پیش‌نویس</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setFilters({ search: '', isApproved: '', isPublished: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>مدرس</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : courses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">دوره‌ای یافت نشد</TableCell></TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.instructor?.name}</TableCell>
                  <TableCell>{course.price.toLocaleString()} تومان</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={course.isApproved ? 'default' : 'destructive'}>
                        {course.isApproved ? 'تأیید شده' : 'تأیید نشده'}
                      </Badge>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(course._id, !course.isApproved)}>
                        {course.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePublish(course._id, !course.isPublished)}>
                        {course.isPublished ? 'مخفی' : 'انتشار'}
                      </Button>
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(course._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
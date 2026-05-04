'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CoursesTable() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ status: '', isApproved: '', search: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.courses.getAllAdmin({
          page: pagination.page,
          limit: 10,
          ...filters,
        });
        setCourses(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('خطا در بارگذاری دوره‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [pagination.page, filters]);

  const handleApprove = async (courseId, currentStatus) => {
    try {
      await api.courses.update(courseId, { isApproved: !currentStatus });
      toast.success(currentStatus ? 'تأیید لغو شد' : 'دوره تأیید شد');
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePublish = async (courseId, currentStatus) => {
    try {
      await api.courses.update(courseId, { isPublished: !currentStatus });
      toast.success(currentStatus ? 'از انتشار خارج شد' : 'دوره منتشر شد');
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (courseId) => {
    if (confirm('آیا از حذف این دوره مطمئن هستید؟')) {
      try {
        await api.courses.delete(courseId);
        toast.success('دوره حذف شد');
        setPagination(prev => ({ ...prev, page: prev.page }));
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="جستجوی عنوان..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="max-w-sm"
        />
        <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val, page: 1 })}>
          <SelectTrigger className="w-36"><SelectValue placeholder="وضعیت انتشار" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="published">منتشر شده</SelectItem>
            <SelectItem value="draft">پیش‌نویس</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.isApproved} onValueChange={(val) => setFilters({ ...filters, isApproved: val, page: 1 })}>
          <SelectTrigger className="w-36"><SelectValue placeholder="تأیید" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="true">تأیید شده</SelectItem>
            <SelectItem value="false">تأیید نشده</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setFilters({ status: '', isApproved: '', search: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>مدرس</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>وضعیت انتشار</TableHead>
              <TableHead>تأیید</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : courses.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">دوره‌ای یافت نشد</TableCell></TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.instructor?.name || '-'}</TableCell>
                  <TableCell>{course.price.toLocaleString()} تومان</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                      {course.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isApproved ? 'default' : 'destructive'}>
                      {course.isApproved ? 'تأیید شده' : 'در انتظار تأیید'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(course._id, course.isApproved)}>
                      {course.isApproved ? 'لغو تأیید' : 'تأیید'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePublish(course._id, course.isPublished)}>
                      {course.isPublished ? 'عدم انتشار' : 'انتشار'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(course._id)}>
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
            قبلی
          </Button>
          <span>صفحه {pagination.page} از {pagination.pages}</span>
          <Button variant="outline" disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}
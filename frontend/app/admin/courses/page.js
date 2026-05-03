// app/admin/courses/page.js
'use client';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.isApproved !== '') params.isApproved = filters.isApproved;
        if (filters.isPublished !== '') params.isPublished = filters.isPublished;
        const data = await api.courses.getAllAdmin(params);
        setCourses(data.courses);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [filters]);

  const handleApprove = async (courseId, approve) => {
    try {
      await api.courses.update(courseId, { isApproved: approve });
      toast.success(approve ? 'دوره تأیید شد' : 'تأیید برداشته شد');
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isApproved: approve } : c));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePublish = async (courseId, publish) => {
    try {
      await api.courses.update(courseId, { isPublished: publish });
      toast.success(publish ? 'دوره منتشر شد' : 'انتشار لغو شد');
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: publish } : c));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('آیا از حذف این دوره مطمئن هستید؟')) return;
    try {
      await api.courses.delete(courseId);
      toast.success('دوره حذف شد');
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">مدیریت دوره‌ها</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="جستجو..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-64" />
        <Select value={filters.isApproved} onValueChange={(val) => setFilters({...filters, isApproved: val})}>
          <SelectTrigger className="w-40"><SelectValue placeholder="تأیید" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="true">تأیید شده</SelectItem>
            <SelectItem value="false">تأیید نشده</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.isPublished} onValueChange={(val) => setFilters({...filters, isPublished: val})}>
          <SelectTrigger className="w-40"><SelectValue placeholder="انتشار" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="true">منتشر شده</SelectItem>
            <SelectItem value="false">پیش‌نویس</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow><TableHead>عنوان</TableHead><TableHead>مدرس</TableHead><TableHead>قیمت</TableHead><TableHead>وضعیت</TableHead><TableHead>عملیات</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={5}>بارگذاری...</TableCell></TableRow> :
            courses.map(course => (
              <TableRow key={course._id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.instructor?.name}</TableCell>
                <TableCell>{course.price.toLocaleString()} تومان</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {course.isApproved ? <Badge>تأیید شده</Badge> : <Badge variant="destructive">تأیید نشده</Badge>}
                    {course.isPublished ? <Badge variant="outline">منتشر شده</Badge> : <Badge variant="secondary">پیش‌نویس</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(course._id, !course.isApproved)}>
                      {course.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePublish(course._id, !course.isPublished)}>
                      {course.isPublished ? 'مخفی' : 'انتشار'}
                    </Button>
                    <Link href={`/course/${course.slug}`} target="_blank"><Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button></Link>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(course._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
// app/dashboard/tickets/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [form, setForm] = useState({ courseId: '', subject: '', message: '', priority: 'medium' });

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // دریافت دوره‌های خریداری شده از طریق سفارشات
        const orders = await api.orders.getMyOrders();
        const courseIds = orders.flatMap(order => order.items.map(item => item.course));
        const courseDetails = await Promise.all(courseIds.map(id => api.courses.getById(id).catch(() => null)));
        setCourses(courseDetails.filter(c => c !== null));
      } catch (err) {
        toast.error('خطا در دریافت دوره‌های شما');
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error('لطفاً دوره را انتخاب کنید');
      return;
    }
    if (!form.subject.trim()) {
      toast.error('عنوان تیکت را وارد کنید');
      return;
    }
    if (!form.message.trim()) {
      toast.error('متن پیام را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await api.tickets.create({
        courseId: form.courseId,
        subject: form.subject,
        message: form.message,
        priority: form.priority,
      });
      toast.success('تیکت با موفقیت ثبت شد');
      router.push('/dashboard/tickets');
    } catch (err) {
      toast.error(err.message || 'خطا در ثبت تیکت');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCourses) {
    return <div className="text-center py-8">در حال بارگذاری دوره‌ها...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">تیکت جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>دوره مرتبط</Label>
              <Select value={form.courseId} onValueChange={(val) => setForm({ ...form, courseId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">عنوان تیکت</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">اولویت</Label>
              <Select value={form.priority} onValueChange={(val) => setForm({ ...form, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">پایین</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">بالا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">متن پیام</Label>
              <Textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'در حال ارسال...' : 'ارسال تیکت'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
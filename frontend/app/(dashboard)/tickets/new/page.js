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
import { toast } from 'sonner';

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ courseId: '', subject: '', message: '', priority: 'medium' });

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await api.courses.getMyEnrolledCourses(); // باید این endpoint را در بک‌اند داشته باشید
        setCourses(data);
      } catch (err) {
        toast.error('خطا در دریافت دوره‌های شما');
      }
    };
    fetchMyCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) return toast.error('لطفاً دوره را انتخاب کنید');
    if (!form.subject.trim()) return toast.error('عنوان تیکت را وارد کنید');
    if (!form.message.trim()) return toast.error('متن پیام را وارد کنید');
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">تیکت جدید</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>دوره مرتبط</Label>
          <Select value={form.courseId} onValueChange={(val) => setForm({...form, courseId: val})}>
            <SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course._id} value={course._id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subject">عنوان تیکت</Label>
          <Input id="subject" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} />
        </div>
        <div>
          <Label htmlFor="priority">اولویت</Label>
          <Select value={form.priority} onValueChange={(val) => setForm({...form, priority: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">پایین</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="high">بالا</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="message">متن پیام</Label>
          <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
        </div>
        <Button type="submit" disabled={loading}>ارسال تیکت</Button>
      </form>
    </div>
  );
}
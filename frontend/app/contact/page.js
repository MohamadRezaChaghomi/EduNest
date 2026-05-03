// app/contact/page.js
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.contact.submit(form);
      toast.success('پیام شما با موفقیت ارسال شد');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">تماس با ما</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">نام و نام خانوادگی</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
        </div>
        <div>
          <Label htmlFor="subject">موضوع</Label>
          <Input id="subject" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required />
        </div>
        <div>
          <Label htmlFor="message">پیام</Label>
          <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full">ارسال پیام</Button>
      </form>
    </div>
  );
}
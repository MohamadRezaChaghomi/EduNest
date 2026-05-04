// app/contact/page.js
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, User, Phone, MessageSquare } from 'lucide-react';
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
      toast.error(err.message || 'خطا در ارسال پیام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl" dir="rtl">
      <Card className="border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-foreground">تماس با ما</CardTitle>
          <CardDescription className="text-muted-foreground">
            سوالات، نظرات یا پیشنهادات خود را با ما در میان بگذارید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> نام و نام خانوادگی
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={loading}
                placeholder="علی رضایی"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> ایمیل
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
                placeholder="example@mail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> موضوع
              </Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                disabled={loading}
                placeholder="مشکل در ورود، پیشنهاد دوره، ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">پیام</Label>
              <Textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                disabled={loading}
                placeholder="متن پیام خود را وارد کنید..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'در حال ارسال...' : 'ارسال پیام'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
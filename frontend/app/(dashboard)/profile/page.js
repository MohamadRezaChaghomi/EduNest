// app/dashboard/profile/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  // Initialize form only once when user loads
  useEffect(() => {
    if (user && isMounted.current) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      isMounted.current = false;
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
    } catch (err) {
      toast.error(err.message || 'خطا در به‌روزرسانی');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="max-w-2xl mx-auto border-border shadow-lg">
      <CardHeader>
        <CardTitle>ویرایش پروفایل</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل (فقط مشاهده)</Label>
            <Input id="email" type="email" value={form.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <Textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              disabled={loading}
              placeholder="چند خط درباره خودتان..."
            />
          </div>
          <Button type="submit" disabled={loading}>ذخیره تغییرات</Button>
        </form>
      </CardContent>
    </Card>
  );
}
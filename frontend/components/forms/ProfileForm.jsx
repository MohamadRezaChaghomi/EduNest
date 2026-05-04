'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (user && !isInitialized.current) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      isInitialized.current = true;
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, phone, bio });
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
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
        <CardDescription>اطلاعات شخصی خود را به‌روز کنید</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل (فقط مشاهده)</Label>
            <Input id="email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              placeholder="چند خط درباره خودتان بنویسید..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>ذخیره تغییرات</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
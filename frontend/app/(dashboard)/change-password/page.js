// app/dashboard/change-password/page.js
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('رمز جدید و تکرار آن مطابقت ندارند');
      return;
    }
    setLoading(true);
    try {
      await api.users.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
        <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="newPassword">رمز عبور جدید</Label>
        <Input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="confirmPassword">تکرار رمز جدید</Label>
        <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
      </div>
      <Button type="submit" disabled={loading}>تغییر رمز</Button>
    </form>
  );
}
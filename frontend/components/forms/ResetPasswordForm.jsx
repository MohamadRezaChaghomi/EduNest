'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ResetPasswordForm() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    if (password.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setResetDone(true);
      toast.success('رمز عبور با موفقیت بازنشانی شد');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'خطا در بازنشانی رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  if (resetDone) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">بازنشانی رمز عبور موفق</CardTitle>
          <CardDescription className="text-center">
            اکنون می‌توانید با رمز عبور جدید خود وارد شوید.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push('/login')}>ورود به حساب</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">تنظیم رمز عبور جدید</CardTitle>
        <CardDescription className="text-center">
          رمز عبور جدید خود را وارد کنید.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور جدید</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'در حال بازنشانی...' : 'بازنشانی رمز عبور'}
          </Button>
          <div className="text-sm text-center">
            <Link href="/login" className="text-primary hover:underline">
              بازگشت به ورود
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
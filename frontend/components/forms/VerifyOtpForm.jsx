'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyOtpForm() {
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(() => {
    // خواندن مقدار اولیه از sessionStorage در سمت کلاینت
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('otpPhone') || '';
    }
    return '';
  });
  const { verifyOtp } = useAuth();
  const router = useRouter();

  // اگر تلفن وجود نداشت، به صفحه درخواست OTP هدایت کنیم
  useEffect(() => {
    if (!phone) {
      router.push('/request-otp');
    }
  }, [phone, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('لطفاً یک کد ۶ رقمی معتبر وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, code, rememberMe);
      toast.success('ورود موفقیت‌آمیز');
      sessionStorage.removeItem('otpPhone');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'کد نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  // اگر تلفن وجود نداشته باشد، در حال هدایت هستیم
  if (!phone) {
    return null; // یا یک اسپینر
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">تأیید کد</CardTitle>
        <CardDescription className="text-center">
          کد ۶ رقمی ارسال شده به {phone} را وارد کنید
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">کد تأیید</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
              مرا به خاطر بسپار
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
          </Button>
          <div className="text-sm text-center">
            <Link href="/request-otp" className="text-primary hover:underline">
              درخواست کد جدید
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
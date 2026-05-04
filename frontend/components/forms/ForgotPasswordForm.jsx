'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
      toast.success('لینک بازیابی به ایمیل شما ارسال شد');
    } catch (err) {
      toast.error(err.message || 'خطا در ارسال لینک بازیابی');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ایمیل خود را بررسی کنید</CardTitle>
          <CardDescription className="text-center">
            لینک بازیابی رمز عبور به {email} ارسال شد. لطفاً ایمیل خود را بررسی کنید.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
            بازگشت به ورود
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">فراموشی رمز عبور؟</CardTitle>
        <CardDescription className="text-center">
          ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              بازگشت به ورود
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
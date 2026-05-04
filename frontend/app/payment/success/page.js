// app/payment/success/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const verifyPayment = async () => {
      if (!sessionId) {
        if (isMounted.current) toast.error('اطلاعات پرداخت یافت نشد');
        router.push('/courses');
        return;
      }
      try {
        const data = await api.payment.verifySession(sessionId);
        if (isMounted.current) {
          setOrder(data.order);
          toast.success('پرداخت با موفقیت انجام شد');
        }
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در تأیید پرداخت');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    verifyPayment();
    return () => { isMounted.current = false; };
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-foreground">در حال تأیید پرداخت...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-foreground">پرداخت موفق</CardTitle>
          <CardDescription className="text-muted-foreground">
            سفارش شما با موفقیت ثبت شد.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>می‌توانید دوره‌های خریداری شده را در پنل کاربری مشاهده کنید.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={() => router.push('/dashboard/my-courses')} className="w-full">
            مشاهده دوره‌های من
          </Button>
          <Button variant="outline" onClick={() => router.push('/courses')} className="w-full">
            بازگشت به فروشگاه
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
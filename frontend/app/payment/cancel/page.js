// app/payment/cancel/page.js
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-foreground">پرداخت ناموفق</CardTitle>
          <CardDescription className="text-muted-foreground">
            فرآیند پرداخت تکمیل نشد.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>در صورت کسر وجه، طی ۷۲ ساعت به حساب شما بازگردانده می‌شود.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/courses')} className="w-full">
            بازگشت به فروشگاه
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
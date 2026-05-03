// app/payment/success/page.js
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('اطلاعات پرداخت یافت نشد');
        router.push('/courses');
        return;
      }
      try {
        // در بک‌اند باید یک endpoint برای تأیید پرداخت با session_id داشته باشید
        const data = await api.payment.verifySession(sessionId);
        setOrder(data.order);
        toast.success('پرداخت با موفقیت انجام شد');
      } catch (err) {
        toast.error(err.message || 'خطا در تأیید پرداخت');
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [sessionId, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">در حال تأیید پرداخت...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">پرداخت موفق</h1>
        <p className="text-gray-600 mb-6">
          سفارش شما با موفقیت ثبت شد. می‌توانید دوره‌های خریداری شده را در پنل کاربری مشاهده کنید.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/dashboard/my-courses')} className="w-full">
            مشاهده دوره‌های من
          </Button>
          <Button variant="outline" onClick={() => router.push('/courses')} className="w-full">
            بازگشت به فروشگاه
          </Button>
        </div>
      </div>
    </div>
  );
}
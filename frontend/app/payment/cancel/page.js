// app/payment/cancel/page.js
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">پرداخت ناموفق</h1>
        <p className="text-gray-600 mb-6">
          فرآیند پرداخت تکمیل نشد. در صورت کسر وجه، طی ۷۲ ساعت به حساب شما بازگردانده می‌شود.
        </p>
        <Button onClick={() => router.push('/courses')} className="w-full">
          بازگشت به فروشگاه
        </Button>
      </div>
    </div>
  );
}
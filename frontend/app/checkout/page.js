// app/checkout/page.js
'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getCartTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // در صورت خالی بودن سبد خرید
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir="rtl">
        <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">سبد خرید خالی است</h2>
        <p className="text-muted-foreground mb-6">برای تسویه حساب ابتدا دوره‌ای را به سبد اضافه کنید.</p>
        <Button onClick={() => router.push('/courses')}>مشاهده دوره‌ها</Button>
      </div>
    );
  }

  const primaryCourse = items[0];
  const total = getCartTotal();
  const hasMultiple = items.length > 1;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { sessionId, url } = await api.payment.createCheckoutSession({
        courseId: primaryCourse._id,
      });
      if (url) {
        window.location.href = url;
      } else {
        toast.error('آدرس درگاه پرداخت دریافت نشد');
      }
    } catch (err) {
      toast.error(err.message || 'خطا در ایجاد جلسه پرداخت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">تسویه حساب</h1>
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle>خلاصه سفارش</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasMultiple && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <span>در حال حاضر فقط امکان خرید یک دوره در هر تراکنش وجود دارد. لطفاً هر دوره را جداگانه خریداری کنید.</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">دوره انتخابی</span>
            <span>{primaryCourse.title}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>قیمت اصلی</span>
            <span>{primaryCourse.price.toLocaleString()} تومان</span>
          </div>
          {primaryCourse.discountPrice && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-green-600">تخفیف</span>
              <span className="text-green-600">-{(primaryCourse.price - primaryCourse.discountPrice).toLocaleString()} تومان</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>قابل پرداخت</span>
            <span className="text-primary">{total.toLocaleString()} تومان</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'در حال اتصال به درگاه...' : 'پرداخت نهایی'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/cart')}
            className="w-full"
          >
            بازگشت به سبد خرید
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
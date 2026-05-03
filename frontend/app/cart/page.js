// app/cart/page.js
'use client';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    if (items.length === 0) {
      toast.error('سبد خرید خالی است');
      return;
    }
    try {
      // برای هر دوره یک جلسه پرداخت جدا یا همه در یک سبد؟ فرض کنیم یک دوره در یک سفارش
      // ساده‌ترین: برای اولین دوره در سبد پرداخت را شروع کنید
      const courseId = items[0]._id;
      const session = await api.payment.createCheckoutSession({ courseId });
      if (session.url) {
        // قبل از هدایت، سبد را پاک کنید یا نه؟ بعد از پرداخت موفق وب‌هوک می‌تواند پاک کند
        window.location.href = session.url;
      } else {
        toast.error('خطا در ایجاد جلسه پرداخت');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">سبد خرید خالی است</h1>
        <Link href="/courses">
          <Button>مشاهده دوره‌ها</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <Card key={item._id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image src={item.coverImage || '/default-course.jpg'} alt={item.title} fill className="object-cover rounded" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.instructor?.name}</p>
                  <div className="mt-2">
                    {item.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-green-600">{item.discountPrice.toLocaleString()} تومان</span>
                        <span className="line-through text-gray-400 mr-2">{item.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">{item.price.toLocaleString()} تومان</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item._id)}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>خلاصه سبد خرید</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>تعداد آیتم‌ها:</span><span>{items.length}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>جمع کل:</span><span>{getCartTotal().toLocaleString()} تومان</span></div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={handleCheckout} className="w-full">تسویه حساب <ArrowRight className="mr-2 w-4 h-4" /></Button>
              <Button variant="outline" onClick={clearCart} className="w-full">خالی کردن سبد</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
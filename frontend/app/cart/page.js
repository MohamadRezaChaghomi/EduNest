// app/cart/page.js
'use client';

import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeFromCart, clearCart, getCartTotal } = useCart();
  const router = useRouter();
  const total = getCartTotal();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('سبد خرید شما خالی است');
      return;
    }
    // Redirect to checkout page (you can create a checkout page later)
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">سبد خرید خالی است</h2>
        <p className="text-muted-foreground mb-6">هنوز دوره‌ای به سبد خرید اضافه نکرده‌اید.</p>
        <Link href="/courses">
          <Button>مشاهده دوره‌ها</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">سبد خرید</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="w-32 h-32 relative flex-shrink-0 bg-muted rounded-md overflow-hidden">
                  <Image
                    src={item.coverImage || '/default-course.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{item.shortDescription}</p>
                  <div className="mt-2">
                    {item.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">{item.discountPrice.toLocaleString()} تومان</span>
                        <span className="text-sm line-through text-muted-foreground">{item.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-primary">{item.price.toLocaleString()} تومان</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button variant="outline" onClick={clearCart}>حذف همه</Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>خلاصه سبد خرید</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>تعداد دوره‌ها:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>مجموع:</span>
                <span>{total.toLocaleString()} تومان</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout}>
                ثبت سفارش و پرداخت
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
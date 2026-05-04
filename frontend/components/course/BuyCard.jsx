'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Check } from 'lucide-react';

export default function BuyCard({ course }) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(course._id);
  const finalPrice = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  const handleAddToCart = () => {
    addToCart(course);
    toast.success('دوره به سبد خرید اضافه شد');
  };

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6 sticky top-24">
      <div className="text-center mb-6">
        {hasDiscount ? (
          <>
            <span className="text-3xl font-bold text-primary">{finalPrice.toLocaleString()}</span>
            <span className="text-xl text-muted-foreground line-through mr-2">{course.price.toLocaleString()}</span>
            <span className="block text-sm text-green-600 dark:text-green-400 mt-1">تومان</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-primary">{finalPrice.toLocaleString()}</span>
            <span className="block text-sm text-muted-foreground mt-1">تومان</span>
          </>
        )}
      </div>

      {inCart ? (
        <Button className="w-full gap-2" variant="outline" disabled>
          <Check className="w-4 h-4" /> در سبد خرید
        </Button>
      ) : (
        <Button onClick={handleAddToCart} className="w-full gap-2">
          <ShoppingCart className="w-4 h-4" /> افزودن به سبد خرید
        </Button>
      )}

      <Link href="/cart" className="block mt-3 text-center text-sm text-primary hover:underline">
        مشاهده سبد خرید
      </Link>
    </div>
  );
}
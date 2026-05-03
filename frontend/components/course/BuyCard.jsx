'use client';
import Link from 'next/link';  // <-- اضافه شد
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="text-center mb-4">
        {hasDiscount ? (
          <>
            <span className="text-3xl font-bold text-green-600">{finalPrice.toLocaleString()} تومان</span>
            <span className="line-through text-gray-400 mr-2">{course.price.toLocaleString()}</span>
          </>
        ) : (
          <span className="text-3xl font-bold">{finalPrice.toLocaleString()} تومان</span>
        )}
      </div>

      {inCart ? (
        <Button className="w-full" variant="outline" disabled>
          در سبد خرید
        </Button>
      ) : (
        <Button onClick={handleAddToCart} className="w-full">
          افزودن به سبد خرید
        </Button>
      )}

      <Link href="/cart" className="block mt-2 text-center text-sm text-primary">
        مشاهده سبد خرید
      </Link>
    </div>
  );
}
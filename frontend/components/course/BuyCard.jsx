'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function BuyCard({ course }) {
  const { user } = useAuth();
  const router = useRouter();
  const finalPrice = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/course/${course.slug}`));
      return;
    }
    try {
      const session = await api.payment.createCheckoutSession({ courseId: course._id });
      if (session.url) window.location.href = session.url;
      else toast.error('خطا در ایجاد جلسه پرداخت');
    } catch (error) {
      toast.error(error.message);
    }
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
      <Button onClick={handlePurchase} className="w-full" size="lg">
        خرید دوره
      </Button>
      <p className="text-xs text-gray-500 text-center mt-4">پس از خرید، به تمام درس‌ها دسترسی خواهید داشت.</p>
    </div>
  );
}
// components/cart/AddToCartButton.jsx
'use client';

import { Button } from '@/components/ui/button';
import { useCart } from './CartProvider';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddToCartButton({ course, variant = 'default', size = 'default' }) {
  const { addToCart, isInCart } = useCart();
  const [added, setAdded] = useState(false);
  const alreadyInCart = isInCart(course._id);

  const handleAdd = () => {
    if (alreadyInCart) {
      toast.info('این دوره قبلاً به سبد خرید اضافه شده است');
      return;
    }
    addToCart(course);
    setAdded(true);
    toast.success(`${course.title} به سبد خرید اضافه شد`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (alreadyInCart) {
    return (
      <Button variant="outline" size={size} disabled className="gap-2">
        <Check className="w-4 h-4" />
        در سبد خرید
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} onClick={handleAdd} className="gap-2">
      {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
      {added ? 'افزوده شد' : 'افزودن به سبد خرید'}
    </Button>
  );
}
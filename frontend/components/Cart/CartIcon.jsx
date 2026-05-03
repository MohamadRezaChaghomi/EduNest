'use client';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function CartIcon() {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
          {count}
        </Badge>
      )}
    </Link>
  );
}
'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from './CartProvider';

export default function CartIcon() {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center">
      <ShoppingCart className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
      {count > 0 && (
        <Badge
          className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
          aria-label={`${count} آیتم در سبد خرید`}
        >
          {count}
        </Badge>
      )}
    </Link>
  );
}
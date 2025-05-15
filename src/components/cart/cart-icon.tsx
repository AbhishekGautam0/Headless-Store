'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart/cart-provider';

export function CartIcon() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
      <ShoppingCart className="h-6 w-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {cartCount}
        </span>
      )}
      <span className="sr-only">Open cart</span>
    </Button>
  );
}

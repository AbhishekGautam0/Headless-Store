
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useCart } from '@/components/cart/cart-provider';
import type { Product, Variant } from '@/lib/types';

interface AddToCartButtonProps extends ButtonProps {
  product: Product;
  selectedVariant: Variant;
  quantity?: number;
}

export function AddToCartButton({ product, selectedVariant, quantity = 1, children, ...props }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (selectedVariant.availableForSale) { // Relying primarily on availableForSale
      addToCart(product, selectedVariant, quantity);
    } else {
      console.warn("Attempted to add unavailable item.");
      // Toast for "unavailable" could be added in useCart or here if preferred
    }
  };

  const isUnavailable = !selectedVariant.availableForSale;

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={isUnavailable || props.disabled} // props.disabled allows external override
      {...props}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {children ? children : (isUnavailable ? 'Out of Stock' : 'Add to Cart')}
    </Button>
  );
}

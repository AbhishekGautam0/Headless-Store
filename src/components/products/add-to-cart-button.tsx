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
    if (selectedVariant.stock > 0) {
      addToCart(product, selectedVariant, quantity);
    } else {
      // Optionally, show a toast or message that item is out of stock
      console.warn("Attempted to add out of stock item.");
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={selectedVariant.stock === 0 || props.disabled}
      {...props}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {selectedVariant.stock === 0 ? 'Out of Stock' : children || 'Add to Cart'}
    </Button>
  );
}

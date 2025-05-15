
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
    // selectedVariant.stock should be quantityAvailable from Shopify
    // selectedVariant.availableForSale is also important
    if (selectedVariant.availableForSale && selectedVariant.stock > 0) {
      addToCart(product, selectedVariant, quantity);
    } else {
      // Toast is handled by addToCart if stock limit is hit
      console.warn("Attempted to add out of stock or unavailable item.");
    }
  };

  const isOutOfStock = !selectedVariant.availableForSale || selectedVariant.stock <= 0;

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={isOutOfStock || props.disabled}
      {...props}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isOutOfStock ? 'Out of Stock' : children || 'Add to Cart'}
    </Button>
  );
}

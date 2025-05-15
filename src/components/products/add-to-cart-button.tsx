
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

  // Determine if the variant can truly be added to cart
  const canAddToCart = selectedVariant.availableForSale && selectedVariant.stock > 0;

  // Determine the button text based on availability and stock
  let buttonText = 'Add to Cart';
  if (!selectedVariant.availableForSale) {
    buttonText = 'Not Available';
  } else if (selectedVariant.stock <= 0) {
    buttonText = 'Out of Stock';
  }
  
  const isDisabled = !canAddToCart || props.disabled;

  return (
    <Button 
      onClick={() => addToCart(product, selectedVariant, quantity)} 
      disabled={isDisabled}
      {...props}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {children ? children : buttonText}
    </Button>
  );
}

    
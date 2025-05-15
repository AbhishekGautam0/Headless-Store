
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

  // Main condition for addability is Shopify's availableForSale flag.
  const canAddToCart = selectedVariant.availableForSale;

  let buttonText = 'Add to Cart';
  if (!canAddToCart) {
    buttonText = 'Not Available';
  } else if (selectedVariant.stock === 0 && selectedVariant.availableForSale) {
    // If availableForSale is true but stock is 0, Shopify might allow backorders or it's untracked.
    // We still show "Add to Cart". The cart provider will handle stock limits if any.
    buttonText = 'Add to Cart'; 
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

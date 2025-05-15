
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { useCart } from './cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    // Let CartProvider handle all validation (stock, availability, and removal if quantity <= 0)
    updateQuantity(item.id, item.selectedVariant.id, newQuantity);
  };

  const incrementQuantity = () => handleQuantityChange(item.quantity + 1);
  const decrementQuantity = () => handleQuantityChange(item.quantity - 1); // CartProvider will handle if it goes to 0

  // Find the image associated with the variant, or fallback to the first product image
  const variantImage = item.selectedVariant.imageId 
    ? item.images.find(img => img.id === item.selectedVariant.imageId) 
    : null;
  const displayImage = variantImage || item.images[0] || { src: 'https://placehold.co/100x100.png', alt: 'Product image unavailable', id: 'placeholder-img' };


  return (
    <div className="flex py-4 space-x-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={displayImage.src}
          alt={displayImage.alt}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium">
            <h3>
              <Link href={`/products/${item.slug || item.id}`}>{item.name}</Link>
            </h3>
            <p className="ml-4">${(item.selectedVariant.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.selectedVariant.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">Unit Price: ${item.selectedVariant.price.toFixed(2)}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm mt-2">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrementQuantity} 
              disabled={item.quantity <= 0} // Disable if 0, updateQuantity will handle removal if it becomes 0
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                    handleQuantityChange(val);
                }
              }}
              className="mx-2 h-8 w-12 text-center"
              min="0" // Allow 0 for direct input leading to removal by provider
              // Stock max is handled by provider logic
              readOnly // Better to control quantity via buttons for consistency
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={incrementQuantity} 
              disabled={!item.selectedVariant.availableForSale || (item.selectedVariant.stock > 0 && item.quantity >= item.selectedVariant.stock)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromCart(item.id, item.selectedVariant.id)}
              className="font-medium text-primary hover:text-primary/80"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
         {!item.selectedVariant.availableForSale && (
            <p className="text-xs text-destructive mt-1">This variant is currently not available.</p>
        )}
         {item.selectedVariant.availableForSale && item.selectedVariant.stock > 0 && item.selectedVariant.stock < 5 && item.quantity < item.selectedVariant.stock && (
            <p className="text-xs text-orange-600 mt-1">Only {item.selectedVariant.stock - item.quantity} more left in stock!</p>
        )}
        {item.selectedVariant.availableForSale && item.selectedVariant.stock > 0 && item.quantity >= item.selectedVariant.stock && (
             <p className="text-xs text-destructive mt-1">Maximum stock reached for this item.</p>
        )}
      </div>
    </div>
  );
}

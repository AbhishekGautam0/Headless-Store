'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { useCart } from './cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.selectedVariant.stock) {
      updateQuantity(item.id, item.selectedVariant.id, newQuantity);
    } else if (newQuantity > item.selectedVariant.stock) {
      updateQuantity(item.id, item.selectedVariant.id, item.selectedVariant.stock);
    }
  };

  const incrementQuantity = () => handleQuantityChange(item.quantity + 1);
  const decrementQuantity = () => handleQuantityChange(item.quantity - 1);

  const productImage = item.images.find(img => img.id === item.selectedVariant.imageId) || item.images[0];


  return (
    <div className="flex py-4 space-x-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={productImage.src}
          alt={productImage.alt}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          className="object-cover"
          data-ai-hint={productImage.dataAiHint || "product image"}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium">
            <h3>
              <Link href={`/products/${item.slug}`}>{item.name}</Link>
            </h3>
            <p className="ml-4">${(item.selectedVariant.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.selectedVariant.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">Unit Price: ${item.selectedVariant.price.toFixed(2)}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm mt-2">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={item.quantity <= 1} className="h-8 w-8">
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              className="mx-2 h-8 w-12 text-center"
              min="1"
              max={item.selectedVariant.stock}
            />
            <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={item.quantity >= item.selectedVariant.stock} className="h-8 w-8">
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
      </div>
    </div>
  );
}

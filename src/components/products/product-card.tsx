import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { AddToCartButton } from './add-to-cart-button'; // Re-using the detailed button

export function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants[0]; // Default to first variant for card's Add to Cart

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block aspect-[3/4] relative">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            data-ai-hint={product.images[0].dataAiHint || "product photo"}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`}>
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <p className="text-lg font-semibold text-primary">
          ${firstVariant.price.toFixed(2)}
        </p>
        {firstVariant && (
          <AddToCartButton product={product} selectedVariant={firstVariant} className="w-full sm:w-auto" size="sm">
            Add to Cart
          </AddToCartButton>
        )}
      </CardFooter>
    </Card>
  );
}


import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { AddToCartButton } from './add-to-cart-button';

export function ProductCard({ product }: { product: Product }) {
  // Find the first available variant (relying on availableForSale) or fallback to the very first variant.
  const firstAvailableVariant = product.variants.find(v => v.availableForSale) || product.variants[0];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block aspect-[3/4] relative">
          <Image
            src={product.images[0]?.src || 'https://placehold.co/600x800.png'} // Fallback image
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`}>
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <div 
            className="mt-2 text-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') }}
        />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <p className="text-lg font-semibold text-primary">
          ${product.price.toFixed(2)} {/* Using the minVariantPrice from Product type */}
        </p>
        {firstAvailableVariant && (
          <AddToCartButton 
            product={product} 
            selectedVariant={firstAvailableVariant} 
            className="w-full sm:w-auto" 
            size="sm"
            // Disabled state and text are now handled internally by AddToCartButton
            // based on firstAvailableVariant.availableForSale
          />
        )}
      </CardFooter>
    </Card>
  );
}

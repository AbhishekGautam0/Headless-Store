'use client'; // Needs to be client component for useState (variant selection) and useCart

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // `notFound` from `next/navigation` is for server components primarily
import { getProductBySlug } from '@/lib/mock-data';
import type { Product, Variant } from '@/lib/types';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// No specific metadata function for client components in App Router easily
// Metadata would typically be in a server component parent or generateMetadata if this was server rendered.

export default function ProductPage() {
  const params = useParams();
  const productId = typeof params.productId === 'string' ? params.productId : '';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      const fetchedProduct = getProductBySlug(productId); // Using slug as productId from URL
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setSelectedVariant(fetchedProduct.variants[0]); // Default to first variant
      } else {
        // Product not found, setProduct to null to trigger not found message
        setProduct(null);
      }
      setIsLoading(false);
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="page-width py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-md" />)}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
        <div className="page-width py-12 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="text-muted-foreground mt-2">
            Sorry, we couldn&apos;t find the product you&apos;re looking for.
          </p>
           <Button asChild className="mt-6">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      );
  }
  
  // Ensure selectedVariant is set if product is available but variant wasn't (e.g. after initial load)
  if (product && !selectedVariant && product.variants.length > 0) {
    setSelectedVariant(product.variants[0]);
    return null; // Re-render will occur with selectedVariant
  }
  
  if (!selectedVariant && product.variants.length === 0) {
     return (
        <div className="page-width py-12 text-center">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground mt-2">
            This product currently has no variants available.
          </p>
           <Button asChild className="mt-6">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      );
  }
  
  if (!selectedVariant) { // Should ideally not be reached if product exists and has variants
      return (
        <div className="page-width py-12 text-center">
          <h1 className="text-2xl font-semibold">Variant not available</h1>
           <Button asChild className="mt-6">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      );
  }


  return (
    <div className="page-width py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ProductImageGallery images={product.images} productName={product.name} />
        <div className="space-y-6 py-4">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{product.name}</h1>
          
          <p className="text-2xl lg:text-3xl font-semibold text-primary">
            ${selectedVariant.price.toFixed(2)}
          </p>

          <Separator />

          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <Separator />
          
          <ProductVariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          
          <AddToCartButton 
            product={product} 
            selectedVariant={selectedVariant}
            className="w-full text-lg py-6"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

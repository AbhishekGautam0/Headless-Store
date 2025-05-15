'use client'; // Needs to be client component for useState (variant selection) and useCart

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/mock-data';
import type { Product, Variant } from '@/lib/types';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

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
        // Handle product not found, though `notFound()` should be called from server component if possible
        // For client component, we might redirect or show a not found message
        console.error("Product not found"); 
      }
      setIsLoading(false);
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
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

  if (!product || !selectedVariant) {
     // This is a client-side not found. For proper 404, it's better handled server-side.
     // For now, just returning a message. In a real app, you might redirect or use error boundaries.
    return (
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="text-muted-foreground mt-2">
            Sorry, we couldn&apos;t find the product you&apos;re looking for.
          </p>
        </div>
      );
  }


  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
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

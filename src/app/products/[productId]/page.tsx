
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getProductByHandle } from '@/lib/shopify';
import type { Product, Variant } from '@/lib/types';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = typeof params.productId === 'string' ? params.productId : '';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (productSlug) {
      setIsLoading(true);
      setFetchError(null);
      getProductByHandle(productSlug)
        .then(({ product: fetchedProduct, error: apiError }) => {
          if (apiError) {
            console.error("API Error fetching product:", apiError);
            setFetchError(`Failed to load product details: ${apiError}`);
            if (apiError.toLowerCase().includes('not found') || (apiError.toLowerCase().includes('unauthorized') && apiError.toLowerCase().includes('shopify api access denied'))) {
                 // Let notFound handle specific cases, or handle gracefully
            }
          } else if (fetchedProduct) {
            setProduct(fetchedProduct);
            if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
              // Prioritize selecting a variant that is available for sale AND has stock
              const initiallyAvailableVariant = fetchedProduct.variants.find(v => v.availableForSale && v.stock > 0);
              setSelectedVariant(initiallyAvailableVariant || fetchedProduct.variants[0]);
            } else {
              setSelectedVariant(null); // No variants for this product
            }
            document.title = `${fetchedProduct.name} - Shopify Headless Express`;
          } else {
            setFetchError('Product not found.'); // Should trigger notFound() via the other useEffect
          }
        })
        .catch(err => {
          console.error("General failure to fetch product:", err);
          setFetchError('An unexpected error occurred while loading product details.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setFetchError('Product ID missing.'); // Should trigger notFound()
    }
  }, [productSlug]);

  useEffect(() => {
    // Trigger Next.js 404 page if product not found, critical API error, or missing slug
    if (fetchError === 'Product not found.' || 
        (fetchError && fetchError.includes("UNAUTHORIZED") && fetchError.includes("Shopify API access denied")) ||
        fetchError === 'Product ID missing.') {
      notFound();
    }
  }, [fetchError]);


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

  // This check handles cases where fetchError occurred but wasn't one that should trigger a 404 (e.g. temporary network issue)
  // It also handles if product is still null after loading for some unexpected reason.
  if (fetchError && (fetchError !== 'Product not found.' && !(fetchError.includes("UNAUTHORIZED") && fetchError.includes("Shopify API access denied"))&& fetchError !== 'Product ID missing.')) {
    return (
      <div className="page-width py-12 text-center">
        <h1 className="text-2xl font-semibold text-destructive">{fetchError}</h1>
        <p className="text-muted-foreground mt-2">
          This could be due to a temporary issue or incorrect Shopify configuration.
        </p>
        {(fetchError.includes("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") || fetchError.includes("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN") || fetchError.toLowerCase().includes("enotfound")) && (
           <p className="text-muted-foreground mt-1">
            <strong>Action:</strong> This suggests a configuration problem. Please check your <strong>server console</strong> for detailed logs from the Shopify library (they usually start with "[Shopify Lib Startup]" or "Error in shopifyFetch"). These logs appear when you restart your development server and can help confirm if your <code>.env.local</code> file is set up correctly.
          </p>
        )}
         <Button asChild className="mt-6">
          <Link href="/shop">Go to Shop</Link>
        </Button>
      </div>
    );
  }
  
  if (!product) { 
    // This case should ideally be caught by isLoading or fetchError leading to notFound().
    // If reached, it means product is null after loading without a specific fetchError handled above.
    return (
        <div className="page-width py-12 text-center">
          <h1 className="text-2xl font-semibold">Product information is currently unavailable.</h1>
           <p className="text-muted-foreground mt-2">If this issue persists, please check the server console for error messages.</p>
           <Button asChild className="mt-6">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      );
  }
  
  // Product is loaded, now check variants and selectedVariant
  if (product.variants.length === 0 || !selectedVariant) {
     // This means the product object exists, but it either has no variants defined,
     // or somehow selectedVariant couldn't be set (e.g. if variants array was empty).
     return (
        <div className="page-width py-12 text-center">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground mt-2">
            This product currently has no purchaseable options available.
          </p>
           <Button asChild className="mt-6">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      );
  }

  // If we reach here, product and selectedVariant are available
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

          {product.description && (
            <div 
              className="prose prose-sm text-muted-foreground max-w-none" 
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <Separator />
          
          {/* Render variant selector only if there's more than one variant to choose from */}
          {product.variants.length > 1 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
          )}
          
          <AddToCartButton 
            product={product} 
            selectedVariant={selectedVariant}
            className="w-full text-lg py-6"
            size="lg"
            disabled={!selectedVariant.availableForSale || selectedVariant.stock <= 0}
          >
            {(!selectedVariant.availableForSale || selectedVariant.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

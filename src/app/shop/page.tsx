
import Link from 'next/link';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/shopify';
import type { Metadata } from 'next';
import type { PageInfo } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our collection of high-quality products.',
};

const ITEMS_PER_PAGE = 12;

interface ShopPageProps {
  searchParams?: {
    cursor?: string;
    direction?: 'next' | 'prev';
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const cursor = searchParams?.cursor;

  const { products: productsToShow, pageInfo, error } = await getProducts({
    first: ITEMS_PER_PAGE,
    after: cursor, 
  });

  if (error) {
    return (
      <div className="page-width py-12 text-center">
        <h1 className="text-2xl font-semibold text-destructive">Error Loading Products</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <p className="text-muted-foreground mt-4">
          Please ensure your Shopify integration is configured correctly in <code>.env.local</code>.
        </p>
        <p className="text-muted-foreground mt-1">
          <strong>Action:</strong> Check your <strong>server console</strong> for logs starting with "[Shopify Lib Startup]" or "Error in shopifyFetch" immediately after restarting your development server. This will show if the environment variables are being loaded.
        </p>
         <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-width py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Collection</h1>
      
      {productsToShow.length === 0 && cursor ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            Oops! It looks like there are no more products to show.
          </p>
          <Button asChild>
            <Link href="/shop">Go to First Page</Link>
          </Button>
        </div>
      ) : productsToShow.length === 0 && !cursor ? (
         <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            No products available at the moment. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsToShow.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex justify-center items-center space-x-4 mt-12">
        {cursor && ( 
          <Button asChild variant="outline">
            <Link href={`/shop`}>First Page</Link> 
          </Button>
        )}
        
        {pageInfo.hasNextPage && pageInfo.endCursor && (
          <Button asChild variant="outline">
            <Link href={`/shop?cursor=${pageInfo.endCursor}&direction=next`}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}


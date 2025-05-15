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
    direction?: 'next' | 'prev'; // We'll simplify 'prev' for now
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const cursor = searchParams?.cursor;
  // Shopify's primary pagination is forward with `after: cursor`. 
  // Implementing true 'previous' with cursors requires `before: cursor` and potentially `last: N` items.
  // For simplicity, "previous" will link to the start or not be shown if on the first pseudo-page.

  const { products: productsToShow, pageInfo } = await getProducts({
    first: ITEMS_PER_PAGE,
    after: cursor, 
  });

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
        {/* A true 'previous' button with Shopify cursors is complex. 
            This link takes to the first page. 
            A more robust solution would store previous cursors or use 'before' cursors if needed.
        */}
        {cursor && ( // Show "Previous" if not on the first page (i.e., a cursor exists)
          <Button asChild variant="outline">
            <Link href={`/shop`}>First Page</Link> 
          </Button>
        )}
        
        {/* Basic page info - could be enhanced if total count was easily available */}
        {/* <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} // This is harder with cursor pagination
        </span> */}

        {pageInfo.hasNextPage && pageInfo.endCursor && (
          <Button asChild variant="outline">
            <Link href={`/shop?cursor=${pageInfo.endCursor}&direction=next`}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

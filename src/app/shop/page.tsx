
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

type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';

interface ShopPageProps {
  searchParams?: {
    cursor?: string;
    filter?: AvailabilityFilter;
    // The 'direction' param was not actively used for cursor pagination, so it's removed.
    // query?: string; // For text search, if implemented later
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const cursor = searchParams?.cursor;
  const currentFilter = searchParams?.filter || 'all';

  const { products: productsToShow, pageInfo, error } = await getProducts({
    first: ITEMS_PER_PAGE,
    after: cursor,
    availabilityFilter: currentFilter,
    // query: searchParams?.query, // Pass text search query if implemented
  });

  if (error) {
    return (
      <div className="page-width py-12 text-center">
        <h1 className="text-2xl font-semibold text-destructive">Error Loading Products</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        {(error.includes("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") || error.includes("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN") || error.toLowerCase().includes("unauthorized") || error.toLowerCase().includes("enotfound")) && (
          <p className="text-muted-foreground mt-4">
            <strong>Action:</strong> This appears to be a configuration issue. Please check your <strong>server console</strong> for detailed logs (they start with "[Shopify Lib Startup]" or "Error in shopifyFetch") immediately after restarting your development server. This will show if the environment variables in <code>.env.local</code> are being loaded and used correctly.
          </p>
        )}
         <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const createFilterLink = (newFilterValue: AvailabilityFilter) => {
    const params = new URLSearchParams();
    // If a text search query parameter (e.g., 'q') exists, preserve it
    // if (searchParams?.query) params.set('q', searchParams.query); 
    if (newFilterValue !== 'all') {
      params.set('filter', newFilterValue);
    }
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };
  
  const createPaginationLink = (newCursor?: string) => {
    const params = new URLSearchParams();
    if (newCursor) {
      params.set('cursor', newCursor);
    }
    if (currentFilter !== 'all') {
      params.set('filter', currentFilter);
    }
    // if (searchParams?.query) params.set('q', searchParams.query);
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  }


  return (
    <div className="page-width py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Our Collection</h1>

      <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 text-sm sm:text-base">
        <Button variant={currentFilter === 'all' ? 'default' : 'outline'} size="sm" asChild>
          <Link href={createFilterLink('all')}>All Products</Link>
        </Button>
        <Button variant={currentFilter === 'in-stock' ? 'default' : 'outline'} size="sm" asChild>
          <Link href={createFilterLink('in-stock')}>In Stock</Link>
        </Button>
        <Button variant={currentFilter === 'out-of-stock' ? 'default' : 'outline'} size="sm" asChild>
         <Link href={createFilterLink('out-of-stock')}>Out of Stock</Link>
        </Button>
      </div>
      
      {productsToShow.length === 0 && cursor ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            Oops! It looks like there are no more products to show for the current filter.
          </p>
          <Button asChild>
            <Link href={createFilterLink(currentFilter)}>Go to First Page of "{currentFilter}"</Link>
          </Button>
        </div>
      ) : productsToShow.length === 0 && !cursor ? (
         <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            No products available matching your filter. Check back soon!
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
            {/* Link to the first page of the current filter */}
            <Link href={createPaginationLink()}>First Page</Link> 
          </Button>
        )}
        
        {pageInfo.hasNextPage && pageInfo.endCursor && (
          <Button asChild variant="outline">
            <Link href={createPaginationLink(pageInfo.endCursor)}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ProductCard } from '@/components/products/product-card';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our collection of high-quality products.',
};

const ITEMS_PER_PAGE = 12;

interface ShopPageProps {
  searchParams?: {
    page?: string;
  };
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const totalProducts = mockProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productsToShow = mockProducts.slice(startIndex, endIndex);

  return (
    <div className="page-width py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Collection</h1>
      
      {productsToShow.length === 0 && currentPage > 1 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            Oops! It looks like there are no products on this page.
          </p>
          <Button asChild>
            <Link href="/shop?page=1">Go to First Page</Link>
          </Button>
        </div>
      ) : productsToShow.length === 0 && currentPage === 1 ? (
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-12">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link href={`/shop?page=${currentPage - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button asChild variant="outline">
              <Link href={`/shop?page=${currentPage + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

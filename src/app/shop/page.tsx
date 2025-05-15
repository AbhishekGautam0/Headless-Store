import { ProductCard } from '@/components/products/product-card';
import { mockProducts } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our collection of high-quality products.',
};

export default function ShopPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/shared/banner';
import { ImageWithText } from '@/components/shared/image-with-text';
import { ProductCard } from '@/components/products/product-card';
import { getProducts } from '@/lib/shopify';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Shopify Headless Express',
  description: 'Welcome to our modern e-commerce store.',
};

export default async function HomePage() {
  const { products: featuredProducts, error } = await getProducts({ first: 4 });

  return (
    <>
      <Banner
        title="Discover Your Style"
        subtitle="High-quality apparel and accessories for the modern individual."
        imageUrl="https://placehold.co/1920x1080.png"
        imageAlt="Stylish apparel collection"
        imageAiHint="fashion lifestyle"
      >
        <Button asChild size="lg" className="mt-8">
          <Link href="/shop">Shop Now</Link>
        </Button>
      </Banner>

      <ImageWithText
        imageUrl="https://placehold.co/800x600.png"
        imageAlt="Models wearing our latest collection"
        imageAiHint="fashion models"
        title="Crafted for Comfort & Style"
        text="Our collections are designed with passion, focusing on quality materials and timeless designs. Experience the perfect blend of comfort and style that fits your everyday life."
        imagePosition="left"
      >
        <Button asChild variant="outline">
          <Link href="/about">Learn More About Us</Link>
        </Button>
      </ImageWithText>
      
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="page-width">
          <h2 className="text-3xl font-bold text-center mb-10">Featured Products</h2>
          {error && (
            <p className="text-center text-destructive">Error loading products: {error}</p>
          )}
          {!error && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            !error && <p className="text-center text-muted-foreground">Could not load featured products at this time.</p>
          )}
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <ImageWithText
        imageUrl="https://placehold.co/800x600.png"
        imageAlt="Sustainable materials"
        imageAiHint="eco friendly"
        title="Sustainable Choices"
        text="We are committed to sustainability. Our products are made with eco-friendly materials and ethical practices, so you can look good and feel good about your choices."
        imagePosition="right"
      >
         <Button asChild variant="link" className="text-primary">
          <Link href="/about#sustainability">Our Sustainability Promise</Link>
        </Button>
      </ImageWithText>
    </>
  );
}

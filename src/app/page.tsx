
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
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/example-home-banner.png?v=1700000001" 
        imageAlt="Stylish apparel collection"
      >
        <Button asChild size="lg" className="mt-8">
          <Link href="/shop">Shop Now</Link>
        </Button>
      </Banner>

      <ImageWithText
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/example-home-comfort.png?v=1700000002"
        imageAlt="Models wearing our latest collection"
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
            <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md">
              <p className="font-semibold">Error loading featured products:</p>
              <p className="text-sm">{error}</p>
              {(error.includes("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") || error.includes("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN") || error.toLowerCase().includes("unauthorized") || error.toLowerCase().includes("enotfound")) && (
                <p className="text-sm mt-2">
                  <strong>Action:</strong> This seems to be a configuration issue. Please check your <strong>server console</strong> for detailed logs (they start with "[Shopify Lib Startup]" or "Error in shopifyFetch") immediately after restarting your development server. This will help verify if your <code>.env.local</code> file is being read correctly and if the credentials are valid.
                </p>
              )}
            </div>
          )}
          {!error && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            !error && <p className="text-center text-muted-foreground">Could not load featured products at this time. If this persists, check server console for errors.</p>
          )}
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <ImageWithText
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/example-home-sustainable.png?v=1700000003"
        imageAlt="Sustainable materials"
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

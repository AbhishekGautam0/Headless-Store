
import { Banner } from '@/components/shared/banner';
import { ImageWithText } from '@/components/shared/image-with-text';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Shopify Headless Express',
  description: 'Learn more about our mission, values, and the team behind Shopify Headless Express.',
};

export default function AboutPage() {
  return (
    <>
      <Banner
        title="About Shopify Express"
        subtitle="We're passionate about bringing you high-quality products with a seamless shopping experience."
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/8682067b3a9eb637a50f84db1e946a8c61c9f952.png?v=1745861710" 
        imageAlt="Our team working"
      />

      <ImageWithText
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/2015-05-14_Ashley_Look16_50029_22163_copy.jpg?v=1742985567"
        imageAlt="Person designing clothes"
        title="Our Mission"
        text="Our mission is to provide stylish, durable, and ethically sourced products that empower individuals to express themselves. We believe in quality craftsmanship and exceptional customer service, aiming to build a community around shared values of creativity and conscious consumption."
        imagePosition="left"
      />

      <ImageWithText
        // Example Shopify CDN URL. Replace with your actual image URL from Shopify Files.
        imageUrl="https://cdn.shopify.com/s/files/1/0652/9944/7977/files/2015-05-14_Ashley_Look3_50048_21859.jpg?v=1742985555"
        imageAlt="Ethically sourced materials"
        title="Values We Stand By"
        text={
          <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg">
            <li><strong>Quality:</strong> We use premium materials and ensure meticulous craftsmanship.</li>
            <li><strong>Sustainability:</strong> We are committed to eco-friendly practices and ethical sourcing.</li>
            <li><strong>Customer Focus:</strong> Your satisfaction is our top priority.</li>
            <li><strong>Innovation:</strong> We continuously seek new ways to improve our products and services.</li>
          </ul>
        }
        imagePosition="right"
      />
      
      <section id="sustainability" className="py-12 md:py-20 bg-muted/30">
        <div className="page-width text-center">
          <div className="max-w-3xl mx-auto"> 
            <h2 className="text-3xl font-bold mb-6">Our Commitment to Sustainability</h2>
            <p className="text-lg text-muted-foreground mb-4">
              We believe that fashion and sustainability can go hand in hand. We are dedicated to minimizing our environmental footprint by choosing sustainable materials, reducing waste in our production processes, and partnering with suppliers who share our commitment to ethical labor practices.
            </p>
            <p className="text-lg text-muted-foreground">
              Our goal is to create products that you can love for a long time, not just for a season. Join us on our journey towards a more sustainable future.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

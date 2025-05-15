import type { Product } from './types';

// This file can be kept for fallback or testing, but the app will primarily use Shopify API.
export const mockProducts: Product[] = [
  {
    id: 'gid://shopify/Product/1', // Example GID
    name: 'Classic Tee (Mock)',
    description: 'A comfortable and stylish classic t-shirt, perfect for everyday wear. Made from 100% premium cotton for a soft feel and lasting quality.',
    price: 29.99,
    slug: 'classic-tee-mock',
    images: [
      { id: 'gid://shopify/ProductImage/1-1', src: 'https://placehold.co/600x800.png', alt: 'Classic Tee Front' },
      { id: 'gid://shopify/ProductImage/1-2', src: 'https://placehold.co/600x800.png', alt: 'Classic Tee Back' },
    ],
    variants: [
      { id: 'gid://shopify/ProductVariant/1-s', name: 'Small', sku: 'CT-SML-BLK', price: 29.99, stock: 10, availableForSale: true, imageId: 'gid://shopify/ProductImage/1-1' },
      { id: 'gid://shopify/ProductVariant/1-m', name: 'Medium', sku: 'CT-MED-BLK', price: 29.99, stock: 15, availableForSale: true, imageId: 'gid://shopify/ProductImage/1-1' },
      { id: 'gid://shopify/ProductVariant/1-l', name: 'Large', sku: 'CT-LRG-BLK', price: 29.99, stock: 0, availableForSale: false, imageId: 'gid://shopify/ProductImage/1-1' },
    ],
    tags: ['apparel', 't-shirt', 'classic'],
  },
  // Add more mock products if needed for fallback scenarios
];

// These functions are now illustrative if Shopify API is primary.
export const getProductById_mock = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug_mock = (slug: string): Product | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

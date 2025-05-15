import type { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Tee',
    description: 'A comfortable and stylish classic t-shirt, perfect for everyday wear. Made from 100% premium cotton for a soft feel and lasting quality.',
    price: 29.99,
    slug: 'classic-tee',
    images: [
      { id: 'img1-1', src: 'https://placehold.co/600x800.png', alt: 'Classic Tee Front', dataAiHint: 'tshirt fashion' },
      { id: 'img1-2', src: 'https://placehold.co/600x800.png', alt: 'Classic Tee Back', dataAiHint: 'model wearing' },
    ],
    variants: [
      { id: 'v1-s', name: 'Small', sku: 'CT-SML-BLK', price: 29.99, stock: 10 },
      { id: 'v1-m', name: 'Medium', sku: 'CT-MED-BLK', price: 29.99, stock: 15 },
      { id: 'v1-l', name: 'Large', sku: 'CT-LRG-BLK', price: 29.99, stock: 5 },
    ],
    tags: ['apparel', 't-shirt', 'classic'],
  },
  {
    id: '2',
    name: 'Modern Hoodie',
    description: 'Stay warm and trendy with our modern hoodie. Features a sleek design, soft fleece lining, and durable construction.',
    price: 59.99,
    slug: 'modern-hoodie',
    images: [
      { id: 'img2-1', src: 'https://placehold.co/600x800.png', alt: 'Modern Hoodie Front', dataAiHint: 'hoodie fashion' },
      { id: 'img2-2', src: 'https://placehold.co/600x800.png', alt: 'Modern Hoodie Detail', dataAiHint: 'clothing detail' },
    ],
    variants: [
      { id: 'v2-m-grey', name: 'Medium - Grey', sku: 'MH-MED-GRY', price: 59.99, stock: 8 },
      { id: 'v2-l-grey', name: 'Large - Grey', sku: 'MH-LRG-GRY', price: 59.99, stock: 12 },
      { id: 'v2-xl-blue', name: 'XL - Blue', sku: 'MH-XL-BLU', price: 62.99, stock: 7 },
    ],
    tags: ['apparel', 'hoodie', 'modern', 'warm'],
  },
  {
    id: '3',
    name: 'Urban Cap',
    description: 'Complete your look with this stylish urban cap. Adjustable fit and breathable fabric for all-day comfort.',
    price: 24.99,
    slug: 'urban-cap',
    images: [
      { id: 'img3-1', src: 'https://placehold.co/600x600.png', alt: 'Urban Cap', dataAiHint: 'cap hat' },
    ],
    variants: [
      { id: 'v3-os-black', name: 'One Size - Black', sku: 'UC-OS-BLK', price: 24.99, stock: 20 },
      { id: 'v3-os-red', name: 'One Size - Red', sku: 'UC-OS-RED', price: 24.99, stock: 15 },
    ],
    tags: ['accessory', 'cap', 'urban'],
  },
   {
    id: '4',
    name: 'Minimalist Backpack',
    description: 'A sleek and functional backpack for your daily essentials. Features multiple compartments and a water-resistant exterior.',
    price: 79.99,
    slug: 'minimalist-backpack',
    images: [
      { id: 'img4-1', src: 'https://placehold.co/600x700.png', alt: 'Minimalist Backpack Front', dataAiHint: 'backpack travel' },
      { id: 'img4-2', src: 'https://placehold.co/600x700.png', alt: 'Minimalist Backpack Side', dataAiHint: 'bag accessory' },
    ],
    variants: [
      { id: 'v4-std-charcoal', name: 'Standard - Charcoal', sku: 'MB-STD-CHR', price: 79.99, stock: 9 },
      { id: 'v4-std-olive', name: 'Standard - Olive', sku: 'MB-STD-OLV', price: 79.99, stock: 6 },
    ],
    tags: ['accessory', 'backpack', 'minimalist', 'travel'],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

export interface Variant {
  id: string;
  name: string; // e.g., "Small", "Red"
  sku: string;
  price: number;
  stock: number;
  imageId?: string; // Optional: if variant has a specific image
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  dataAiHint?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price, variants can override
  images: ProductImage[];
  variants: Variant[];
  slug: string;
  tags?: string[];
}

export interface CartItem extends Product {
  selectedVariant: Variant;
  quantity: number;
}

export interface Variant {
  id: string; // Shopify GID, e.g., "gid://shopify/ProductVariant/12345"
  name: string; // e.g., "Small / Red"
  sku: string | null;
  price: number;
  stock: number;
  imageId?: string | null; // Shopify GID for an image
  availableForSale: boolean;
}

export interface ProductImage {
  id: string; // Shopify GID, e.g., "gid://shopify/ProductImage/67890"
  src: string; // URL
  alt: string;
}

export interface Product {
  id: string; // Shopify GID, e.g., "gid://shopify/Product/123"
  name: string;
  description: string; // HTML description from Shopify
  price: number; // Min variant price
  images: ProductImage[];
  variants: Variant[];
  slug: string; // Shopify handle
  tags?: string[];
}

export interface CartItem extends Product {
  selectedVariant: Variant;
  quantity: number;
}

// For Shopify API responses
export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku?: string | null;
        quantityAvailable?: number | null;
        availableForSale: boolean;
        priceV2: {
          amount: string;
          currencyCode: string;
        };
        image?: {
          id: string;
          url: string;
          altText?: string | null;
        } | null;
      };
    }>;
  };
}

export interface ShopifyCollectionNode {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  image: {
    id: string;
    url: string;
    altText?: string | null;
  } | null;
  products: {
    edges: Array<{
      cursor: string;
      node: ShopifyProductNode;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string | null;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
  hasPreviousPage: boolean;
  startCursor?: string | null;
}

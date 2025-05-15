// IMPORTANT: Replace 'YOUR_SHOP_NAME_HERE' with your Shopify store's name.
// e.g., if your store is my-store.myshopify.com, use 'my-store'
const SHOP_NAME = 'YOUR_SHOP_NAME_HERE';
const API_VERSION = '2024-04'; // Or your desired API version

// IMPORTANT: These should be stored in environment variables (.env.local)
// For example:
// NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shop-name.myshopify.com
// NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_access_token
// Then access them via process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const SHOPIFY_STORE_DOMAIN = `${SHOP_NAME}.myshopify.com`;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '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';

const SHOPIFY_API_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

import type { Product, Variant, ProductImage, ShopifyProductNode, PageInfo } from './types';

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ status: number; body: T } | never> {
  if (SHOP_NAME === 'YOUR_SHOP_NAME_HERE') {
    console.error("Shopify store name is not configured in src/lib/shopify.ts. Please replace 'YOUR_SHOP_NAME_HERE'.");
    // Fallback to empty data or throw error to prevent app crash in unconfigured state
    // Depending on how you want to handle this, you might return a specific error structure
    return { 
        status: 500, 
        body: { errors: [{ message: "Shopify store not configured."}] } as any 
    };
  }
  try {
    const result = await fetch(SHOPIFY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', // Consider 'force-cache' or Next.js caching strategies for production
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    console.error(e);
    throw {
      error: e,
      query,
    };
  }
}

function mapShopifyProductToInternal(node: ShopifyProductNode): Product {
  return {
    id: node.id,
    name: node.title,
    slug: node.handle,
    description: node.descriptionHtml,
    tags: node.tags || [],
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    images: node.images.edges.map(edge => ({
      id: edge.node.id,
      src: edge.node.url,
      alt: edge.node.altText || node.title,
    })),
    variants: node.variants.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.title,
      sku: edge.node.sku || null,
      price: parseFloat(edge.node.priceV2.amount),
      stock: edge.node.quantityAvailable || 0,
      availableForSale: edge.node.availableForSale,
      imageId: edge.node.image?.id || null,
    })),
  };
}

const GetProductsQuery = `
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges {
        cursor
        node {
          id
          title
          handle
          descriptionHtml
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 2) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                quantityAvailable
                availableForSale
                priceV2 {
                  amount
                  currencyCode
                }
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage # Though Shopify Storefront API typically uses forward pagination
        startCursor # Same as above
      }
    }
  }
`;

export async function getProducts({
  first = 12,
  after,
  query,
  sortKey,
  reverse,
}: {
  first?: number;
  after?: string | null;
  query?: string;
  sortKey?: string; // e.g., "TITLE", "PRICE", "CREATED_AT"
  reverse?: boolean;
}): Promise<{ products: Product[]; pageInfo: PageInfo }> {
  const response = await shopifyFetch<{ data: { products: { edges: Array<{ node: ShopifyProductNode, cursor: string }>, pageInfo: PageInfo } } }>({
    query: GetProductsQuery,
    variables: { first, after, query, sortKey, reverse },
  });

  if (!response.body.data || !response.body.data.products) {
    // Handle case where SHOP_NAME might not be set and API call returns error structure
    if (response.body && (response.body as any).errors) {
      console.error("Error fetching products:", (response.body as any).errors);
    } else {
      console.error("Error fetching products: No data returned from Shopify API");
    }
    return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } };
  }

  const products = response.body.data.products.edges.map(edge => mapShopifyProductToInternal(edge.node));
  
  return {
    products,
    pageInfo: response.body.data.products.pageInfo,
  };
}


const GetProductByHandleQuery = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            sku
            quantityAvailable
            availableForSale
            priceV2 {
              amount
              currencyCode
            }
            image {
              id
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const response = await shopifyFetch<{ data: { productByHandle: ShopifyProductNode | null } }>({
    query: GetProductByHandleQuery,
    variables: { handle },
  });
  
  if (!response.body.data) {
     if (response.body && (response.body as any).errors) {
      console.error(`Error fetching product ${handle}:`, (response.body as any).errors);
    } else {
      console.error(`Error fetching product ${handle}: No data returned from Shopify API`);
    }
    return null;
  }


  if (!response.body.data.productByHandle) {
    return null;
  }
  return mapShopifyProductToInternal(response.body.data.productByHandle);
}

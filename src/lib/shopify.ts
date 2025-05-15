
// Environment variables should be set in .env.local
// NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shop-name.myshopify.com
// NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_access_token

// Log the values read from process.env when the module is loaded
// This helps debug if .env.local is picked up at server start
console.log(`[Shopify Lib Startup] Raw process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: '${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}'`);
console.log(`[Shopify Lib Startup] Raw process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: '${process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ? '******** (loaded)' : 'undefined'}'`);

const API_VERSION = '2024-04'; // Or your desired API version

import type { Product, ShopifyProductNode, PageInfo } from './types';
import { mockProducts } from './mock-data'; // Keep for fallback

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ status: number; body: T } | never> {
  // Read environment variables directly inside the function
  const currentShopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const currentShopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  const storeDomainPlaceholder = 'your-shop-name.myshopify.com';
  const tokenPlaceholder = 'your_public_storefront_access_token';

  if (!currentShopifyDomain || currentShopifyDomain === storeDomainPlaceholder) {
    const errorMessage = `Shopify store domain (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) is not configured correctly in your .env.local file. Expected format: your-actual-shop-name.myshopify.com. Current value from process.env: '${currentShopifyDomain}'. Please ensure it's set correctly and restart your development server.`;
    console.error("Error in shopifyFetch:", errorMessage);
    return { 
        status: 500, 
        body: { errors: [{ message: errorMessage }] } as any 
    };
  }
  if (!currentShopifyToken || currentShopifyToken === tokenPlaceholder) {
    const errorMessage = `Shopify Storefront Access Token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) is not configured correctly in your .env.local file. Current value from process.env: '${currentShopifyToken ? '********' : 'undefined'}'. Please ensure it's set to your actual token and restart your development server.`;
    console.error("Error in shopifyFetch:", errorMessage);
    return { 
        status: 500, 
        body: { errors: [{ message: errorMessage }] } as any 
    };
  }

  const SHOPIFY_API_ENDPOINT = `https://${currentShopifyDomain}/api/${API_VERSION}/graphql.json`;

  try {
    const result = await fetch(SHOPIFY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': currentShopifyToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', 
    });

    const body = await result.json();

    if (body.errors) {
      console.error('Shopify API Error in shopifyFetch:', JSON.stringify(body.errors, null, 2));
      const isUnauthorized = body.errors.some((err: any) => err.extensions?.code === 'UNAUTHORIZED' || err.message?.toLowerCase().includes('unauthorized'));
      if (isUnauthorized) {
         const specificError = `Shopify API Error: UNAUTHORIZED. Please check if your Storefront Access Token is correct, has the necessary permissions (e.g., unauthenticated_read_product_listings), and that your store is not password protected. Token used: ${currentShopifyToken ? currentShopifyToken.substring(0,5) + '...' : 'N/A'}`;
         console.error("Error in shopifyFetch (Unauthorized):", specificError);
         return {
          status: result.status,
          body: { errors: [{ message: specificError, originalErrors: body.errors }] } as any,
        };
      }
      return {
        status: result.status,
        body: { errors: body.errors } as any,
      };
    }

    return {
      status: result.status,
      body,
    };
  } catch (e: any) {
    console.error('Fetch Error to Shopify API in shopifyFetch:', e);
    let errorMessage = 'Failed to fetch from Shopify API.';
    if (e.message) {
        errorMessage = e.message;
    }
     if (e.cause && (e.cause as any).code === 'ENOTFOUND') {
      errorMessage = `Could not resolve Shopify domain: ${currentShopifyDomain}. Please ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is correct in .env.local.`;
      console.error("Error in shopifyFetch (ENOTFOUND):", errorMessage);
    }
    return {
        status: 503, 
        body: { errors: [{ message: errorMessage, details: e.toString() }] } as any,
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
        hasPreviousPage
        startCursor
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
  sortKey?: string;
  reverse?: boolean;
}): Promise<{ products: Product[]; pageInfo: PageInfo; error?: string }> {
  // Read environment variables directly inside the function
  const currentShopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const currentShopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // Initial check for env vars before even attempting a fetch
  if (!currentShopifyDomain || currentShopifyDomain === 'your-shop-name.myshopify.com') {
    const errorMsg = `Error in getProducts: Shopify store domain (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) is not properly configured in your .env.local file. Current value from process.env: '${currentShopifyDomain}'. Please set it (e.g., your-shop.myshopify.com) and restart your server. Using mock data as fallback.`;
    console.error(errorMsg);
    return { products: mockProducts.slice(0, first), pageInfo: { hasNextPage: mockProducts.length > first, hasPreviousPage: false }, error: errorMsg };
  }
  if (!currentShopifyToken || currentShopifyToken === 'your_public_storefront_access_token') {
    const errorMsg = `Error in getProducts: Shopify Storefront Access Token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) is not properly configured in your .env.local file. Current value from process.env: '${currentShopifyToken ? '********' : 'undefined'}'. Please set it and restart your server. Using mock data as fallback.`;
    console.error(errorMsg);
    return { products: mockProducts.slice(0, first), pageInfo: { hasNextPage: mockProducts.length > first, hasPreviousPage: false }, error: errorMsg };
  }

  const response = await shopifyFetch<{ data?: { products: { edges: Array<{ node: ShopifyProductNode, cursor: string }>, pageInfo: PageInfo } }, errors?: Array<{message: string, extensions?: any}> }>({
    query: GetProductsQuery,
    variables: { first, after, query, sortKey, reverse },
  });

  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0];
    let errorMessage = primaryError.message;
     if (primaryError.extensions?.code === 'UNAUTHORIZED') {
      errorMessage = `UNAUTHORIZED: Shopify API access denied in getProducts. Check your Storefront Access Token, its permissions, and store password status. Token used: ${currentShopifyToken ? currentShopifyToken.substring(0,5) + '...' : 'N/A'}`;
    }
    console.error("Error from Shopify API in getProducts:", errorMessage, JSON.stringify(response.body.errors, null, 2));
    return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: errorMessage };
  }
  
  if (!response.body.data || !response.body.data.products) {
    const errorMsg = "Malformed response from Shopify API in getProducts (no data.products).";
    console.error(errorMsg, "Response body:", response.body);
    return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: errorMsg };
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

export async function getProductByHandle(handle: string): Promise<{product: Product | null; error?: string}> {
  const currentShopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const currentShopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!currentShopifyDomain || currentShopifyDomain === 'your-shop-name.myshopify.com') {
    const errorMsg = `Error in getProductByHandle: Shopify store domain (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) is not properly configured. Current value from process.env: '${currentShopifyDomain}'. Please set it in .env.local and restart server.`;
    console.error(errorMsg);
    return { product: null, error: errorMsg };
  }
  if (!currentShopifyToken || currentShopifyToken === 'your_public_storefront_access_token') {
    const errorMsg = `Error in getProductByHandle: Shopify Storefront Access Token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) is not properly configured. Current value from process.env: '${currentShopifyToken ? '********' : 'undefined'}'. Please set it in .env.local and restart server.`;
    console.error(errorMsg);
    return { product: null, error: errorMsg };
  }

  const response = await shopifyFetch<{ data?: { productByHandle: ShopifyProductNode | null }, errors?: Array<{message: string, extensions?: any}> }>({
    query: GetProductByHandleQuery,
    variables: { handle },
  });
  
  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0];
     let errorMessage = primaryError.message;
     if (primaryError.extensions?.code === 'UNAUTHORIZED') {
      errorMessage = `UNAUTHORIZED: Shopify API access denied for product ${handle} in getProductByHandle. Check your Storefront Access Token, its permissions, and store password status. Token used: ${currentShopifyToken ? currentShopifyToken.substring(0,5) + '...' : 'N/A'}`;
    }
    console.error(`Error fetching product ${handle} from Shopify in getProductByHandle:`, errorMessage, JSON.stringify(response.body.errors, null, 2));
    return { product: null, error: errorMessage };
  }

  if (!response.body.data) {
     const errorMsg = `Malformed response from Shopify API when fetching product ${handle} in getProductByHandle (no data).`;
    console.error(errorMsg, "Response body:", response.body);
    return { product: null, error: errorMsg };
  }

  if (!response.body.data.productByHandle) {
    const errorMsg = `Product with handle '${handle}' not found or issue with Shopify API response in getProductByHandle.`;
    return { product: null, error: response.body.data ? undefined : errorMsg };
  }
  return { product: mapShopifyProductToInternal(response.body.data.productByHandle) };
}

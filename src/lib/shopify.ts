
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

  const genericDomainPlaceholder = 'techifyservices.myshopify.com'; // Updated placeholder
  const genericTokenPlaceholder = '26411d104ed09de75889b1bfa38573ab'; // Updated placeholder

  if (!currentShopifyDomain || currentShopifyDomain === genericDomainPlaceholder) {
    const errorMessage = `Critical Error in shopifyFetch: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is missing or incorrect. 
    Current value from process.env: '${currentShopifyDomain}'.
    ➡️ Please ensure your .env.local file exists in the project root, contains 'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-actual-shop.myshopify.com', and that you have RESTARTED your development server.`;
    console.error(errorMessage);
    return { 
        status: 500, 
        body: { errors: [{ message: errorMessage }] } as any 
    };
  }
  if (!currentShopifyToken || currentShopifyToken === genericTokenPlaceholder) {
    const errorMessage = `Critical Error in shopifyFetch: NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing or incorrect. 
    Current value from process.env: '${currentShopifyToken ? '********' : 'undefined'}'.
    ➡️ Please ensure your .env.local file exists in the project root, contains your actual token, and that you have RESTARTED your development server.`;
    console.error(errorMessage);
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
      errorMessage = `Could not resolve Shopify domain: ${currentShopifyDomain}. Please ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is correct in .env.local and the server was restarted.`;
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
  
  const response = await shopifyFetch<{ data?: { products: { edges: Array<{ node: ShopifyProductNode, cursor: string }>, pageInfo: PageInfo } }, errors?: Array<{message: string, extensions?: any}> }>({
    query: GetProductsQuery,
    variables: { first, after, query, sortKey, reverse },
  });

  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0];
    let errorMessage = primaryError.message;
     // Check if the error message indicates an environment variable issue propagated from shopifyFetch
    if (errorMessage.includes("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") || errorMessage.includes("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN")) {
      console.error("Error in getProducts (propagated from shopifyFetch):", errorMessage);
      // Propagate the specific error message from shopifyFetch
      return { products: mockProducts.slice(0, first), pageInfo: { hasNextPage: mockProducts.length > first, hasPreviousPage: false }, error: errorMessage };
    }
    // Handle other Shopify API errors
    if (primaryError.extensions?.code === 'UNAUTHORIZED') {
      errorMessage = `UNAUTHORIZED: Shopify API access denied in getProducts. Check your Storefront Access Token, its permissions, and store password status.`;
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

  const response = await shopifyFetch<{ data?: { productByHandle: ShopifyProductNode | null }, errors?: Array<{message: string, extensions?: any}> }>({
    query: GetProductByHandleQuery,
    variables: { handle },
  });
  
  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0];
    let errorMessage = primaryError.message;
    // Check if the error message indicates an environment variable issue propagated from shopifyFetch
    if (errorMessage.includes("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") || errorMessage.includes("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN")) {
      console.error(`Error in getProductByHandle for ${handle} (propagated from shopifyFetch):`, errorMessage);
      return { product: null, error: errorMessage };
    }
    // Handle other Shopify API errors
    if (primaryError.extensions?.code === 'UNAUTHORIZED') {
      errorMessage = `UNAUTHORIZED: Shopify API access denied for product ${handle} in getProductByHandle. Check your Storefront Access Token, its permissions, and store password status.`;
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
    // Do not use mock data for a specific product not found.
    return { product: null, error: errorMsg };
  }
  return { product: mapShopifyProductToInternal(response.body.data.productByHandle) };
}


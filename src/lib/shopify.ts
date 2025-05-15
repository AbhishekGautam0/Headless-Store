
// Environment variables should be set in .env.local
// NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shop-name.myshopify.com
// NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_access_token

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const API_VERSION = '2024-04'; // Or your desired API version
const SHOPIFY_API_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

import type { Product, ShopifyProductNode, PageInfo } from './types';

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ status: number; body: T } | never> {
  if (!SHOPIFY_STORE_DOMAIN || SHOPIFY_STORE_DOMAIN === 'your-shop-name.myshopify.com' || SHOPIFY_STORE_DOMAIN === 'techifyservices') { // Added check for old hardcoded value possibility
    const errorMessage = `Shopify store domain (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) is not configured correctly in your .env.local file. Expected format: your-actual-shop-name.myshopify.com. Current value: '${SHOPIFY_STORE_DOMAIN}'. Please ensure it's set correctly and restart your development server.`;
    console.error(errorMessage);
    return { 
        status: 500, 
        body: { errors: [{ message: errorMessage }] } as any 
    };
  }
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN || SHOPIFY_STOREFRONT_ACCESS_TOKEN === 'your_public_storefront_access_token') {
    const errorMessage = `Shopify Storefront Access Token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) is not configured correctly in your .env.local file. Please ensure it's set to your actual token and restart your development server. Current value: '${SHOPIFY_STOREFRONT_ACCESS_TOKEN ? '********' : undefined}'.`;
    console.error(errorMessage);
    return { 
        status: 500, 
        body: { errors: [{ message: errorMessage }] } as any 
    };
  }

  try {
    const dynamicShopifyApiEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
    const result = await fetch(dynamicShopifyApiEndpoint, {
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
      console.error('Shopify API Error:', body.errors);
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
    console.error('Fetch Error to Shopify API:', e);
    let errorMessage = 'Failed to fetch from Shopify API.';
    if (e.message) {
        errorMessage = e.message;
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
  const response = await shopifyFetch<{ data?: { products: { edges: Array<{ node: ShopifyProductNode, cursor: string }>, pageInfo: PageInfo } }, errors?: Array<{message: string}> }>({
    query: GetProductsQuery,
    variables: { first, after, query, sortKey, reverse },
  });

  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0].message;
    console.error("Error fetching products from Shopify:", primaryError);
    return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: primaryError };
  }
  
  if (!response.body.data || !response.body.data.products) {
    const errorMsg = "Malformed response from Shopify API when fetching products (no data.products).";
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
  const response = await shopifyFetch<{ data?: { productByHandle: ShopifyProductNode | null }, errors?: Array<{message: string}> }>({
    query: GetProductByHandleQuery,
    variables: { handle },
  });
  
  if (response.body.errors && response.body.errors.length > 0) {
    const primaryError = response.body.errors[0].message;
    console.error(`Error fetching product ${handle} from Shopify:`, primaryError);
    return { product: null, error: primaryError };
  }

  if (!response.body.data) {
     const errorMsg = `Malformed response from Shopify API when fetching product ${handle} (no data).`;
    console.error(errorMsg, "Response body:", response.body);
    return { product: null, error: errorMsg };
  }

  if (!response.body.data.productByHandle) {
    return { product: null }; // Product genuinely not found by handle
  }
  return { product: mapShopifyProductToInternal(response.body.data.productByHandle) };
}


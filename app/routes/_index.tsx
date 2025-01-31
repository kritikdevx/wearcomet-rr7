import type { Route } from "./+types/_index";

import React, { Suspense } from "react";
import { Link } from "react-router";
import {
  flattenConnection,
  Image as ShopifyImage,
  Money,
} from "@shopify/hydrogen-react";
import type { Product } from "@shopify/hydrogen-react/storefront-api-types";

import { shopifyClient } from "~/libs/shopify";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
    body: JSON.stringify({
      query:
        /* GraphQL */
        `
          query {
            products(first: 200) {
              edges {
                node {
                  id
                  title
                  handle
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
    }),
    // Generate the headers using the private token.
    headers: shopifyClient.getPublicTokenHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const products = new Promise<Product[]>((resolve) => {
    resolve(flattenConnection(json.data.products) as Product[]);
  });

  return { products };
}

export function headers(_: Route.HeadersArgs) {
  return { "cache-control": "max-age=300, s-maxage=3600" };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="animate-pulse" key={`skeleton-${i}`}>
              <div className="bg-gray-200 aspect-[273/370.359]" />

              <div className="h-4 bg-gray-200 mt-2" />
            </div>
          ))}
        </div>
      }
    >
      <ProductsGrid p={products} />
    </Suspense>
  );
}

function ProductsGrid({ p }: { p: Promise<Product[]> }) {
  const products = React.use(p);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
      {products.map((product, index) => {
        const prefetchImage = () => {
          const image = new Image();
          image.src = product.images.edges[0].node.url;
        };

        return (
          <div key={product.id}>
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              onMouseEnter={prefetchImage}
              onFocus={prefetchImage}
            >
              <ShopifyImage
                src={product.images.edges[0].node.url}
                alt={product.images.edges[0].node.altText || product.title}
                loading={index < 4 ? "eager" : "lazy"}
                className="bg-gray-200 aspect-[273/370.359]"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33.333vw, (min-width: 640px) 50vw, 100vw"
              />
              <p>{product.title}</p>
              <Money data={product.priceRange.minVariantPrice} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

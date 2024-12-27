import type { Route } from "./+types/_index";

import React, { Suspense } from "react";
import { Await, Link } from "react-router";
import { flattenConnection, Image, Money } from "@shopify/hydrogen-react";
import type { Product } from "@shopify/hydrogen-react/storefront-api-types";

import { shopifyClient } from "~/libs/shopify";

export function meta({}) {
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

export default function Page({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
          <div className="bg-gray-50 aspect-w-1 aspect-h-1">loading...</div>
          <div className="bg-gray-50 aspect-w-1 aspect-h-1">loading...</div>
          <div className="bg-gray-50 aspect-w-1 aspect-h-1">loading...</div>
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
      {products.map((product) => (
        <div key={product.id}>
          <Link to={`/products/${product.handle}`}>
            <Image
              src={product.images.edges[0].node.url}
              alt={product.images.edges[0].node.altText || product.title}
              loading="eager"
              className="bg-gray-50"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33.333vw, (min-width: 640px) 50vw, 100vw"
            />
            <p>{product.title}</p>
            <Money data={product.priceRange.minVariantPrice} />
          </Link>
        </div>
      ))}
    </div>
  );
}

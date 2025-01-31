import type { Route } from "./+types/products.$handle";

import type { Product } from "@shopify/hydrogen-react/storefront-api-types";
import { Image, Money } from "@shopify/hydrogen-react";

import { shopifyClient } from "~/libs/shopify";

export async function loader({ params }: Route.LoaderArgs) {
  const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
    body: JSON.stringify({
      query: /* GraphQL */ `
        query {
          product(handle: "${params.handle}") {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
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
      `,
    }),
    headers: shopifyClient.getPublicTokenHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();
  const product = json.data.product as Product;

  return { product };
}

export function headers(_: Route.HeadersArgs) {
  return { "cache-control": "max-age=300, s-maxage=3600" };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;

  return (
    <div className="p-4 grid md:grid-cols-2 gap-4">
      <div className="flex md:flex-col overflow-x-auto">
        {product.images.edges.map(({ node }, index) => (
          <Image
            key={node.url}
            src={node.url}
            className="aspect-square object-cover bg-gray-50"
            loading={index < 3 ? "eager" : "lazy"}
            sizes="(min-width: 990px) 25vw, (min-width: 768px) 50vw, 100vw"
          />
        ))}
      </div>

      <div className="relative">
        <div className="sticky top-0">
          <h1 className="text-2xl font-bold mb-1">{product.title}</h1>

          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </div>
  );
}

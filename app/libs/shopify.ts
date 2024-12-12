import { createStorefrontClient } from '@shopify/hydrogen-react';

export const shopifyClient = createStorefrontClient({
  storeDomain: process.env.PUBLIC_STORE_DOMAIN,
  publicStorefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
  storefrontApiVersion: '2024-10',
  privateStorefrontToken: process.env.PRIVATE_STOREFRONT_API_TOKEN,
});

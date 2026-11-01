import { SITE_URL } from "@shop/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/profile",
          "/orders/",
          "/subscription-checkout",
          "/subscriptions/checkout",
          "/subscriptions/manage",
          "/invoice",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import { getMenuSlugsForSitemap, SITE_URL } from "@shop/lib/seo";

const STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/menu", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/subscriptions", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/help", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/faqs", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/terms-and-conditions", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/cancellation-refund-policy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/shipping-delivery-policy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/subscription-policy", priority: 0.4, changeFrequency: "yearly" as const },
];

export default async function sitemap() {
  const menuSlugs = await getMenuSlugsForSitemap();
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries = menuSlugs.map((slug) => ({
    url: `${SITE_URL}/menu/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}

import { storeLinks } from "./site";

const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rotidukaan.com"
).replace(/\/$/, "");

/** Same path the mobile app registers for Android App Links. */
export function appMenuDeepLink(slug: string): string {
  return `${siteOrigin}/menu/${encodeURIComponent(slug)}`;
}

export function appSubscriptionDeepLink(packageId: string): string {
  return `${siteOrigin}/subscriptions/${encodeURIComponent(packageId)}`;
}

export function playStoreUrl(): string {
  return storeLinks.playStore;
}

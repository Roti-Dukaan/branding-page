import { siteOrigin } from "./app-open-links";
import { storeLinks } from "./site";

/** HTTPS URLs shared in WhatsApp — same paths as Android App Links / iOS Universal Links. */
export function appMenuDeepLink(slug: string): string {
  return `${siteOrigin}/menu/${encodeURIComponent(slug)}`;
}

export function appSubscriptionDeepLink(packageId: string): string {
  return `${siteOrigin}/subscriptions/${encodeURIComponent(packageId)}`;
}

export function appInviteDeepLink(referralCode: string): string {
  return `${siteOrigin}/invite/${encodeURIComponent(referralCode.trim())}`;
}

export function menuAppPath(slug: string): string {
  return `/menu/${encodeURIComponent(slug)}`;
}

export function subscriptionAppPath(packageId: string): string {
  return `/subscriptions/${encodeURIComponent(packageId)}`;
}

export function playStoreUrl(): string {
  return storeLinks.playStore;
}

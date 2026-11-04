import { storeLinks } from "./site";

const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rotidukaan.com"
).replace(/\/$/, "");

export const ANDROID_APP_PACKAGE = "com.rotidukaan.user";

/** Custom scheme handled by Flutter (`rotidukaan://menu/slug`). */
export function customSchemeUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `rotidukaan:${normalized}`;
}

/** Android intent: opens app when installed, else falls back to HTTPS page. */
export function androidAppIntentUrl(httpsPath: string): string {
  const path = httpsPath.startsWith("/") ? httpsPath : `/${httpsPath}`;
  const httpsUrl = `${siteOrigin}${path}`;
  const fallback = encodeURIComponent(httpsUrl);
  const hostPath = httpsUrl.replace(/^https:\/\//, "");
  return `intent://${hostPath}#Intent;scheme=https;package=${ANDROID_APP_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

export function openInAppHref(path: string, userAgent?: string): string {
  const ua = userAgent?.toLowerCase() ?? "";
  if (ua.includes("android")) {
    return androidAppIntentUrl(path);
  }
  return customSchemeUrl(path);
}

export function playStoreUrl(): string {
  return storeLinks.playStore;
}

export { siteOrigin };

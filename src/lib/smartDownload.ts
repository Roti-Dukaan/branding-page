import { getStoreUrlFromUserAgent, storeDownloadPath } from "@/lib/stores";

/** Href for Download App links: store URL on phones, download section on desktop. */
export function getSmartDownloadHref(userAgent: string): string {
  return getStoreUrlFromUserAgent(userAgent) ?? "/#download";
}

/** Same as getSmartDownloadHref; used before hydration (middleware handles /download). */
export function getSmartDownloadFallbackHref(): string {
  return storeDownloadPath;
}

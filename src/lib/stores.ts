export const storeUrls = {
  appStore:
    process.env.NEXT_PUBLIC_APP_STORE_URL ||
    "https://apps.apple.com/in/app/roti-dukaan/id6805039720",
  playStore:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
    "https://play.google.com/store/apps/details?id=com.rotidukaan.user",
} as const;

export const storeDownloadPath = "/download";

export function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://rotidukaan.com";
  return url.replace(/\/$/, "");
}

/** Absolute URL for QR codes and share links — hits /download for device-based redirect. */
export function getSmartDownloadAbsoluteUrl() {
  return `${getSiteUrl()}${storeDownloadPath}`;
}

export function isIosUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return true;
  // iPadOS 13+ can report as Mac with a Mobile token in the UA string.
  return ua.includes("macintosh") && /mobile|iphone|ipad/.test(userAgent.toLowerCase());
}

export function isAndroidUserAgent(userAgent: string): boolean {
  return /android/.test(userAgent.toLowerCase());
}

/** Pick App Store, Play Store, or null (desktop / unknown → on-page download section). */
export function getStoreUrlFromUserAgent(userAgent: string): string | null {
  if (isIosUserAgent(userAgent)) {
    return storeUrls.appStore;
  }

  if (isAndroidUserAgent(userAgent)) {
    return storeUrls.playStore;
  }

  return null;
}

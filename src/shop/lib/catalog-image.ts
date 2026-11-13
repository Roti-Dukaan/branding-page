const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CDN_HOST =
  /(?:cloudfront\.net|\.s3\.(?:ap-south-1|ap-south-2)\.amazonaws\.com)/i;

/** True when the browser can load the asset directly from CDN (skip Next image optimizer). */
export function isCatalogCdnUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return CDN_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/foods/placeholder.jpg";
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function shouldUnoptimizeImage(src: string): boolean {
  return isCatalogCdnUrl(src);
}

/** Dev/staging API origin (no trailing slash, no `/api/v1` suffix). */
export const DEV_API_ORIGIN = "https://backend-dev.rotidukaan.com";

/** Production API origin. */
export const PROD_API_ORIGIN = "https://api.rotidukaan.com";

function normalizeApiOrigin(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  return raw.trim().replace(/\/api\/v1\/?$/i, "").replace(/\/$/, "");
}

/**
 * Backend origin for server/marketing fetches (`${origin}/api/v1/...`).
 * Defaults to dev backend when running `next dev` without env.
 */
export function getApiOrigin(): string {
  const configured = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") return DEV_API_ORIGIN;
  return PROD_API_ORIGIN;
}

/** Show OTP on login in dev (same rules as next-frontend). */
export function isDevOtpVisible(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_DEV_OTP === "true") return true;
  const api = getApiOrigin().toLowerCase();
  return api.includes("localhost") || api.includes("127.0.0.1") || api.includes("backend-dev");
}

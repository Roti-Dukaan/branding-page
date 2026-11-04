import { headers } from "next/headers";

/**
 * Base URL for server-side API fetches.
 * On Vercel, prefer the incoming request host so `/api/v1` rewrites reach the backend
 * even when NEXT_PUBLIC_API_URL is missing or points at localhost.
 */
export async function getServerApiBaseUrl(): Promise<string> {
  const configured =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";

  if (
    configured &&
    !/localhost|127\.0\.0\.1/i.test(configured)
  ) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL) {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const protocol = headerList.get("x-forwarded-proto") ?? "https";
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  return configured || "http://localhost:3001";
}

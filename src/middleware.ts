import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStoreUrlFromUserAgent } from "@/lib/stores";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const storeUrl = getStoreUrlFromUserAgent(userAgent);

  if (storeUrl) {
    return NextResponse.redirect(storeUrl);
  }

  const home = new URL("/#download", request.url);
  return NextResponse.redirect(home);
}

export const config = {
  matcher: "/download",
};

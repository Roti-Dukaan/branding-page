import { assetLinksJson } from "@/lib/app-link-verification";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(assetLinksJson(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import { appleAppSiteAssociation } from "@/lib/app-link-verification";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(appleAppSiteAssociation(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { SubscriptionsAppBanner } from "@/components/SubscriptionsAppBanner";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: "Subscriptions | Roti Dukaan",
  description:
    "Manage meal subscriptions in the Roti Dukaan mobile app. Download on Google Play or the App Store.",
  alternates: { canonical: `${siteUrl}/subscriptions` },
};

export default function SubscriptionsRoute() {
  return (
    <PageShell>
      <main className="bg-cream pb-16 pt-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-bark/70">
            <Link href="/" className="font-medium transition hover:text-leaf">
              Home
            </Link>
            <span aria-hidden className="text-bark/40">
              /
            </span>
            <span className="font-medium text-bark">Subscriptions</span>
          </nav>
          <SubscriptionsAppBanner />
        </div>
      </main>
    </PageShell>
  );
}

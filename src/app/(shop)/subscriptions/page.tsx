import type { Metadata } from "next";
import Link from "next/link";
import { SubscriptionsAppBanner } from "@/components/SubscriptionsAppBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: "Subscriptions | Roti Dukaan",
  description:
    "Meal subscriptions are available in the Roti Dukaan mobile app. Download to subscribe and manage your plan.",
  alternates: { canonical: `${siteUrl}/subscriptions` },
};

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <SubscriptionsAppBanner />
      <p className="mt-8 text-center font-display text-sm text-bark/70">
        Prefer one-time orders?{" "}
        <Link href="/menu" className="font-semibold text-leaf underline-offset-2 hover:underline">
          Browse the menu
        </Link>
      </p>
    </div>
  );
}

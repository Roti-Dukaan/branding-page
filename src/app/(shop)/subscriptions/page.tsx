import type { Metadata } from "next";
import Link from "next/link";
import { SubscriptionsBrowsePage } from "@/components/SubscriptionsBrowsePage";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: "Subscription Plans | Roti Dukaan",
  description:
    "Subscribe to Roti Dukaan meal plans on the website. Fresh rotis and wholesome meals delivered in Hyderabad. Manage your plan in the mobile app.",
  alternates: { canonical: `${siteUrl}/subscriptions` },
};

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <SubscriptionsBrowsePage />
      <p className="mt-10 text-center font-display text-sm text-bark/70">
        Prefer one-time orders?{" "}
        <Link href="/menu" className="font-semibold text-leaf underline-offset-2 hover:underline">
          Browse the menu
        </Link>
      </p>
    </div>
  );
}

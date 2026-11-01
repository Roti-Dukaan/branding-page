"use client";

import Link from "next/link";
import { DownloadAppPrompt } from "@shop/features/subscriptions/components/DownloadAppPrompt";

/** Legacy manage URL — management is app-only; show download CTA. */
export default function ManageSubscriptionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:py-14">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage subscription</h1>
        <p className="text-sm text-muted-foreground">
          Subscription management is available in the Roti Dukaan mobile app.
        </p>
      </div>
      <DownloadAppPrompt />
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/profile?tab=subscriptions"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View my subscriptions
        </Link>
        <Link
          href="/subscriptions"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse plans
        </Link>
      </div>
    </div>
  );
}

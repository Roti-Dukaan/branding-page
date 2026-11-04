"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@shop/components/ui/button";
import { DownloadAppPrompt } from "@shop/features/subscriptions/components/DownloadAppPrompt";
import { cn } from "@shop/lib/utils";

/**
 * Plan changes (pause/skip/cancel/change) are managed in the mobile app only.
 * New subscriptions still use /subscriptions/checkout.
 */
export default function ChangePlanCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:py-16">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">Change plan in the app</h1>
          <p className="text-sm text-muted-foreground">
            Changing, pausing, or updating an existing subscription is only available in the Roti
            Dukaan mobile app.
          </p>
        </div>
        <DownloadAppPrompt
          title="Download the app to change your plan"
          description="Open the Roti Dukaan app to change plans, update slots, pause, or skip meals."
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/profile?tab=subscriptions" className={cn(buttonVariants({ variant: "outline" }))}>
            View my subscriptions
          </Link>
          <Link href="/subscriptions" className={cn(buttonVariants())}>
            Take a new subscription
          </Link>
        </div>
      </div>
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandingSubscriptionPlansGrid } from "@/components/BrandingSubscriptionPlansGrid";
import { BrandingManageInAppSection } from "@/components/BrandingManageInAppSection";
import { BrandingFaqSection } from "@/components/BrandingFaqSection";
import { SUBSCRIPTION_FAQS } from "@/lib/faqs-content";

export function SubscriptionsBrowsePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-leaf/60" />
          </div>
        }
      >
        <BrandingSubscriptionPlansGrid />
      </Suspense>

      <div className="mt-14 space-y-10">
        <BrandingManageInAppSection />
        <BrandingFaqSection items={SUBSCRIPTION_FAQS} />
        <p className="text-center font-display text-sm text-bark/70">
          <Link
            href="/profile?tab=subscriptions"
            className="font-semibold text-leaf underline-offset-4 hover:underline"
          >
            View my subscriptions
          </Link>
        </p>
      </div>
    </>
  );
}

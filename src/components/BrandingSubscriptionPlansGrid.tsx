"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { BrandingSubscriptionPlanCard } from "@/components/BrandingSubscriptionPlanCard";
import { useSubscriptionPackages } from "@shop/features/subscriptions/hooks/useSubscriptions";

export function BrandingSubscriptionPlansGrid() {
  const { data: packages, isLoading, isError, refetch } = useSubscriptionPackages();
  const router = useRouter();
  const searchParams = useSearchParams();
  const changeFrom = searchParams.get("changeFrom");

  useEffect(() => {
    if (changeFrom) {
      router.replace("/subscriptions/change-plan");
    }
  }, [changeFrom, router]);

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-2xl">
        <SectionTitle
          eyebrow="Fresh meals, on autopilot"
          title="Choose a subscription plan"
        />
        <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-bark/75 sm:text-base">
          Healthy, homemade meals delivered to your doorstep. Pick a plan, choose your meals and
          duration, and subscribe in a few steps.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-leaf/60" />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-sand/70 bg-white/90 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold text-bark">Could not load plans</p>
          <p className="mt-2 text-sm text-bark/70">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex rounded-full border border-sand bg-cream px-5 py-2.5 font-display text-sm font-semibold text-leaf transition hover:border-leaf/40"
          >
            Retry
          </button>
        </div>
      ) : !packages?.length ? (
        <div className="rounded-3xl border border-sand/70 bg-white/90 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold text-bark">No plans available</p>
          <p className="mt-2 text-sm text-bark/70">Check back soon.</p>
        </div>
      ) : (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <BrandingSubscriptionPlanCard
              key={pkg.id}
              package={pkg}
              href={`/subscriptions/${pkg.id}/view`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

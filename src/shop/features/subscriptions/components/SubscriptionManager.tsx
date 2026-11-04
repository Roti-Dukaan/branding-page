"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { useSubscriptionPackages } from "../hooks/useSubscriptions";
import { DownloadAppPrompt } from "./DownloadAppPrompt";

/**
 * mode:
 *  - "full"  → download-app prompt (profile uses ProfileSubscriptions for list + CTA).
 *  - "public"→ plan packages (browse + subscribe) on /subscriptions.
 */
export function SubscriptionManager({ mode = "full" }: { mode?: "full" | "public" }) {
  if (mode === "public") {
    return (
      <div className="space-y-6">
        <PlansTab />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DownloadAppPrompt />
      <div className="text-center">
        <Button variant="outline" onClick={() => window.location.assign("/subscriptions")}>
          <Crown className="size-4" />
          Browse plans
        </Button>
      </div>
    </div>
  );
}

function PlansTab() {
  const { data: packages, isLoading, isError, refetch } = useSubscriptionPackages();
  const router = useRouter();
  const searchParams = useSearchParams();
  const changeFrom = searchParams.get("changeFrom");

  useEffect(() => {
    if (changeFrom) {
      router.replace("/subscriptions/change-plan");
    }
  }, [changeFrom, router]);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Crown className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">Could not load plans</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Crown className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No plans available</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Check back soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Crown className="size-3.5" />
          Fresh meals, on autopilot
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Choose a subscription plan
        </h2>
        <p className="max-w-lg text-sm text-muted-foreground">
          Healthy, homemade meals delivered to your doorstep. Pick a plan, choose your meals and
          duration, and subscribe in a few steps.
        </p>
      </div>

      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <SubscriptionPlanCard
            key={pkg.id}
            package={pkg}
            onTap={() => router.push(`/subscriptions/${pkg.id}/view`)}
          />
        ))}
      </div>
    </div>
  );
}

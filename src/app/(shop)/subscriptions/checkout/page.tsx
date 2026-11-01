"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@shop/components/ui/button";
import { SubscriptionCheckoutWizard } from "@shop/features/subscriptions/components/SubscriptionCheckoutWizard";
import { subscriptionsApi } from "@shop/features/subscriptions/services/subscriptions.api";
import { cn } from "@shop/lib/utils";
import { useSearchParams } from "next/navigation";
import { packageAsPlan, readCheckoutDraft } from "@shop/features/subscriptions/utils/package-display";
import type { SubscriptionCheckoutDraft, SubscriptionPackage } from "@shop/features/subscriptions/types/package";

export default function SubscriptionCheckoutFlowPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <CheckoutFlow />
    </Suspense>
  );
}

function CheckoutFlow() {
  const params = useSearchParams();
  const planId = params.get("planId");
  const [pkg, setPkg] = useState<SubscriptionPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<SubscriptionCheckoutDraft | null>(null);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    setDraft(readCheckoutDraft(planId));
    setLoading(true);
    subscriptionsApi
      .getPackageById(planId)
      .then((detail) => setPkg(detail))
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [planId]);

  const plan = useMemo(() => (pkg ? packageAsPlan(pkg) : null), [pkg]);

  if (!planId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Select a package to continue checkout.</p>
        <Link href="/subscriptions" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          View packages
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Package not found.</p>
        <Link href="/subscriptions" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          Back to packages
        </Link>
      </div>
    );
  }

  return <SubscriptionCheckoutWizard plan={plan} checkoutDraft={draft} />;
}

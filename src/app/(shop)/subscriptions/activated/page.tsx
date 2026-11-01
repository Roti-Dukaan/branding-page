"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { buttonVariants } from "@shop/components/ui/button";
import { DownloadAppPrompt } from "@shop/features/subscriptions/components/DownloadAppPrompt";
import { cn } from "@shop/lib/utils";

export default function SubscriptionActivatedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ActivatedContent />
    </Suspense>
  );
}

function ActivatedContent() {
  const params = useSearchParams();
  const planName = params.get("plan")?.trim();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Subscription activated
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {planName
            ? `Your ${planName} plan is live. Fresh meals are on the way.`
            : "Your subscription is live. Fresh meals are on the way."}
        </p>
      </div>

      <DownloadAppPrompt
        title="Download the app to manage your subscription"
        description="Pause, skip a day, change your plan or menu, and update delivery details — all from the Roti Dukaan mobile app."
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/profile?tab=subscriptions" className={cn(buttonVariants({ variant: "outline" }))}>
          View on website
        </Link>
        <Link href="/" className={cn(buttonVariants())}>
          Go home
        </Link>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Taking a new subscription stays on the website; day-to-day management is in the app.
      </p>
    </div>
  );
}

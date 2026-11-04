"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Crown, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@shop/components/ui/button";
import { cn } from "@shop/lib/utils";
import { Card, CardContent } from "@shop/components/ui/card";
import { formatDisplayDate } from "@shop/lib/date";
import { useMySubscriptions } from "@shop/features/subscriptions/hooks/useSubscriptions";
import { SubscriptionStatusBadge } from "@shop/features/subscriptions/components/StatusBadge";
import { DownloadAppPrompt } from "@shop/features/subscriptions/components/DownloadAppPrompt";
import {
  PLAN_TYPE_LABELS,
  type CustomerSubscription,
} from "@shop/features/subscriptions/types/subscription";
import { formatSubscriptionSlotLabel } from "@shop/features/subscriptions/utils/subscription-display";

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return formatDisplayDate(value);
}

/**
 * Profile “My Subscriptions”: read-only status on web.
 * Pause / skip / change plan / daily menu live in the mobile app only.
 */
export function ProfileSubscriptions() {
  const router = useRouter();
  const { data: subs, isLoading } = useMySubscriptions();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
          My Subscriptions
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {subs && subs.length > 0
            ? "View status here. Pause, skip, and plan changes are in the mobile app."
            : "Subscribe on the website, then manage meals in the app."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading subscriptions…
        </div>
      ) : !subs || subs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">No subscriptions yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Browse our subscription plans and pick one that suits you.
            </p>
            <Button onClick={() => router.push("/subscriptions")}>
              <Crown className="size-4" />
              View plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subs.map((sub) => (
            <SubscriptionSummaryCard key={sub.id} sub={sub} />
          ))}
        </div>
      )}

      {subs && subs.length > 0 ? <DownloadAppPrompt /> : null}

      {subs && subs.length > 0 ? (
        <div className="text-center">
          <Link href="/subscriptions" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse subscription plans
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionSummaryCard({ sub }: { sub: CustomerSubscription }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {sub.plan?.name ?? "Subscription"}
          </h3>
          <SubscriptionStatusBadge status={sub.status} />
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
          {sub.subscriptionNumber ? (
            <>
              <span className="font-mono">{sub.subscriptionNumber}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>{sub.plan ? PLAN_TYPE_LABELS[sub.plan.type] : ""}</span>
          <span aria-hidden="true">·</span>
          <span>Start {fmtDate(sub.startDate)}</span>
          <span aria-hidden="true">·</span>
          <span>End {fmtDate(sub.endDate)}</span>
          <span aria-hidden="true">·</span>
          <span>Slot {formatSubscriptionSlotLabel(sub.deliverySlot)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

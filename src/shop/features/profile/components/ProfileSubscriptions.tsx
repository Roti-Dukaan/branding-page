"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Crown, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@shop/components/ui/button";
import { cn } from "@shop/lib/utils";
import { Card, CardContent } from "@shop/components/ui/card";
import { formatDisplayDate } from "@shop/lib/date";
import {
  useCancelPendingSubscription,
  useMySubscriptions,
} from "@shop/features/subscriptions/hooks/useSubscriptions";
import { toast } from "@shop/lib/toast";
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
        <h2 className="font-display text-lg font-bold text-bark sm:text-xl">
          My Subscriptions
        </h2>
        <p className="text-xs text-bark/65 sm:text-sm">
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
          <Link
            href="/subscriptions"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full border-sand/80 font-display font-semibold text-bark hover:border-leaf/40 hover:bg-white/80 hover:text-leaf",
            )}
          >
            Browse subscription plans
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionSummaryCard({ sub }: { sub: CustomerSubscription }) {
  const paymentPending = sub.status === "PENDING";
  const completePaymentHref = `/subscription-checkout?subscriptionId=${encodeURIComponent(sub.id)}`;
  const cancelPending = useCancelPendingSubscription();

  const handleCancelPending = () => {
    const ok = window.confirm(
      "Cancel this pending checkout? You can start a new subscription anytime.",
    );
    if (!ok) return;
    cancelPending.mutate(
      { id: sub.id, reason: "Cancelled from profile" },
      {
        onSuccess: () => toast.success("Pending subscription cancelled"),
        onError: () => toast.error("Could not cancel. Please try again."),
      },
    );
  };

  return (
    <Card className="rounded-2xl border-sand/80 bg-white/90 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold text-bark sm:text-lg">
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
            {paymentPending ? (
              <p className="text-xs text-amber-900/85 sm:text-sm">
                Checkout started but payment was not completed. Finish payment to activate this
                subscription.
              </p>
            ) : null}
          </div>
          {paymentPending ? (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[11rem]">
              <Button asChild size="sm" className="w-full">
                <Link href={completePaymentHref}>Complete payment</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-full border-sand/80 font-display font-semibold text-bark hover:border-leaf/40 hover:bg-white/80 hover:text-leaf"
                disabled={cancelPending.isPending}
                onClick={handleCancelPending}
              >
                {cancelPending.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

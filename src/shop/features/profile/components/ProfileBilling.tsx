"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Crown, Loader2, Receipt } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { Badge } from "@shop/components/ui/badge";
import { formatDisplayDate, formatTimestamp } from "@shop/lib/date";
import { formatPrice } from "@shop/lib/utils";
import { toast } from "@shop/lib/toast";
import { paymentService, type PaymentHistoryItem } from "@shop/services/payment.service";
import { useMySubscriptions } from "@shop/features/subscriptions/hooks/useSubscriptions";
import { SubscriptionStatusBadge } from "@shop/features/subscriptions/components/StatusBadge";
import { PLAN_TYPE_LABELS, type CustomerSubscription } from "@shop/features/subscriptions/types/subscription";
import { OrderInvoiceActions } from "@shop/features/invoice/components/OrderInvoiceActions";
import { PaymentInvoiceActions } from "@shop/features/invoice/components/PaymentInvoiceActions";
import { useProfileNavigation } from "../hooks/useProfileNavigation";

function pickCurrentSubscription(subs: CustomerSubscription[]) {
  return subs.find((s) => s.status === "ACTIVE")
    ?? subs.find((s) => s.status === "PAUSED")
    ?? null;
}

function paymentTitle(payment: PaymentHistoryItem) {
  if (payment.orderNumber) return `Order ${payment.orderNumber}`;
  if (payment.subscriptionNumber) return `Subscription ${payment.subscriptionNumber}`;
  if (!payment.items?.length) return "Subscription payment";
  return payment.paymentReference;
}

function isSubscriptionPayment(payment: PaymentHistoryItem) {
  return Boolean(
    payment.subscriptionId
    || payment.checkoutReference?.startsWith("CHK-SUB")
    || (!payment.orderId && !payment.orderNumber),
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    CAPTURED: { label: "Paid", className: "bg-green-50 text-green-700" },
    AUTHORIZED: { label: "Authorized", className: "bg-blue-50 text-blue-700" },
    CREATED: { label: "Pending", className: "bg-cream-deep text-amber-700" },
    PAYMENT_PENDING: { label: "Pending", className: "bg-cream-deep text-amber-700" },
    FAILED: { label: "Failed", className: "bg-red-50 text-red-700" },
    REFUNDED: { label: "Refunded", className: "bg-violet-50 text-violet-700" },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  };
  const c = config[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return <Badge className={`${c.className} border-0`}>{c.label}</Badge>;
}

export function ProfileBilling() {
  const router = useRouter();
  const { navigateToTab } = useProfileNavigation();
  const { data: subs, isLoading: subsLoading } = useMySubscriptions();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const currentSub = useMemo(
    () => pickCurrentSubscription(subs ?? []),
    [subs],
  );

  const invoicePayments = useMemo(
    () => payments.filter((p) => ["CAPTURED", "AUTHORIZED"].includes(p.status)),
    [payments],
  );

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await paymentService.getHistory(1, 30);
        setPayments(data.items);
      } catch {
        toast.error("Failed to load billing history");
      } finally {
        setPaymentsLoading(false);
      }
    };
    void loadPayments();
  }, []);

  const loading = subsLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
          Billing
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Your active subscription and payment invoices
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Current subscription
        </h3>

        {currentSub ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Crown className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {currentSub.plan?.name ?? "Subscription plan"}
                      </p>
                      {currentSub.subscriptionNumber ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {currentSub.subscriptionNumber}
                        </p>
                      ) : null}
                    </div>
                    <SubscriptionStatusBadge status={currentSub.status} />
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {currentSub.plan ? (
                      <span>{PLAN_TYPE_LABELS[currentSub.plan.type]}</span>
                    ) : null}
                    {currentSub.pricePaid != null && Number(currentSub.pricePaid) > 0 ? (
                      <span>Paid {formatPrice(Number(currentSub.pricePaid))}</span>
                    ) : null}
                    {currentSub.startDate ? (
                      <span>Started {formatDisplayDate(currentSub.startDate)}</span>
                    ) : null}
                    {currentSub.endDate ? (
                      <span>Ends {formatDisplayDate(currentSub.endDate)}</span>
                    ) : null}
                    <span>Auto-renew {currentSub.autoRenew ? "on" : "off"}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => navigateToTab("subscriptions")}
                >
                  View subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <Crown className="size-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No active subscription</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Subscribe to a meal plan to see your billing details here.
              </p>
              <Button onClick={() => router.push("/subscriptions")}>
                Browse plans
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Invoices & payments
          </h3>
        </div>

        {invoicePayments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <CreditCard className="size-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No invoices yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Payment receipts and downloadable invoices will appear here after you subscribe or place an order.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invoicePayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {paymentTitle(payment)}
                        </p>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(payment.paidAt ?? payment.createdAt)}
                      </p>
                      {payment.checkoutReference ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          Ref: {payment.checkoutReference}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <p className="text-base font-bold text-foreground">
                        {formatPrice(payment.amount)}
                      </p>
                      {payment.orderId ? (
                        <OrderInvoiceActions orderId={payment.orderId} compact />
                      ) : isSubscriptionPayment(payment) ? (
                        <PaymentInvoiceActions paymentId={payment.id} compact />
                      ) : (
                        <p className="text-xs text-muted-foreground capitalize">
                          {payment.paymentMethod?.toLowerCase() ?? "Online"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

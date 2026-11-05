"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Crown,
  CalendarDays,
} from "lucide-react";
import { toast } from "@shop/lib/toast";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { formatPrice } from "@shop/lib/utils";
import { subscriptionsApi } from "@shop/features/subscriptions/services/subscriptions.api";
import {
  initiateAndOpenSubscriptionPayment,
  loadRazorpayScript,
} from "@shop/features/subscriptions/utils/subscription-razorpay";
import type { CustomerSubscription, SubscriptionCheckoutSession } from "@shop/features/subscriptions/types/subscription";
import { formatDisplayDate } from "@shop/lib/date";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useAuthStore } from "@shop/lib/stores/auth-store";

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return formatDisplayDate(value);
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscriptionCheckoutInner />
    </Suspense>
  );
}

function SubscriptionCheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const subscriptionId = params.get("subscriptionId");
  const checkoutSessionId = params.get("checkoutSessionId");

  const { isAuthenticated, openAuthForCheckout, user } = useAuthStore();
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    fetchAddresses,
  } = useAddressStore();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SubscriptionCheckoutSession | null>(null);
  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const pendingToastShown = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthForCheckout(null);
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, fetchAddresses, openAuthForCheckout]);

  useEffect(() => {
    void loadRazorpayScript().catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    if (!subscriptionId) {
      toast.error("Missing subscription reference");
      router.push(`/subscriptions/activated?plan=${encodeURIComponent(subscription?.plan?.name ?? "Subscription")}`);
      return;
    }
    try {
      setLoading(true);
      const [sub, checkout] = await Promise.all([
        subscriptionsApi.getById(subscriptionId).catch(() => null),
        subscriptionsApi.getCheckout(subscriptionId).catch(() => null),
      ]);
      setSubscription(sub);
      setSession(checkout);
      if (!checkout) {
        toast.error("Subscription checkout not found or expired");
      } else if (sub?.status === "PENDING" && !pendingToastShown.current) {
        pendingToastShown.current = true;
        toast.info("You have a pending payment — continuing checkout");
      }
    } catch {
      toast.error("Could not load subscription checkout");
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, router]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const snapshot: Record<string, unknown> = session?.pricingSnapshot ?? {};
  const snapshotItems: Array<Record<string, unknown>> = Array.isArray(snapshot.items)
    ? (snapshot.items as Array<Record<string, unknown>>)
    : [];
  const grandTotal = Number(session?.grandTotal ?? 0);
  const planLine = snapshot.planLine as { name?: string; amount?: number } | undefined;
  const planPrice = Number(planLine?.amount ?? snapshot.planPrice ?? grandTotal);
  const planDisplayName =
    planLine?.name ?? (snapshot.planName as string | undefined) ?? subscription?.plan?.name ?? "Subscription plan";
  const isPlanPriced = planPrice > 0 && snapshotItems.every((it) => Number(it.lineTotal ?? 0) === 0);
  const selectedSavedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const preferred = addresses.find((a) => a.isDefault) || addresses[0];
      selectAddress(preferred.id);
    }
  }, [addresses, selectedAddressId, selectAddress]);

  const handlePayment = async () => {
    if (!session || !subscriptionId) return;
    if (!selectedSavedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedSavedAddress.id !== subscription?.addressId) {
        await subscriptionsApi.changeAddress(subscriptionId, selectedSavedAddress.id);
      }

      const activeSessionId = checkoutSessionId ?? session.id;

      await initiateAndOpenSubscriptionPayment(
        {
          subscriptionId,
          checkoutSessionId: activeSessionId,
          planName: subscription?.plan?.name ?? "Meal Plan",
          prefill: {
            name: selectedSavedAddress.name ?? user?.name ?? "",
            contact: selectedSavedAddress.phone,
          },
          expectedAmount: grandTotal,
        },
        {
          onSuccess: () => {
            setIsComplete(true);
            toast.success("Payment successful — subscription activated!");
          },
          onDismiss: () => {
            setIsProcessing(false);
            toast.message("Payment cancelled — you can try again");
          },
          onVerifyError: () => {
            toast.error("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          },
        },
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? "Payment failed. Please try again.";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle2 className="size-12 text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground">Subscription Active!</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your first delivery is confirmed and the kitchen has been notified.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={`/subscriptions/activated?plan=${encodeURIComponent(subscription?.plan?.name ?? "Subscription")}`}>
              <Button className="min-h-[48px] bg-primary px-8 hover:bg-primary/90">
                Continue
              </Button>
            </Link>
            <Link href="/profile?tab=subscriptions">
              <Button variant="outline" className="min-h-[48px] px-8">
                View subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Checkout unavailable</h1>
          <p className="mt-2 text-muted-foreground">
            This subscription checkout could not be found or has expired.
          </p>
          <Link href="/profile?tab=subscriptions" className="mt-6 inline-block">
            <Button className="bg-primary hover:bg-primary/90">Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile?tab=subscriptions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Subscriptions
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Complete Your <span className="italic text-primary">Subscription</span>
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {/* Plan summary */}
            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Crown className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {subscription?.plan?.name ?? "Subscription Plan"}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      First delivery: {fmtDate(snapshot?.frozenAt as string | undefined)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <MapPin className="size-4 text-primary" /> Delivery Address
                </h3>
                {addresses.length > 0 ? (
                  <RadioGroup
                    value={selectedSavedAddress?.id ?? ""}
                    onValueChange={selectAddress}
                    className="space-y-3"
                  >
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                          selectedSavedAddress?.id === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value={addr.id} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold capitalize">{addr.addressType}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.name} | {addr.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.house}
                            {addr.street ? `, ${addr.street}` : ""}
                            {addr.area ? `, ${addr.area}` : ""}
                            {addr.landmark ? `, Near ${addr.landmark}` : ""}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>
                        </div>
                        {selectedSavedAddress?.id === addr.id && (
                          <CheckCircle2 className="size-5 text-primary" />
                        )}
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No saved addresses.{" "}
                    <Link href="/profile?tab=addresses" className="text-primary underline">
                      Add an address
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 border-b border-border pb-4 text-lg font-bold text-foreground">
                  Order Summary
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {isPlanPriced && (
                    <div className="flex justify-between text-sm">
                      <span>{planDisplayName}</span>
                      <span className="font-medium">{formatPrice(planPrice)}</span>
                    </div>
                  )}
                  {snapshotItems.length > 0 && (
                    <div className="space-y-1 border-t border-border/60 pt-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Included each delivery
                      </p>
                      {snapshotItems.map((it, i) => (
                        <div key={i} className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {String(it.name)} × {String(it.quantity)}
                          </span>
                          <span>{isPlanPriced ? "Included" : formatPrice(Number(it.lineTotal))}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isPlanPriced &&
                    snapshotItems.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>
                          {String(it.name)} × {String(it.quantity)}
                        </span>
                        <span className="font-medium">{formatPrice(Number(it.lineTotal))}</span>
                      </div>
                    ))}
                  {snapshotItems.length === 0 && !isPlanPriced && (
                    <p className="text-sm text-muted-foreground">No items</p>
                  )}
                </div>
                <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  <Row
                    label="Subtotal"
                    value={formatPrice(Number(snapshot.subtotalAmount ?? (isPlanPriced ? planPrice : 0)))}
                  />
                  <Row label="Delivery" value={formatPrice(Number(snapshot.deliveryCharge ?? 0))} />
                  {Number(snapshot.discountAmount ?? 0) > 0 && (
                    <Row label="Discount" value={formatPrice(-Number(snapshot.discountAmount))} />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(grandTotal)}</span>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="mt-6 min-h-[48px] w-full bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>Pay {formatPrice(grandTotal)}</>
                  )}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  Full plan amount is charged now; recurring billing follows your plan schedule
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

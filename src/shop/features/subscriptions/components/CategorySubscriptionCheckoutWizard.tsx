"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@shop/lib/toast";
import { Button } from "@shop/components/ui/button";
import { Label } from "@shop/components/ui/label";
import { subscriptionsApi } from "../services/subscriptions.api";
import {
  initiateAndOpenSubscriptionPayment,
} from "../utils/subscription-razorpay";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { apiClient } from "@shop/lib/api/client";
import { formatPrice } from "@shop/lib/utils";
import { tomorrowDateKey } from "@shop/lib/date";
import { DeliverySlotPicker } from "@shop/components/delivery/DeliverySlotPicker";
import type { SubscriptionPlan } from "../types/subscription";

type PackageCategory = {
  id: string;
  category: string;
  categoryPrice: number;
  active: boolean;
};

type PackageDetail = {
  id: string;
  name: string;
  billingCycle: string;
  priceLabel?: string;
  allowCustomerCategorySelection?: boolean;
  categories: PackageCategory[];
};

const CATEGORY_LABELS: Record<string, string> = {
  ROTI: "Rotis",
  CURRY: "Curries",
  ADDON: "Add-ons",
};

export function CategorySubscriptionCheckoutWizard({ plan }: { plan: SubscriptionPlan }) {
  const router = useRouter();
  const { isAuthenticated, openAuthForCheckout, user } = useAuthStore();
  const { addresses, selectedAddressId, fetchAddresses } = useAddressStore();
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [allowCustomerCategorySelection, setAllowCustomerCategorySelection] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [slots, setSlots] = useState<Array<{ id: string; name: string; startTime: string; endTime: string }>>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(tomorrowDateKey());
  const [quote, setQuote] = useState<{ finalPrice: number; originalPrice: number; priceLabel: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const addressId =
    selectedAddressId
    ?? addresses.find((a) => a.isDefault)?.id
    ?? addresses[0]?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthForCheckout();
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, fetchAddresses, openAuthForCheckout]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiClient.get(`/subscription-packages/${plan.id}`),
      apiClient.get("/delivery-slots/available"),
    ])
      .then(([pkgRes, slotsRes]) => {
        if (cancelled) return;
        const detail = (pkgRes.data?.data ?? pkgRes.data) as PackageDetail;
        setPkg(detail);
        const active = (detail.categories ?? []).filter((c) => c.active);
        setAllowCustomerCategorySelection(detail.allowCustomerCategorySelection === true);
        setSelectedCategoryIds(active.map((c) => c.id));
        const list = (slotsRes.data?.data ?? []) as typeof slots;
        setSlots(list);
        if (list.length === 0) {
          setSlotsError("No delivery slots are available right now.");
        } else {
          setSelectedSlotId(list[0].id);
        }
      })
      .catch(() => toast.error("Could not load package details"))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setSlotsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [plan.id]);

  useEffect(() => {
    if (!selectedCategoryIds.length) {
      setQuote(null);
      return;
    }
    subscriptionsApi
      .quotePrice(plan.id, selectedCategoryIds)
      .then((q) => setQuote(q))
      .catch(() => setQuote(null));
  }, [plan.id, selectedCategoryIds]);

  const toggleCategory = (id: string) => {
    if (!allowCustomerCategorySelection) return;
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const cycleLabel = useMemo(
    () => (pkg?.billingCycle === "WEEKLY" ? "/week" : "/month"),
    [pkg?.billingCycle],
  );

  const onConfirm = async () => {
    if (!addressId) {
      toast.error("Select a delivery address");
      return;
    }
    if (!selectedCategoryIds.length) {
      toast.error("Select at least one category");
      return;
    }
    if (!selectedSlotId) {
      toast.error("Select a delivery slot");
      return;
    }

    setSubmitting(true);
    try {
      const selectedAddress = addresses.find((a) => a.id === addressId);
      const result = await subscriptionsApi.createWithCategories({
        packageId: plan.id,
        addressId,
        deliverySlotId: selectedSlotId,
        packageCategoryIds: selectedCategoryIds,
        startDate,
        autoRenew: true,
      });

      await initiateAndOpenSubscriptionPayment(
        {
          subscriptionId: result.subscription.id,
          checkoutSessionId: result.checkoutSessionId,
          planName: plan.name,
          prefill: {
            name: selectedAddress?.name ?? user?.name ?? "",
            contact: selectedAddress?.phone ?? "",
          },
          expectedAmount: quote?.finalPrice,
        },
        {
          onSuccess: () => {
            toast.success("Subscription activated");
            router.push(`/subscriptions/activated?plan=${encodeURIComponent(plan.name)}`);
          },
          onDismiss: () => {
            setSubmitting(false);
            toast.message("Payment cancelled — you can try again");
          },
          onVerifyError: () => {
            toast.error("Payment verification failed. Please contact support.");
            setSubmitting(false);
          },
        },
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not start subscription";
      toast.error(String(message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !pkg) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">{pkg.name}</h1>
        <p className="text-sm text-muted-foreground">
          {allowCustomerCategorySelection
            ? "Select categories for the full cycle. Daily menu items are chosen later from your dashboard."
            : "This package includes all categories below. Daily menu items are chosen later from your dashboard."}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Categories
        </h2>
        {(pkg.categories ?? []).filter((c) => c.active).map((cat) => (
          <label
            key={cat.id}
            className={`flex items-center justify-between rounded-2xl border border-border px-4 py-3 ${
              allowCustomerCategorySelection ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat.id)}
                disabled={!allowCustomerCategorySelection}
                onChange={() => toggleCategory(cat.id)}
              />
              {CATEGORY_LABELS[cat.category] ?? cat.category}
            </span>
            {allowCustomerCategorySelection && (
              <span className="text-sm font-semibold">
                {formatPrice(cat.categoryPrice)}
                {cycleLabel}
              </span>
            )}
          </label>
        ))}
        {quote && (
          <p className="text-right text-base font-bold">
            {allowCustomerCategorySelection ? "Final subscription price" : "Package total"}:{" "}
            {formatPrice(quote.finalPrice)}
            {cycleLabel}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Delivery slot
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a time window from your branch delivery slots.
        </p>
        {slotsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading slots…
          </div>
        ) : slotsError ? (
          <p className="text-sm text-destructive">{slotsError}</p>
        ) : (
          <DeliverySlotPicker
            slots={slots}
            selectedSlotId={selectedSlotId}
            onSelect={(slot) => setSelectedSlotId(slot.id)}
          />
        )}
      </section>

      <section className="space-y-2">
        <Label htmlFor="startDate">Start date</Label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          min={tomorrowDateKey()}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        />
      </section>

      {!addressId && (
        <p className="text-sm text-destructive">Add a delivery address in your profile before checkout.</p>
      )}

      <Button className="w-full" disabled={submitting || !addressId || !selectedSlotId} onClick={onConfirm}>
        {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Confirm & pay {quote ? formatPrice(quote.finalPrice) : ""}
      </Button>
    </div>
  );
}

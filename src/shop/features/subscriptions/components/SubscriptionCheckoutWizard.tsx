"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Briefcase,
  MapPinned,
} from "lucide-react";
import { toast } from "@shop/lib/toast";
import { Button, buttonVariants } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { Badge } from "@shop/components/ui/badge";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import AddressModal from "@shop/components/AddressModal";
import { subscriptionsApi } from "@shop/features/subscriptions/services/subscriptions.api";
import { PlanDescription } from "./PlanDescription";
import type { SubscriptionPlan, SubscriptionMenuItem, RotiType, CustomerSubscription, PlanChangeQuote } from "@shop/features/subscriptions/types/subscription";
import {
  getSubscriptionDeliverySlotIds,
  MAX_SUBSCRIPTION_DELIVERY_SLOTS,
} from "@shop/features/subscriptions/utils/subscription-display";
import { tomorrowDateKey, formatDisplayDate } from "@shop/lib/date";
import {
  initiateAndOpenSubscriptionPayment,
  loadRazorpayScript,
} from "@shop/features/subscriptions/utils/subscription-razorpay";
import { ROTI_TYPE_LABELS } from "@shop/features/subscriptions/types/subscription";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useLocationStore } from "@shop/lib/stores/location-store";
import type { AddressType, DeliveryAddress } from "@shop/lib/types";
import { apiClient } from "@shop/lib/api/client";
import { cn, formatPrice } from "@shop/lib/utils";
import { DeliverySlotPicker } from "@shop/components/delivery/DeliverySlotPicker";
import { formatDeliverySlotLabel } from "@shop/lib/delivery-slot-display";
import { locationService } from "@shop/services/location.service";
import type { SubscriptionCheckoutDraft } from "@shop/features/subscriptions/types/package";
import {
  formatIndianPrice,
  formatPlanMealCount,
} from "@shop/features/subscriptions/utils/package-display";

type DeliverySlot = { id: string; name: string; startTime: string; endTime: string };

type SelectedRotiLine = {
  subscriptionMenuItemId: string;
  name: string;
  rotiType: RotiType;
  quantity: number;
};

const STEP_LABELS = ["Choose rotis", "Start date", "Address", "Slot", "Review"] as const;
const CATEGORY_STEP_LABELS = ["Menu", "Start date", "Address", "Slot", "Review"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  ROTI: "Rotis",
  CURRY: "Curries",
  ADDON: "Add-ons",
};

type CheckoutPackageCategory = {
  id: string;
  category: string;
  categoryName?: string;
  categoryPrice: number;
  active: boolean;
  menuItems?: Array<{
    menuItemId: string;
    menuItem?: { id: string; name: string; category?: string };
  }>;
};

const addressTypeConfig: Record<
  AddressType,
  { icon: typeof Home; label: string; color: string }
> = {
  home: { icon: Home, label: "Home", color: "text-primary" },
  work: { icon: Briefcase, label: "Work", color: "text-blue-600" },
  other: { icon: MapPinned, label: "Other", color: "text-purple-600" },
};

function paymentTypeSubtitles(isPlanChange: boolean, quote: PlanChangeQuote | null) {
  const isDowngrade = quote?.changeType === "DOWNGRADE";
  return {
    recurring: isPlanChange
      ? isDowngrade
        ? "Auto-renews each cycle after the downgrade takes effect"
        : "Auto-renews at the end of each cycle after this change"
      : "Auto-renews at the end of each cycle",
    oneTime: isPlanChange
      ? isDowngrade
        ? "No auto-renewal after the next cycle completes"
        : "Pay once now — no auto-renewal after this cycle"
      : "Pay once for this plan — no auto-renewal",
  };
}

function PaymentTypeChoice({
  autoRenew,
  onSelect,
  isPlanChange,
  planChangeQuote,
}: {
  autoRenew: boolean;
  onSelect: (recurring: boolean) => void;
  isPlanChange: boolean;
  planChangeQuote: PlanChangeQuote | null;
}) {
  const subtitles = paymentTypeSubtitles(isPlanChange, planChangeQuote);
  const options = [
    { id: "recurring", recurring: true, title: "Recurring payment", subtitle: subtitles.recurring },
    { id: "one-time", recurring: false, title: "One-time payment", subtitle: subtitles.oneTime },
  ] as const;

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-sm font-medium">Payment type</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const selected = autoRenew === opt.recurring;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.recurring)}
              className={cn(
                "w-full rounded-xl border-2 p-3 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <p className="font-semibold text-foreground">{opt.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PayOnlineMethodNote() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Payment method</p>
      <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
        <p className="font-semibold text-foreground">Pay online</p>
        <p className="text-xs text-muted-foreground">UPI / Card / Netbanking</p>
      </div>
    </div>
  );
}

export type ChangePlanCheckoutContext = {
  subscriptionId: string;
  subscription: CustomerSubscription;
};

interface SubscriptionCheckoutWizardProps {
  plan: SubscriptionPlan;
  changePlan?: ChangePlanCheckoutContext;
  checkoutDraft?: SubscriptionCheckoutDraft | null;
}

export function SubscriptionCheckoutWizard({ plan, changePlan, checkoutDraft }: SubscriptionCheckoutWizardProps) {
  const isPlanChange = !!changePlan;
  const skipPlanBuilder = !isPlanChange && !!checkoutDraft;
  const skipSlotStep = skipPlanBuilder && (checkoutDraft?.deliverySlotIds.length ?? 0) > 0;
  const router = useRouter();
  const { isAuthenticated, openAuthForCheckout, user } = useAuthStore();
  const {
    addresses,
    selectedAddressId,
    fetchAddresses,
    selectAddress,
    updateAddress,
    loading: addressesLoading,
    error: addressesError,
  } = useAddressStore();
  const deliveryAvailable = useLocationStore((s) => s.deliveryAvailable);
  const deliveryMessage = useLocationStore((s) => s.deliveryMessage);

  const [step, setStep] = useState(skipPlanBuilder ? 2 : 1);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [addressServiceable, setAddressServiceable] = useState<boolean | null>(null);
  const addressSyncedRef = useRef<string | null>(null);

  const [catalogItems, setCatalogItems] = useState<SubscriptionMenuItem[]>([]);
  const [selectedLines, setSelectedLines] = useState<SelectedRotiLine[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [categoryMode, setCategoryMode] = useState(false);
  const [allowCustomerCategorySelection, setAllowCustomerCategorySelection] = useState(false);
  const [packageCategories, setPackageCategories] = useState<CheckoutPackageCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [priceQuote, setPriceQuote] = useState<{ finalPrice: number; originalPrice: number } | null>(null);

  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(
    checkoutDraft?.deliverySlotIds ?? [],
  );

  const [startDate, setStartDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(changePlan?.subscription?.autoRenew ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutContext, setCheckoutContext] = useState<{
    subscriptionId: string;
    checkoutSessionId: string;
  } | null>(null);
  const [planChangeQuote, setPlanChangeQuote] = useState<PlanChangeQuote | null>(null);
  const [loadingPlanChangeQuote, setLoadingPlanChangeQuote] = useState(false);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0] ??
    null;

  const addressId = selectedAddress?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthForCheckout();
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, fetchAddresses, openAuthForCheckout]);

  useEffect(() => {
    setStartDate(tomorrowDateKey());
  }, []);

  useEffect(() => {
    if (!changePlan) return;
    const sub = changePlan.subscription;
    if (sub.addressId) {
      selectAddress(sub.addressId);
    }
    setSelectedSlotIds(getSubscriptionDeliverySlotIds(sub));
  }, [changePlan, selectAddress]);

  useEffect(() => {
    let cancelled = false;
    setMenuLoading(true);
    apiClient
      .get(`/subscription-packages/${plan.id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const detail = (data?.data ?? data) as {
          categories?: CheckoutPackageCategory[];
          allowCustomerCategorySelection?: boolean;
        };
        const cats = (detail?.categories ?? []).filter((c) => c.active !== false);
        if (cats.length > 0) {
          const canChooseCategories = detail.allowCustomerCategorySelection === true;
          setCategoryMode(true);
          setAllowCustomerCategorySelection(canChooseCategories);
          setPackageCategories(cats);
          setSelectedCategoryIds(cats.map((c) => c.id));
          setCatalogItems([]);
          setSelectedLines([]);
          return;
        }

        setCategoryMode(false);
        return subscriptionsApi.listMenuItemsByPlan(plan.id).then((list) => {
          if (cancelled) return;
          setCatalogItems(list);
          const rotisPerDelivery = plan.itemRules?.rotisPerDelivery ?? 6;
          const maxTypes = plan.itemRules?.maxRotiTypes ?? plan.itemRules?.maxItems ?? 1;
          const defaultItem =
            list.find((i) => i.planLink?.isDefault) ?? list[0] ?? null;
          if (defaultItem) {
            if (maxTypes === 1) {
              setSelectedLines([
                {
                  subscriptionMenuItemId: defaultItem.id,
                  name: defaultItem.name,
                  rotiType: defaultItem.rotiType,
                  quantity: rotisPerDelivery,
                },
              ]);
            } else {
              setSelectedLines([
                {
                  subscriptionMenuItemId: defaultItem.id,
                  name: defaultItem.name,
                  rotiType: defaultItem.rotiType,
                  quantity: Math.min(defaultItem.defaultQty, rotisPerDelivery),
                },
              ]);
            }
          } else {
            setSelectedLines([]);
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryMode(false);
          setCatalogItems([]);
          setSelectedLines([]);
        }
      })
      .finally(() => {
        if (!cancelled) setMenuLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plan]);

  useEffect(() => {
    if (skipPlanBuilder) return;
    if (!categoryMode || selectedCategoryIds.length === 0) {
      setPriceQuote(null);
      return;
    }
    const slotCount = Math.max(1, selectedSlotIds.length);
    subscriptionsApi
      .quotePrice(plan.id, selectedCategoryIds, slotCount)
      .then((q) => setPriceQuote({ finalPrice: q.finalPrice, originalPrice: q.originalPrice }))
      .catch(() => setPriceQuote(null));
  }, [skipPlanBuilder, categoryMode, plan.id, selectedCategoryIds, selectedSlotIds.length]);

  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    apiClient
      .get("/delivery-slots/available")
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data?.data ?? []) as DeliverySlot[];
        setSlots(list);
        if (list.length === 0) {
          setSlotsError("No delivery slots are available right now.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError("Failed to load delivery slots.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncAddressToCustomerLocation = useCallback(
    async (addr: DeliveryAddress, opts?: { skipIfSynced?: boolean }): Promise<boolean> => {
      if (opts?.skipIfSynced && addressSyncedRef.current === addr.id) {
        return addressServiceable !== false && deliveryAvailable !== false;
      }

      let synced = await locationService.syncAddressDelivery(addr);
      if (!synced?.deliveryResult.serviceable) {
        synced = await locationService.syncAddressDelivery(addr, { forceGeocode: true });
      }

      if (!synced) {
        setAddressServiceable(false);
        return false;
      }

      if (!synced.deliveryResult.serviceable) {
        setAddressServiceable(false);
        return false;
      }

      if (synced.lat !== addr.lat || synced.lng !== addr.lng) {
        try {
          await updateAddress(addr.id, { lat: synced.lat, lng: synced.lng });
        } catch {
          // non-blocking
        }
      }

      addressSyncedRef.current = addr.id;
      setAddressServiceable(true);
      return true;
    },
    [addressServiceable, deliveryAvailable, updateAddress],
  );

  useEffect(() => {
    if (selectedAddress) {
      void syncAddressToCustomerLocation(selectedAddress, { skipIfSynced: true });
    } else {
      setAddressServiceable(null);
    }
  }, [selectedAddress?.id, syncAddressToCustomerLocation]);

  useEffect(() => {
    if (step === 5) {
      void loadRazorpayScript().catch(() => undefined);
    }
  }, [step]);

  const selectedSlots = slots.filter((s) => selectedSlotIds.includes(s.id));
  const rotisPerDelivery = plan.itemRules?.rotisPerDelivery ?? 6;
  const maxRotiTypes = plan.itemRules?.maxRotiTypes ?? plan.itemRules?.maxItems ?? catalogItems.length;
  const totalItemQty = selectedLines.reduce((s, i) => s + i.quantity, 0);
  const itemsValid =
    selectedLines.length > 0 &&
    selectedLines.every((i) => i.subscriptionMenuItemId && i.quantity > 0) &&
    selectedLines.length <= maxRotiTypes &&
    totalItemQty === rotisPerDelivery;
  const menuStepValid = skipPlanBuilder
    ? true
    : isPlanChange && !categoryMode
      ? true
      : categoryMode
        ? selectedCategoryIds.length > 0
        : itemsValid;
  const stepLabels = skipPlanBuilder
    ? (skipSlotStep ? (["Start date", "Address", "Review"] as const) : (["Start date", "Address", "Slot", "Review"] as const))
    : categoryMode
      ? CATEGORY_STEP_LABELS
      : STEP_LABELS;
  const cycleLabel = plan.type === "WEEKLY" ? "week" : "month";
  const categoryTotalPrice = Number(priceQuote?.finalPrice ?? 0);
  const slotMultiplier = Math.max(1, selectedSlotIds.length || 1);
  const draftPrice = Number(checkoutDraft?.quotedPrice ?? 0);
  const baseCheckoutPrice = skipPlanBuilder && draftPrice > 0
    ? draftPrice
    : categoryMode
      ? categoryTotalPrice / slotMultiplier
      : Number(plan.finalPrice ?? plan.price);
  const checkoutPrice = skipPlanBuilder && draftPrice > 0
    ? draftPrice
    : categoryMode
      ? categoryTotalPrice
      : baseCheckoutPrice * (selectedSlotIds.length > 0 ? selectedSlotIds.length : 0);
  const amountDueNow = isPlanChange ? (planChangeQuote?.amountDue ?? 0) : checkoutPrice;

  const fetchPlanChangeQuote = useCallback(async () => {
    if (!changePlan || selectedSlotIds.length === 0) {
      setPlanChangeQuote(null);
      return;
    }
    if (categoryMode && allowCustomerCategorySelection && selectedCategoryIds.length === 0) {
      setPlanChangeQuote(null);
      return;
    }

    setLoadingPlanChangeQuote(true);
    try {
      const dto: {
        targetPlanId: string;
        packageCategoryIds?: string[];
        deliverySlotIds: string[];
        autoRenew?: boolean;
      } = {
        targetPlanId: plan.id,
        deliverySlotIds: selectedSlotIds,
        autoRenew,
      };
      if (categoryMode && selectedCategoryIds.length > 0) {
        dto.packageCategoryIds = selectedCategoryIds;
      }
      const quote = await subscriptionsApi.quotePlanChange(changePlan.subscriptionId, dto);
      setPlanChangeQuote(quote);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not quote plan change";
      toast.error(message);
      setPlanChangeQuote(null);
    } finally {
      setLoadingPlanChangeQuote(false);
    }
  }, [
    changePlan,
    plan.id,
    selectedSlotIds,
    categoryMode,
    allowCustomerCategorySelection,
    selectedCategoryIds,
    autoRenew,
  ]);

  useEffect(() => {
    if (!isPlanChange) return;
    void fetchPlanChangeQuote();
  }, [isPlanChange, fetchPlanChangeQuote]);

  const MAX_DELIVERY_SLOTS = MAX_SUBSCRIPTION_DELIVERY_SLOTS;
  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      if (prev.includes(slotId)) return prev.filter((id) => id !== slotId);
      if (prev.length >= MAX_DELIVERY_SLOTS) {
        toast.error(`You can select up to ${MAX_DELIVERY_SLOTS} delivery slots`);
        return prev;
      }
      return [...prev, slotId];
    });
  };

  const toggleCategory = (categoryId: string) => {
    if (!allowCustomerCategorySelection) return;
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const canContinueAddress = !!addressId && addressServiceable === true && !checkingAddress;
  const minDate = useMemo(() => tomorrowDateKey(), []);

  const handleAddressContinue = async () => {
    if (!selectedAddress) {
      setAddressModalOpen(true);
      return;
    }
    setCheckingAddress(true);
    try {
      const ok = await syncAddressToCustomerLocation(selectedAddress);
      if (!ok) {
        toast.error(
          deliveryMessage ??
            "Sorry, we don't deliver to this location. Please choose a different address.",
        );
        return;
      }
      setStep(skipSlotStep ? 5 : 4);
    } finally {
      setCheckingAddress(false);
    }
  };

  const toggleRotiSelection = (item: SubscriptionMenuItem) => {
    setSelectedLines((prev) => {
      const exists = prev.find((l) => l.subscriptionMenuItemId === item.id);
      if (exists) {
        return prev.filter((l) => l.subscriptionMenuItemId !== item.id);
      }
      if (maxRotiTypes === 1) {
        return [
          {
            subscriptionMenuItemId: item.id,
            name: item.name,
            rotiType: item.rotiType,
            quantity: rotisPerDelivery,
          },
        ];
      }
      if (prev.length >= maxRotiTypes) {
        toast.error(`This plan allows at most ${maxRotiTypes} roti type(s)`);
        return prev;
      }
      const remaining = Math.max(1, rotisPerDelivery - prev.reduce((s, l) => s + l.quantity, 0));
      return [
        ...prev,
        {
          subscriptionMenuItemId: item.id,
          name: item.name,
          rotiType: item.rotiType,
          quantity: Math.min(item.defaultQty, remaining),
        },
      ];
    });
  };

  const updateLineQty = (subscriptionMenuItemId: string, delta: number) => {
    setSelectedLines((prev) =>
      prev.map((line) =>
        line.subscriptionMenuItemId === subscriptionMenuItemId
          ? { ...line, quantity: Math.max(1, line.quantity + delta) }
          : line,
      ),
    );
  };

  const submit = async () => {
    if (!addressId || selectedSlotIds.length === 0 || !selectedAddress) {
      toast.error("Complete all steps before continuing");
      return;
    }
    if (!isPlanChange && !startDate) {
      toast.error("Complete all steps before continuing");
      return;
    }
    if (!categoryMode && !isPlanChange && !itemsValid) {
      toast.error("Complete all steps before continuing");
      return;
    }
    if (categoryMode && selectedCategoryIds.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    if (isPlanChange && !planChangeQuote) {
      toast.error("Could not calculate plan change amount. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      if (isPlanChange && changePlan) {
        if (changePlan.subscription.addressId && changePlan.subscription.addressId !== addressId) {
          await subscriptionsApi.changeAddress(changePlan.subscriptionId, addressId);
        }

        const dto: {
          targetPlanId: string;
          packageCategoryIds?: string[];
          deliverySlotIds: string[];
          autoRenew?: boolean;
        } = {
          targetPlanId: plan.id,
          deliverySlotIds: selectedSlotIds,
          autoRenew,
        };
        if (categoryMode && selectedCategoryIds.length > 0) {
          dto.packageCategoryIds = selectedCategoryIds;
        }

        const result = await subscriptionsApi.changePlan(changePlan.subscriptionId, dto);

        if (result.scheduled) {
          toast.success(
            `Downgrade scheduled for ${formatDisplayDate(result.effectiveAt ?? planChangeQuote!.effectiveAt)}.`,
          );
          router.push(`/subscriptions/activated?plan=${encodeURIComponent(plan.name)}`);
          return;
        }

        if (result.immediate && (result.amountDue ?? 0) <= 0) {
          toast.success(`Plan changed to ${plan.name}.`);
          router.push(`/subscriptions/activated?plan=${encodeURIComponent(plan.name)}`);
          return;
        }

        if (!result.checkoutSessionId) {
          toast.error("Could not start payment for this plan change");
          setSubmitting(false);
          return;
        }

        setSubmitting(false);
        await initiateAndOpenSubscriptionPayment(
          {
            subscriptionId: changePlan.subscriptionId,
            checkoutSessionId: result.checkoutSessionId,
            planName: plan.name,
            expectedAmount: result.amountDue,
            prefill: {
              name: selectedAddress.name ?? user?.name ?? "",
              contact: selectedAddress.phone,
            },
          },
          {
            onSuccess: () => {
              toast.success(`Upgraded to ${plan.name}.`);
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
        return;
      }

      if (!skipPlanBuilder && !categoryMode && !itemsValid) {
        toast.error("Complete all steps before continuing");
        return;
      }

      if (skipPlanBuilder || categoryMode) {
        const result = await subscriptionsApi.createWithCategories({
          packageId: plan.id,
          addressId,
          deliverySlotId: selectedSlotIds[0],
          deliverySlotIds: selectedSlotIds.length ? selectedSlotIds : undefined,
          packageCategoryIds: selectedCategoryIds.length ? selectedCategoryIds : undefined,
          mealSlotIds: checkoutDraft?.mealSlotIds?.length ? checkoutDraft.mealSlotIds : undefined,
          bundleId: checkoutDraft?.bundleId,
          durationOptionId: checkoutDraft?.durationOptionId,
          startDate,
          autoRenew,
          weeklyMenuOverrides: checkoutDraft?.weeklyMenuOverrides?.length
            ? checkoutDraft.weeklyMenuOverrides.map((override) => ({
                day: override.day,
                mealSlotId: override.mealSlotId,
                items: override.items.map((item) => ({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                })),
              }))
            : undefined,
        });

        await initiateAndOpenSubscriptionPayment(
          {
            subscriptionId: result.subscription.id,
            checkoutSessionId: result.checkoutSessionId,
            planName: plan.name,
            prefill: {
              name: selectedAddress.name ?? user?.name ?? "",
              contact: selectedAddress.phone,
            },
            expectedAmount: Number(result.grandTotal ?? checkoutPrice),
          },
          {
            onSuccess: async () => {
              toast.success("Payment successful — subscription activated!");
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
        return;
      }

      let subscriptionId = checkoutContext?.subscriptionId;
      let checkoutSessionId = checkoutContext?.checkoutSessionId;

      if (!subscriptionId || !checkoutSessionId) {
        const result = await subscriptionsApi.create({
          planId: plan.id,
          addressId,
          deliverySlotId: selectedSlotIds[0],
          deliverySlotIds: selectedSlotIds.length > 1 ? selectedSlotIds : undefined,
          startDate,
          items: selectedLines.map(({ subscriptionMenuItemId, quantity }) => ({
            subscriptionMenuItemId,
            quantity,
          })),
          paymentMethod: "ONLINE",
          autoRenew,
        });

        subscriptionId = result.subscription.id;
        checkoutSessionId = result.checkoutSessionId;
        setCheckoutContext({ subscriptionId, checkoutSessionId });

        if (result.resumed) {
          toast.info("You have a pending payment — continuing checkout");
        }
      }

      await initiateAndOpenSubscriptionPayment(
        {
          subscriptionId,
          checkoutSessionId,
          planName: plan.name,
          prefill: {
            name: selectedAddress.name ?? user?.name ?? "",
            contact: selectedAddress.phone,
          },
          expectedAmount: checkoutPrice,
        },
        {
          onSuccess: async () => {
            toast.success("Payment successful — subscription activated!");
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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message;
      if (err?.response?.status === 409 && msg?.includes("already have an active")) {
        toast.error(msg);
      } else {
        toast.error(msg ?? "Failed to start payment");
      }
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Please sign in to subscribe.</p>
        <Button className="mt-4" onClick={openAuthForCheckout}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={isPlanChange ? "/profile?tab=subscriptions" : skipPlanBuilder ? `/subscriptions/${plan.id}/view` : "/subscriptions"}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {isPlanChange ? "Back to subscriptions" : skipPlanBuilder ? "Back to plan" : "Back to plans"}
      </Link>

      <h1 className="text-2xl font-bold">
        {isPlanChange ? `Change to ${plan.name}` : plan.name}
      </h1>
      {isPlanChange && changePlan?.subscription.plan?.name ? (
        <p className="text-sm text-muted-foreground">
          Current plan: {changePlan.subscription.plan.name}
        </p>
      ) : null}
      <PlanDescription
        description={plan.description}
        className="text-sm text-muted-foreground"
      />
      <p className="mt-2 text-lg font-semibold">
        {isPlanChange && planChangeQuote
          ? `${formatPrice(planChangeQuote.amountDue)} due today (${planChangeQuote.changeType.toLowerCase()})`
          : skipPlanBuilder && draftPrice > 0
            ? `₹${formatIndianPrice(draftPrice)}`
            : categoryMode && priceQuote
            ? `${formatPrice(priceQuote.finalPrice)} / ${cycleLabel}`
            : `${formatPrice(Number(plan.finalPrice ?? plan.price))} / ${plan.type.toLowerCase()}`}
      </p>

      <div className="mt-8 flex flex-wrap gap-2 text-xs sm:text-sm">
        {stepLabels.map((label, idx) => {
          const s = skipPlanBuilder
            ? (skipSlotStep ? [2, 3, 5] : [2, 3, 4, 5])[idx]
            : idx + 1;
          return (
            <span
              key={label}
              className={cn(
                "rounded-full px-3 py-1 font-medium",
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {s}. {label}
            </span>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-6">
          {step === 1 && categoryMode && (
            <>
              <h2 className="font-semibold">Choose your menu</h2>
              <p className="text-sm text-muted-foreground">
                {allowCustomerCategorySelection
                  ? "Select the categories you want for this subscription. After you subscribe, use the Roti Dukaan mobile app to pick daily menu items and manage meals."
                  : "This package includes the categories below. After you subscribe, use the Roti Dukaan mobile app to pick daily menu items and manage meals."}
              </p>
              {menuLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading menu…
                </div>
              ) : packageCategories.length === 0 ? (
                <p className="text-sm text-destructive">
                  No menu categories are configured for this package yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {packageCategories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    const label = cat.categoryName ?? CATEGORY_LABELS[cat.category] ?? cat.category;
                    const items = (cat.menuItems ?? [])
                      .map((link) => link.menuItem?.name)
                      .filter(Boolean) as string[];
                    return (
                      <li
                        key={cat.id}
                        className={cn(
                          "rounded-xl border p-4 transition-colors",
                          isSelected ? "border-primary bg-primary/5" : "border-border",
                          !allowCustomerCategorySelection && "cursor-default",
                        )}
                      >
                        {allowCustomerCategorySelection ? (
                          <button
                            type="button"
                            className="flex w-full items-start gap-3 text-left"
                            onClick={() => toggleCategory(cat.id)}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40",
                              )}
                            >
                              {isSelected && <CheckCircle2 className="size-3.5" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{label}</p>
                                {allowCustomerCategorySelection && (
                                  <span className="text-sm font-semibold">
                                    {formatPrice(cat.categoryPrice)}/{cycleLabel}
                                  </span>
                                )}
                              </div>
                              {items.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {items.map((name) => (
                                    <Badge key={name} variant="secondary" className="text-[10px]">
                                      {name}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Menu items will be added by admin for this category.
                                </p>
                              )}
                            </div>
                          </button>
                        ) : (
                          <div className="flex w-full items-start gap-3">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
                              <CheckCircle2 className="size-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{label}</p>
                                {allowCustomerCategorySelection && (
                                  <span className="text-sm font-semibold">
                                    {formatPrice(cat.categoryPrice)}/{cycleLabel}
                                  </span>
                                )}
                              </div>
                              {items.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {items.map((name) => (
                                    <Badge key={name} variant="secondary" className="text-[10px]">
                                      {name}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Menu items will be added by admin for this category.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {selectedCategoryIds.length > 0 && priceQuote && (
                <p className="text-sm font-semibold">
                  {allowCustomerCategorySelection ? "Selected total" : "Package total"}:{" "}
                  {formatPrice(priceQuote.finalPrice)}/{cycleLabel}
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} disabled={!menuStepValid}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 1 && !categoryMode && (
            <>
              <h2 className="font-semibold">Choose your rotis</h2>
              <p className="text-sm text-muted-foreground">
                Select roti type(s) for each meal — allocate exactly {rotisPerDelivery} rotis
                {maxRotiTypes === 1
                  ? " (one type only)"
                  : ` (up to ${maxRotiTypes} types)`}
                .
              </p>
              {menuLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading subscription menu…
                </div>
              ) : catalogItems.length === 0 ? (
                <p className="text-sm text-destructive">
                  No subscription rotis are available for this plan. Please try again later.
                </p>
              ) : (
                <ul className="space-y-3">
                  {catalogItems.map((item) => {
                    const selected = selectedLines.find(
                      (l) => l.subscriptionMenuItemId === item.id,
                    );
                    const isSelected = !!selected;
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "rounded-xl border p-4 transition-colors",
                          isSelected ? "border-primary bg-primary/5" : "border-border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            onClick={() => toggleRotiSelection(item)}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40",
                              )}
                            >
                              {isSelected && <CheckCircle2 className="size-3.5" />}
                            </span>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <Badge variant="secondary" className="mt-1 text-[10px]">
                                {ROTI_TYPE_LABELS[item.rotiType]}
                              </Badge>
                              {item.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </button>
                          {isSelected && selected && maxRotiTypes > 1 && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => updateLineQty(item.id, -1)}
                                disabled={selected.quantity <= 1}
                              >
                                <Minus className="size-4" />
                              </Button>
                              <span className="min-w-[2ch] text-center font-semibold">
                                {selected.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => updateLineQty(item.id, 1)}
                                disabled={totalItemQty >= rotisPerDelivery}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {selectedLines.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected:{" "}
                  {selectedLines
                    .map((l) => `${l.name} × ${l.quantity}`)
                    .join(", ")}{" "}
                  ({totalItemQty}/{rotisPerDelivery})
                </p>
              )}
              {!itemsValid && selectedLines.length > 0 && totalItemQty !== rotisPerDelivery && (
                <p className="text-sm text-destructive">
                  Allocate exactly {rotisPerDelivery} rotis (currently {totalItemQty}).
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} disabled={!itemsValid}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {isPlanChange ? (
                <>
                  <h2 className="font-semibold">When this takes effect</h2>
                  <p className="text-sm text-muted-foreground">
                    Upgrades apply immediately with prorated pricing. Downgrades take effect at your
                    next billing cycle — your current delivery schedule continues until then.
                  </p>
                  {loadingPlanChangeQuote ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Calculating adjustment…
                    </div>
                  ) : planChangeQuote ? (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                      <p>
                        <strong>Change type:</strong> {planChangeQuote.changeType}
                      </p>
                      <p>
                        <strong>Effective:</strong>{" "}
                        {formatDisplayDate(planChangeQuote.effectiveAt)}
                      </p>
                      <p>
                        <strong>Meals left:</strong> {planChangeQuote.remainingDeliveries} of{" "}
                        {planChangeQuote.totalDeliveries}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <h2 className="font-semibold">Start date</h2>
                  <p className="text-sm text-muted-foreground">
                    Your first meal is scheduled on the same day you select.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="sub-start-date">Subscription start date</Label>
                    <Input
                      id="sub-start-date"
                      type="date"
                      value={startDate}
                      min={minDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    {startDate ? (
                      <p className="text-sm font-medium text-foreground">
                        First meal on {formatDisplayDate(startDate)}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPlanMealCount(plan.deliveriesPerCycle)} over {plan.validityDays} days
                  </p>
                </>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (skipPlanBuilder) {
                      router.push(`/subscriptions/${plan.id}/view`);
                      return;
                    }
                    setStep(1);
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={isPlanChange ? loadingPlanChangeQuote || !planChangeQuote : !startDate}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold">Delivery address</h2>
              <p className="text-sm text-muted-foreground">
                Choose where your subscription meals should be delivered. We&apos;ll verify
                serviceability for your area.
              </p>

              {addressesLoading && addresses.length === 0 ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading saved addresses…
                </div>
              ) : addressesError && addresses.length === 0 ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="text-destructive">{addressesError}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={fetchAddresses}>
                    Retry
                  </Button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <MapPin className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-3 font-medium">No saved addresses</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your delivery address to continue with subscription checkout.
                  </p>
                  <Button className="mt-4" onClick={() => setAddressModalOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add delivery address
                  </Button>
                </div>
              ) : (
                <>
                  <RadioGroup
                    value={addressId ?? ""}
                    onValueChange={selectAddress}
                    className="space-y-3"
                  >
                    {addresses.map((addr) => {
                      const config = addressTypeConfig[addr.addressType] ?? addressTypeConfig.home;
                      const Icon = config.icon;
                      const isSelected = addressId === addr.id;
                      return (
                        <label
                          key={addr.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30",
                          )}
                        >
                          <RadioGroupItem value={addr.id} className="mt-1" />
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg",
                              isSelected ? "bg-primary/10" : "bg-muted",
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-4",
                                isSelected ? config.color : "text-muted-foreground",
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold capitalize">{config.label}</span>
                              {addr.isDefault && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {addr.name} · {addr.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {[addr.house, addr.apartment, addr.street, addr.area]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          {isSelected && addressServiceable === true && (
                            <CheckCircle2 className="size-5 shrink-0 text-primary" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>

                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setAddressModalOpen(true)}
                  >
                    <Plus className="mr-2 size-4" />
                    Add new address
                  </Button>

                  {addressServiceable === false && (
                    <p className="text-sm text-destructive">
                      {deliveryMessage ??
                        "This address is outside our delivery area. Please choose another address."}
                    </p>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleAddressContinue}
                  disabled={!canContinueAddress && addresses.length > 0}
                >
                  {checkingAddress ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Verifying address…
                    </>
                  ) : addresses.length === 0 ? (
                    "Add address to continue"
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
              {addresses.length === 0 && (
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => setAddressModalOpen(true)}
                >
                  Open address form
                </Button>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-semibold">Delivery slot</h2>
              <p className="text-sm text-muted-foreground">
                Select one or more time windows. Your subscription price is multiplied by the number
                of slots you choose.
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
                  multiple
                  selectedSlotIds={selectedSlotIds}
                  onSelect={(slot) => toggleSlot(slot.id)}
                />
              )}
              {selectedSlotIds.length > 0 && checkoutPrice > 0 && (
                <p className="text-sm text-muted-foreground">
                  {categoryMode && selectedSlotIds.length > 1 ? (
                    <>
                      {formatPrice(baseCheckoutPrice)} × {selectedSlotIds.length} slots ={" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(checkoutPrice)}
                      </span>{" "}
                      / {cycleLabel}
                    </>
                  ) : categoryMode ? (
                    <>
                      Total:{" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(checkoutPrice)}
                      </span>{" "}
                      / {cycleLabel}
                    </>
                  ) : (
                    <>
                      {formatPrice(baseCheckoutPrice)} × {selectedSlotIds.length} slot
                      {selectedSlotIds.length === 1 ? "" : "s"} ={" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(checkoutPrice)}
                      </span>{" "}
                      / {cycleLabel}
                    </>
                  )}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)} disabled={selectedSlotIds.length === 0}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="font-semibold">
                {isPlanChange ? "Review & confirm" : "Review & pay"}
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong>Plan:</strong> {plan.name}
                    {!isPlanChange && (
                      <> — {formatPrice(checkoutPrice)} / {cycleLabel}</>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong>Address:</strong>{" "}
                    {selectedAddress
                      ? `${selectedAddress.house}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                      : "—"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong>{categoryMode ? "Categories" : "Rotis"}:</strong>{" "}
                    {categoryMode
                      ? packageCategories
                          .filter((c) => selectedCategoryIds.includes(c.id))
                          .map((c) => c.categoryName ?? CATEGORY_LABELS[c.category] ?? c.category)
                          .join(", ")
                      : selectedLines.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong>Slot{selectedSlots.length === 1 ? "" : "s"}:</strong>{" "}
                    {selectedSlots.length > 0
                      ? selectedSlots
                          .map(
                            (s) =>
                              `${s.name} (${formatDeliverySlotLabel(s.startTime, s.endTime)})`,
                          )
                          .join(", ")
                      : "—"}
                    {selectedSlots.length > 1 && baseCheckoutPrice > 0 && (
                      <>
                        {" "}
                        — {formatPrice(baseCheckoutPrice)} × {selectedSlots.length} ={" "}
                        {formatPrice(checkoutPrice)}
                      </>
                    )}
                  </span>
                </li>
                {!isPlanChange ? (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <strong>Starts:</strong> {formatDisplayDate(startDate)}
                    </span>
                  </li>
                ) : planChangeQuote ? (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <strong>Effective:</strong>{" "}
                      {formatDisplayDate(planChangeQuote.effectiveAt)}
                    </span>
                  </li>
                ) : null}
              </ul>

              {isPlanChange && planChangeQuote ? (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                  {planChangeQuote.changeType === "DOWNGRADE" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New plan price (next cycle)</span>
                        <span>{formatPrice(planChangeQuote.newCyclePrice)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>Payment now</span>
                        <span>None</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Your current plan continues until{" "}
                        {formatDisplayDate(planChangeQuote.effectiveAt)}. The lower price applies
                        from the next billing cycle — no payment or credit today.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unused credit</span>
                        <span>{formatPrice(planChangeQuote.remainingCredit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New plan (prorated)</span>
                        <span>{formatPrice(planChangeQuote.newProratedPrice)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>Amount due today</span>
                        <span>{formatPrice(planChangeQuote.amountDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {(!isPlanChange || planChangeQuote) && (
                <PaymentTypeChoice
                  autoRenew={autoRenew}
                  onSelect={setAutoRenew}
                  isPlanChange={isPlanChange}
                  planChangeQuote={planChangeQuote}
                />
              )}

              {(!isPlanChange || (planChangeQuote && planChangeQuote.amountDue > 0)) && (
                <PayOnlineMethodNote />
              )}

              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="font-semibold">
                  {isPlanChange ? "Adjusted amount due" : "Total due now"}
                </span>
                <span className="text-lg font-bold">
                  {loadingPlanChangeQuote && isPlanChange ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    formatPrice(amountDueNow)
                  )}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(skipSlotStep ? 3 : 4)}>
                  Back
                </Button>
                <Button
                  onClick={submit}
                  disabled={
                    submitting
                    || (isPlanChange && (loadingPlanChangeQuote || !planChangeQuote))
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {isPlanChange ? "Processing…" : checkoutContext ? "Opening payment…" : "Creating subscription…"}
                    </>
                  ) : isPlanChange ? (
                    planChangeQuote?.changeType === "DOWNGRADE"
                      ? "Schedule downgrade"
                      : planChangeQuote && planChangeQuote.amountDue > 0
                        ? `Proceed to payment · ${formatPrice(planChangeQuote.amountDue)}`
                        : "Confirm plan change"
                  ) : (
                    "Proceed to payment"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onAddressSelected={(id) => {
          selectAddress(id);
          addressSyncedRef.current = null;
          setAddressServiceable(null);
          const addr = useAddressStore.getState().addresses.find((a) => a.id === id);
          if (addr) void syncAddressToCustomerLocation(addr);
        }}
      />
    </div>
  );
}

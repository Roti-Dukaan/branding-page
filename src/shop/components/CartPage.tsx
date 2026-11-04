"use client";

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  UtensilsCrossed,
  Tag,
  MapPin,
  Sparkles,
  Loader2,
  Flame,
  Receipt,
  ArrowRight,
  Banknote,
  Smartphone,
} from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { Label } from "@shop/components/ui/label";

import { Separator } from "@shop/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@shop/components/ui/alert";
import { Skeleton } from "@shop/components/ui/skeleton";
import { Badge } from "@shop/components/ui/badge";
import { locationService } from "@shop/services/location.service";
import { useCartStore } from "@shop/lib/store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { useOrderPricing } from "@shop/hooks/use-order-pricing";
import { useKitchenStatus } from "@shop/components/kitchen/KitchenStatusProvider";
import { KitchenUnavailableDialog } from "@shop/components/kitchen/KitchenUnavailableDialog";
import { formatPrice } from "@shop/lib/utils";
import { cn } from "@shop/lib/utils";
import { SITE_CONFIG } from "@shop/lib/constants";
import { toast } from "@shop/lib/toast";
import { paymentService } from "@shop/services/payment.service";
import { checkoutService } from "@shop/services/checkout.service";
import { fetchPublicSettings, type PublicSettings } from "@shop/services/settings.service";
import { couponService, type AvailableCoupon } from "@shop/services/coupon.service";
import { ensureCartSynced } from "@shop/lib/cart-sync";
import { useCartBackgroundSync } from "@shop/hooks/use-cart-background-sync";
import { apiClient, getApiErrorMessage, unwrapApiResponse } from "@shop/lib/api/client";
import { createAddress, checkPincodeServiceability } from "@shop/services/address.service";
import { productApi } from "@shop/lib/api/menu.api";
import { isFoodItemUuid, resolveFoodItemId } from "@shop/lib/food-item-id";
import ProfileModal from "@shop/components/ProfileModal";
import AddressModal from "@shop/components/AddressModal";
import LocationDialog from "@shop/components/location/LocationDialog";
import SuccessModal from "@shop/components/SuccessModal";
import { getMetaCookies, trackMetaPurchaseFromOrderId } from "@shop/lib/meta/purchase";
import {
  clearPendingRazorpayPayment,
  readPendingRazorpayPayment,
  savePendingRazorpayPayment,
} from "@shop/lib/pending-razorpay-payment";
import { DeliverySlotPicker } from "@shop/components/delivery/DeliverySlotPicker";
import type { MenuItem, DeliveryAddress, DeliverySlot } from "@shop/lib/types";

type DeliverySlotApi = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  quickDelivery?: boolean;
};

export default function CartPage() {
  const router = useRouter();
  
  // Determine payment method from URL params on initial load
  const [selectedPaymentId, setSelectedPaymentId] = useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPayment = urlParams.get("payment");
      if (urlPayment) return urlPayment;
    }
    return "";
  });

  const hasHydrated = useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAuthenticated, openAuthForCheckout, user, updateUser, pendingCheckout, setPendingCheckout } = useAuthStore();
  const { addresses, selectedAddressId, selectAddress, fetchAddresses, addAddress, updateAddress } = useAddressStore();
  const {
    latitude,
    longitude,
    deliveryAvailable,
    deliveryMessage,
    branchName,
    branchId,
    estimatedTime,
    deliveryCharge,
    distance,
    pincode,
    getDisplayName,
    isLocationSet,
  } = useLocationStore();
  const { isBlockingOrders, status: kitchenStatus, data: kitchenData } = useKitchenStatus();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [kitchenUnavailableOpen, setKitchenUnavailableOpen] = useState(false);

  const [deliverySlots, setDeliverySlots] = useState<DeliverySlotApi[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<"QUICK" | "SCHEDULED">("QUICK");
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlotApi | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<"idle" | "payment" | "confirming">("idle");
  const addressSyncedRef = useRef<string | null>(null);
  const couponHydratedRef = useRef(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [couponOpen, setCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AvailableCoupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [applyingCouponCode, setApplyingCouponCode] = useState<string | null>(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);

  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const [recommendedItems, setRecommendedItems] = useState<(MenuItem & { slug?: string })[]>([]);
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null);

  const visibleRecommendedItems = useMemo(() => {
    const inCart = new Set(items.map((i) => i.id));
    return recommendedItems
      .filter((item) => !inCart.has(item.id) && (!item.slug || !inCart.has(item.slug)))
      .slice(0, 4);
  }, [recommendedItems, items]);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0] ??
    null;

  const mappedCart = items.map((i) => ({
    slug: isFoodItemUuid(i.id) ? undefined : i.id,
    foodItemId: isFoodItemUuid(i.id) ? i.id : undefined,
    quantity: i.quantity,
  }));
  const deliveryState = selectedAddress?.state ?? undefined;

  useCartBackgroundSync(isAuthenticated);

  const localSubtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const { pricing, isLoading: pricingLoading } = useOrderPricing(
    mappedCart,
    {
      state: deliveryState,
      pincode: deliveryState ? undefined : pincode ?? undefined,
      discount: couponDiscountAmount,
      enabled: mappedCart.length > 0 && !!(deliveryState || pincode),
    }
  );

  const cartSubtotalForCoupon = pricing?.subtotal ?? localSubtotal;
  const subtotal = pricing?.subtotal ?? localSubtotal;
  const gstAmount = pricing?.gstAmount ?? 0;
  const packagingCharge = pricing?.packagingCharge ?? 0;
  const deliveryChargeAmount = pricing ? pricing.deliveryCharge : deliveryCharge;
  const pricingDiscount =
    couponDiscountAmount > 0 ? couponDiscountAmount : (pricing?.discount ?? 0);
  const computedGrandTotal =
    subtotal + gstAmount + packagingCharge + deliveryChargeAmount - pricingDiscount;
  const grandTotal =
    pricing?.grandTotal != null &&
    (couponDiscountAmount === 0 || (pricing?.discount ?? 0) === couponDiscountAmount)
      ? pricing.grandTotal
      : computedGrandTotal;

  const codEnabled = Boolean(
    publicSettings?.cashOnDeliveryEnabled && publicSettings?.codEnabledForOneTime !== false,
  );
  const instantEnabled = publicSettings?.allowInstantDelivery !== false;
  const scheduledEnabled = Boolean(publicSettings?.allowScheduledDelivery);
  const minimumOrderAmount = publicSettings?.minimumOrderAmount ?? 0;
  const maximumOrderAmount = publicSettings?.maximumOrderAmount ?? 0;
  const standardDeliveryCharge = pricing?.standardDeliveryCharge ?? publicSettings?.deliveryCharge ?? 0;
  const deliverySavings =
    pricing?.freeDelivery && standardDeliveryCharge > 0 ? standardDeliveryCharge : 0;
  const totalSavings = pricingDiscount + deliverySavings;
  const belowMinimumOrder =
    minimumOrderAmount > 0 && subtotal > 0 && subtotal < minimumOrderAmount;
  const aboveMaximumOrder =
    maximumOrderAmount > 0 && grandTotal > maximumOrderAmount;
  const freeDeliveryAbove =
    publicSettings?.freeDeliveryAbove ?? SITE_CONFIG.freeDeliveryThreshold;
  const amountToFreeDelivery =
    freeDeliveryAbove > 0 &&
    deliveryChargeAmount > 0 &&
    subtotal > 0 &&
    subtotal < freeDeliveryAbove
      ? freeDeliveryAbove - subtotal
      : 0;

  useEffect(() => {
    fetchPublicSettings()
      .then(setPublicSettings)
      .catch(() => setPublicSettings(null));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      couponService
        .listAvailable()
        .then(setAvailableCoupons)
        .catch(() => setAvailableCoupons([]));
      return;
    }
    couponService
      .listAvailablePublic(branchId ?? undefined)
      .then(setAvailableCoupons)
      .catch(() => setAvailableCoupons([]));
  }, [isAuthenticated, branchId]);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0 || couponHydratedRef.current) return;

    let cancelled = false;
    couponHydratedRef.current = true;

    const hydrateAppliedCoupon = async () => {
      try {
        const { data } = await apiClient.get("/cart");
        const cart = data?.data;
        if (cancelled || !cart) return;

        const code = cart.appliedCouponCode;
        const discount = Number(cart.discountAmount) || 0;
        if (!code || discount <= 0) return;

        setCouponDiscountAmount(discount);
        setCouponCodeInput(code);

        const matched =
          availableCoupons.find((c) => c.code === code) ??
          ({
            id: cart.appliedCouponId ?? code,
            code,
            title: code,
            description: code,
            discount: `-${formatPrice(discount)}`,
            discountType: "FLAT" as const,
            discountValue: discount,
            isActive: true,
          } satisfies AvailableCoupon);

        setAppliedCoupon(matched);
      } catch {
        // ignore — cart may not exist yet
      }
    };

    void hydrateAppliedCoupon();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, items.length, availableCoupons]);

  useEffect(() => {
    if (!appliedCoupon?.code || availableCoupons.length === 0) return;
    const matched = availableCoupons.find((c) => c.code === appliedCoupon.code);
    if (matched && matched.id !== appliedCoupon.id) {
      setAppliedCoupon(matched);
    }
  }, [availableCoupons, appliedCoupon]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (defaultAddr) {
        selectAddress(defaultAddr.id);
      }
    }
  }, [addresses, selectedAddressId, selectAddress]);

  useEffect(() => {
    let cancelled = false;

    const migrateCartItemIds = async () => {
      const currentItems = useCartStore.getState().items;
      const slugItems = currentItems.filter((item) => !isFoodItemUuid(item.id));
      if (slugItems.length === 0) return;

      const resolvedIds = new Map<string, string>();
      for (const item of slugItems) {
        if (resolvedIds.has(item.id)) continue;
        try {
          resolvedIds.set(item.id, await resolveFoodItemId(item.id));
        } catch {
          // Leave legacy slug in place; checkout sync will surface a clear error.
        }
      }

      if (cancelled || resolvedIds.size === 0) return;

      useCartStore.setState({
        items: currentItems.map((item) => {
          const nextId = resolvedIds.get(item.id);
          return nextId ? { ...item, id: nextId } : item;
        }),
      });
    };

    migrateCartItemIds();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAddresses();
  }, [isAuthenticated, fetchAddresses]);

  useEffect(() => {
    if (!isAuthenticated || !pendingCheckout) return;

    let cancelled = false;

    const resumeCheckout = async () => {
      setPendingCheckout(false);

      if (!user?.name || !user?.phone) {
        setProfileModalOpen(true);
        return;
      }

      try {
        await fetchAddresses();
      } catch {
        // Address fetch failure is handled in the store.
      }

      if (cancelled) return;

      const state = useAddressStore.getState();
      const hasAddress =
        state.addresses.length > 0 &&
        (state.selectedAddressId
          ? state.addresses.some((a) => a.id === state.selectedAddressId)
          : true);

      if (!hasAddress) {
        setAddressModalOpen(true);
        return;
      }

      toast.success("You're logged in. Review your order and proceed to payment.");
    };

    void resumeCheckout();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pendingCheckout, setPendingCheckout, user?.name, user?.phone, fetchAddresses]);

  useEffect(() => {
    let cancelled = false;
    const loadSlots = async () => {
      setSlotsError(null);
      try {
        const res = await apiClient.get("/delivery-slots/available");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          setDeliverySlots(json.data);
        } else {
          throw new Error(json.message || "Unexpected response from server");
        }
      } catch (e) {
        setSlotsError(getApiErrorMessage(e, "Failed to load delivery slots"));
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    loadSlots();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (deliveryMode !== "SCHEDULED" || deliverySlots.length === 0) return;
    if (selectedSlot && deliverySlots.some((slot) => slot.id === selectedSlot.id)) return;
    setSelectedSlot(deliverySlots[0]);
  }, [deliveryMode, deliverySlots, selectedSlot]);

  useEffect(() => {
    if (!instantEnabled && deliveryMode === "QUICK") {
      setDeliveryMode(scheduledEnabled ? "SCHEDULED" : "QUICK");
      setSelectedSlot(null);
    }
    if (!scheduledEnabled && deliveryMode === "SCHEDULED") {
      setDeliveryMode(instantEnabled ? "QUICK" : "SCHEDULED");
      setSelectedSlot(null);
    }
  }, [instantEnabled, scheduledEnabled, deliveryMode]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (selectedPaymentId === "cod" && !codEnabled) {
      setSelectedPaymentId("razorpay");
      return;
    }
    if (!selectedPaymentId) {
      setSelectedPaymentId("razorpay");
    }
  }, [isAuthenticated, codEnabled, selectedPaymentId]);

  const loadRazorpayScript = useCallback((): Promise<void> => {
    if (typeof window === "undefined") return Promise.resolve();
    if (typeof (window as any).Razorpay === "function") {
      setRazorpayLoaded(true);
      return Promise.resolve();
    }

    const src = "https://checkout.razorpay.com/v1/checkout.js";

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (ok && typeof (window as any).Razorpay === "function") {
          setRazorpayLoaded(true);
          resolve();
          return;
        }
        reject(new Error("Failed to load payment gateway"));
      };

      let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }

      // `load` may have already fired for an existing tag — poll instead of hanging.
      const startedAt = Date.now();
      const poll = window.setInterval(() => {
        if (typeof (window as any).Razorpay === "function") {
          window.clearInterval(poll);
          finish(true);
        } else if (Date.now() - startedAt > 10_000) {
          window.clearInterval(poll);
          finish(false);
        }
      }, 50);

      script.addEventListener(
        "error",
        () => {
          window.clearInterval(poll);
          finish(false);
        },
        { once: true },
      );
    });
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      void loadRazorpayScript().catch(() => undefined);
    }
  }, [items.length, loadRazorpayScript]);

  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const { data } = await productApi.list({ limit: 12, sort: "sort_order" });
        if (Array.isArray(data.items)) {
          const mapped = data.items.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description || "",
            price: Number(p.price) || Number(p.basePrice) || 0,
            category: (p as any).category || "Featured",
            image: p.imageUrl || "",
            isVeg: p.isVeg ?? true,
            tags: [],
          }));
          setRecommendedItems(mapped);
        }
      } catch {
        // ignore
      }
    };
    loadRecommended();
  }, []);

  const buildCheckoutPayload = (method?: string) => {
    const paymentMethod = method || selectedPaymentId || "razorpay";
    const backendMethod = paymentMethod === "cod" ? "COD" : "ONLINE";
    const { fbp, fbc } = getMetaCookies();
    const payload: {
      addressId?: string;
      paymentMethod: "COD" | "ONLINE";
      deliveryType: "QUICK" | "SCHEDULED";
      deliverySlotId?: string;
      metaFbp?: string;
      metaFbc?: string;
    } = {
      addressId: selectedAddress?.id,
      paymentMethod: backendMethod,
      deliveryType: deliveryMode,
    };
    if (deliveryMode === "SCHEDULED" && selectedSlot?.id) payload.deliverySlotId = selectedSlot.id;
    if (fbp) payload.metaFbp = fbp;
    if (fbc) payload.metaFbc = fbc;
    return payload;
  };

  const syncAddressToCustomerLocation = useCallback(async (
    addr: DeliveryAddress,
    opts?: { skipIfSynced?: boolean },
  ): Promise<boolean> => {
    if (opts?.skipIfSynced && addressSyncedRef.current === addr.id) {
      const { deliveryAvailable: available } = useLocationStore.getState();
      return available !== false;
    }

    let synced = await locationService.syncAddressDelivery(addr);

    if (!synced?.deliveryResult.serviceable) {
      synced = await locationService.syncAddressDelivery(addr, {
        forceGeocode: true,
      });
    }

    if (!synced) {
      useLocationStore.getState().setDeliveryResult({
        serviceable: false,
        message: "Could not determine delivery coordinates for this address. Please update your address.",
      });
      return false;
    }

    if (!synced.deliveryResult.serviceable) {
      return false;
    }

    if (synced.lat !== addr.lat || synced.lng !== addr.lng) {
      try {
        await updateAddress(addr.id, { lat: synced.lat, lng: synced.lng });
      } catch {
        // Non-blocking update
      }
    }

    addressSyncedRef.current = addr.id;
    return true;
  }, [updateAddress]);

  useEffect(() => {
    if (selectedAddress) {
      syncAddressToCustomerLocation(selectedAddress);
    }
  }, [selectedAddress?.id, syncAddressToCustomerLocation]);

  const initPaymentSession = async (paymentMethod?: string) => {
    try {
      const response = await apiClient.post("/checkout", buildCheckoutPayload(paymentMethod));
      const data = unwrapApiResponse<{ id: string }>(response, "Failed to initialize payment");
      return data.id;
    } catch (e) {
      throw new Error(getApiErrorMessage(e, "Failed to initialize payment"));
    }
  };

  const completeOrderSuccess = (orderNumber: string | null, orderId: string | null) => {
    setCreatedOrderNumber(orderNumber);
    setCreatedOrderId(orderId);
    clearCart();
    clearPendingRazorpayPayment();
    toast.success("Order placed successfully!");
    setSuccessModalOpen(true);
    if (orderId) {
      void trackMetaPurchaseFromOrderId(orderId).catch(() => undefined);
    }
  };

  const handlePlaceOrder = async (sessionId: string, paymentId: string) => {
    try {
      setProcessingStep("confirming");
      const res = await apiClient.post("/orders/create-from-checkout", {
        checkoutSessionId: sessionId,
        paymentId,
      });
      if (!res.data.success) throw new Error(res.data.message || "Failed to create order");
      completeOrderSuccess(res.data.data?.orderNumber ?? null, res.data.data?.id ?? null);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to place order. Please try again."));
    } finally {
      setIsProcessing(false);
      setProcessingStep("idle");
    }
  };

  const finalizeOnlinePayment = async (
    sessionId: string,
    paymentId: string,
    verifyResult: { orderId?: string; orderNumber?: string },
  ) => {
    if (verifyResult.orderId || verifyResult.orderNumber) {
      completeOrderSuccess(verifyResult.orderNumber ?? null, verifyResult.orderId ?? null);
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }
    await handlePlaceOrder(sessionId, paymentId);
  };

  const pendingRecoveryRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || pendingRecoveryRef.current) return;
    const pending = readPendingRazorpayPayment();
    if (!pending) return;

    pendingRecoveryRef.current = true;
    setIsProcessing(true);
    setProcessingStep("confirming");

    void (async () => {
      try {
        const verified = await paymentService.verifyPayment({
          checkoutSessionId: pending.checkoutSessionId,
          razorpayOrderId: pending.razorpayOrderId,
          razorpayPaymentId: pending.razorpayPaymentId,
          razorpaySignature: pending.razorpaySignature,
        });
        clearPendingRazorpayPayment();
        await finalizeOnlinePayment(pending.checkoutSessionId, pending.paymentId, verified);
      } catch {
        try {
          const recovered = await paymentService.recoverPayment(pending.checkoutSessionId);
          clearPendingRazorpayPayment();
          await finalizeOnlinePayment(pending.checkoutSessionId, pending.paymentId, recovered);
        } catch (e) {
          toast.error(getApiErrorMessage(e, "We received your payment but could not confirm the order yet. It should appear shortly."));
          setIsProcessing(false);
          setProcessingStep("idle");
          pendingRecoveryRef.current = false;
        }
      }
    })();
  }, [isAuthenticated]);

  const handlePayment = async (forcedMethod?: string) => {
    if (isProcessing) return;

    if (isBlockingOrders) {
      setKitchenUnavailableOpen(true);
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isAuthenticated) {
      openAuthForCheckout();
      return;
    }

    if (!selectedAddress) {
      setAddressModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setProcessingStep("payment");

    const deliveryOk = await syncAddressToCustomerLocation(selectedAddress);
    if (!deliveryOk) {
      const msg =
        useLocationStore.getState().deliveryMessage ??
        "Sorry, we don't deliver to this location. Please choose a different address.";
      toast.error(msg);
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }

    const method = forcedMethod || selectedPaymentId;
    const isCod = method === "cod";
    if (!isCod) {
      setSelectedPaymentId("razorpay");
    }

    try {
      await ensureCartSynced(items, isAuthenticated);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to sync cart. Please try again."));
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }

    if (isCod) {
      try {
        setProcessingStep("confirming");
        const prepared = await checkoutService.prepare(buildCheckoutPayload(method));
        const sessionId = prepared.checkoutSessionId;
        const payment = prepared.payment;
        if (!payment?.paymentId) {
          throw new Error("Failed to initialize COD payment");
        }
        if (payment.orderId || payment.orderNumber) {
          completeOrderSuccess(payment.orderNumber ?? null, payment.orderId ?? null);
          setIsProcessing(false);
          setProcessingStep("idle");
          return;
        }
        await handlePlaceOrder(sessionId, payment.paymentId);
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Failed to place order. Please try again."));
        setIsProcessing(false);
        setProcessingStep("idle");
      }
      return;
    }

    let prepared;
    try {
      const [, result] = await Promise.all([
        loadRazorpayScript(),
        checkoutService.prepare(buildCheckoutPayload(method)),
      ]);
      prepared = result;
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const msg = getApiErrorMessage(e, "Failed to open payment. Please try again.");
      console.error("[CartPage] prepare checkout failed:", msg, e);
      if (status === 401 || /unauthorized|session expired|invalid refresh/i.test(msg)) {
        openAuthForCheckout();
        toast.error("Please log in again to continue payment.");
      } else {
        toast.error(msg);
      }
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }

    const sessionId = prepared.checkoutSessionId;
    const paymentOrder = prepared.payment;
    const razorpayKey = paymentOrder?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey || !paymentOrder?.razorpayOrderId || !paymentOrder.paymentId) {
      console.error("[CartPage] Razorpay config missing:", {
        hasKey: !!razorpayKey,
        razorpayOrderId: paymentOrder?.razorpayOrderId,
        paymentId: paymentOrder?.paymentId,
      });
      toast.error("Payment gateway not configured");
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }

    if (typeof (window as any).Razorpay !== "function") {
      toast.error("Payment gateway not loaded. Please refresh and try again.");
      setIsProcessing(false);
      setProcessingStep("idle");
      return;
    }

    const amountPaise = Math.round(Number(paymentOrder.amount ?? prepared.grandTotal ?? grandTotal) * 100);

    const options = {
      key: razorpayKey,
      amount: amountPaise,
      currency: paymentOrder.currency || "INR",
      name: "Roti Dukaan",
      description: `Order for ${items.map((i) => i.name).join(", ")}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: selectedAddress?.name ?? user?.name ?? "",
        contact: selectedAddress?.phone ?? user?.phone ?? "",
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        savePendingRazorpayPayment({
          checkoutSessionId: sessionId,
          paymentId: paymentOrder.paymentId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        try {
          setProcessingStep("confirming");
          const verified = await paymentService.verifyPayment({
            checkoutSessionId: sessionId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearPendingRazorpayPayment();
          await finalizeOnlinePayment(sessionId, paymentOrder.paymentId, verified);
        } catch (e) {
          try {
            const recovered = await paymentService.recoverPayment(sessionId);
            clearPendingRazorpayPayment();
            await finalizeOnlinePayment(sessionId, paymentOrder.paymentId, recovered);
          } catch {
            toast.error(getApiErrorMessage(e, "Payment received — confirming your order…"));
            setIsProcessing(false);
            setProcessingStep("idle");
          }
        }
      },
      modal: { ondismiss: () => {
        setIsProcessing(false);
        setProcessingStep("idle");
      }},
    };

    try {
      const RazorpayConstructor = (window as any).Razorpay;
      if (typeof RazorpayConstructor !== "function") {
        throw new Error("Razorpay constructor is not available");
      }
      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (e) {
      console.error("[CartPage] Razorpay open failed:", e);
      toast.error("Payment gateway failed to open. Please try again.");
      setIsProcessing(false);
      setProcessingStep("idle");
    }
  };

  const handleOpenAddressFlow = () => {
    if (!isAuthenticated) {
      setLocationDialogOpen(true);
      return;
    }
    setAddressModalOpen(true);
  };

  const handleAddressSelected = async (addressId: string) => {
    selectAddress(addressId);
    const addr = addresses.find((a) => a.id === addressId);
    if (addr) {
      syncAddressToCustomerLocation(addr);
    }
  };

  const handleSaveAddress = async (
    addr: Omit<DeliveryAddress, "id"> & { lat?: number; lng?: number }
  ) => {
    const created = await addAddress(addr);
    selectAddress(created.id);
    toast.success("Address saved successfully");
    return created;
  };

  const getCtaLabel = () => {
    if (items.length === 0) return "Cart is Empty";
    if (!isAuthenticated) return `Proceed to Payment · ${formatPrice(grandTotal)}`;
    if (!user?.name || !user?.phone) return "Complete Profile";
    if (!selectedAddress) return "Add Delivery Address";
    if (deliveryAvailable === false) return "Not Deliverable";
    if (isBlockingOrders) return "Kitchen Closed";
    if (belowMinimumOrder) return `Min. order ${formatPrice(minimumOrderAmount)}`;
    if (aboveMaximumOrder) return `Max. order ${formatPrice(maximumOrderAmount)}`;
    if (!instantEnabled && !scheduledEnabled) return "Delivery Unavailable";
    if (deliveryMode === "SCHEDULED" && scheduledEnabled && !selectedSlot) return "Select Delivery Slot";
    if (selectedPaymentId === "cod") return "Place Order";
    return `Pay ${formatPrice(grandTotal)}`;
  };

  const getCtaDisabled = () => {
    if (items.length === 0) return true;
    if (!isAuthenticated) return false;
    if (!user?.name || !user?.phone) return false;
    if (!selectedAddress) return false;
    if (deliveryAvailable === false) return true;
    if (isBlockingOrders) return true;
    if (belowMinimumOrder) return true;
    if (aboveMaximumOrder) return true;
    if (!instantEnabled && !scheduledEnabled) return true;
    if (deliveryMode === "SCHEDULED" && scheduledEnabled && !selectedSlot) return true;
    return false;
  };

  const handleCtaClick = () => {
    if (isProcessing) return;

    if (!isAuthenticated) {
      openAuthForCheckout();
      return;
    }
    if (!user?.name || !user?.phone) {
      setProfileModalOpen(true);
      return;
    }
    if (!selectedAddress) {
      setAddressModalOpen(true);
      return;
    }
    if (deliveryAvailable === false) {
      toast.error(
        deliveryMessage ?? "Sorry, we don't deliver to this location. Please choose a different address.",
      );
      return;
    }
    if (isBlockingOrders) {
      setKitchenUnavailableOpen(true);
      return;
    }
    if (belowMinimumOrder) {
      toast.error(`Minimum order amount is ${formatPrice(minimumOrderAmount)}`);
      return;
    }
    if (aboveMaximumOrder) {
      toast.error(`Maximum order amount is ${formatPrice(maximumOrderAmount)}`);
      return;
    }
    if (!instantEnabled && !scheduledEnabled) {
      toast.error("Delivery is currently unavailable. Please try again later.");
      return;
    }
    if (deliveryMode === "SCHEDULED" && scheduledEnabled && !selectedSlot) {
      toast.error("Please select a delivery slot.");
      return;
    }
    handlePayment();
  };

  const handleAddRecommended = (menuItem: MenuItem) => {
    useCartStore.getState().addItem(menuItem, 1);
    toast.success(`${menuItem.name} added to cart`);
  };

  const applyCouponByCode = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCouponError("Enter a coupon code");
      return;
    }
    if (!isAuthenticated) {
      setCouponError("Sign in at checkout to apply coupons");
      toast.message("Sign in when you proceed to payment to apply coupons");
      return;
    }

    setCouponApplying(true);
    setApplyingCouponCode(trimmed);
    setCouponError(null);
    try {
      await ensureCartSynced(items, isAuthenticated);
      const result = await couponService.apply({
        code: trimmed,
        cartSubtotal: cartSubtotalForCoupon,
        branchId: branchId ?? undefined,
        orderType: "realtime",
      });

      if (!result.valid || !result.appliedCoupon) {
        setCouponError(result.reason ?? "Invalid coupon");
        return;
      }

      const matched =
        availableCoupons.find((c) => c.id === result.appliedCoupon!.id) ??
        ({
          id: result.appliedCoupon.id,
          code: result.appliedCoupon.code,
          title: result.appliedCoupon.title,
          description: result.appliedCoupon.description ?? result.appliedCoupon.title,
          discount:
            result.appliedCoupon.discountType === "FLAT"
              ? `₹${result.appliedCoupon.discountValue} OFF`
              : `${result.appliedCoupon.discountValue}% OFF`,
          discountType: result.appliedCoupon.discountType,
          discountValue: result.appliedCoupon.discountValue,
          minOrder: result.appliedCoupon.minOrderValue,
          isActive: true,
        } satisfies AvailableCoupon);

      setAppliedCoupon(matched);
      setCouponDiscountAmount(result.couponDiscount);
      setCouponCodeInput(trimmed);
      toast.success(`Hurrah! You save ${formatPrice(result.couponDiscount)}`);
    } catch (error) {
      setCouponError(couponService.getErrorMessage(error, "Failed to apply coupon"));
    } finally {
      setCouponApplying(false);
      setApplyingCouponCode(null);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      if (isAuthenticated) {
        await couponService.remove();
      }
      setAppliedCoupon(null);
      setCouponDiscountAmount(0);
      setCouponCodeInput("");
      setCouponError(null);
      toast.success("Coupon removed");
    } catch (error) {
      toast.error(couponService.getErrorMessage(error, "Failed to remove coupon"));
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    router.push("/profile?tab=orders");
  };

  const isProfileComplete = user?.name && user?.phone;
  const showAddressSection = selectedAddress || (isAuthenticated && !deliveryAvailable);
  const isMissingProfile = isAuthenticated && !isProfileComplete;
  const isCod = selectedPaymentId === "cod";

  const unavailableIds = useMemo(() => items.filter((i) => unavailableItems.includes(i.id)).map((i) => i.id), [items, unavailableItems]);

  return (
    <div className={cn("min-h-screen bg-background", items.length > 0 ? "pb-32 lg:pb-24" : "pb-24")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Your Cart</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your <span className="text-primary italic font-normal">Cart</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                {items.length} items
              </span>
              {branchName && (
                <span className="inline-flex items-center gap-1">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                  {branchName}
                </span>
              )}
              {kitchenStatus && kitchenStatus !== "OPEN" && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    kitchenStatus === "BUSY"
                      ? "bg-amber-100 text-amber-800"
                      : kitchenStatus === "CLOSED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {kitchenStatus === "BUSY"
                    ? "Busy"
                    : kitchenStatus === "CLOSED"
                      ? "Closed"
                      : "Maintenance"}
                </span>
              )}
            </div>
          </div>
        </div>

        {!hasHydrated ? (
          <div className="max-w-xl mx-auto my-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background to-muted/30 p-12 text-center max-w-xl mx-auto my-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Looks like you haven&apos;t added anything to your cart yet.
                <br />
                Explore our menu and add some delicious meals!
              </p>
              <Link href="/menu">
                <Button className="bg-primary hover:bg-primary/90 px-8 min-h-[48px] shadow-lg shadow-primary/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Explore Menu
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column - Checkout Sections */}
            <div className="lg:col-span-8 space-y-4">
              {/* Order Items */}
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </div>
                      Order Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-3 sm:gap-4 p-3 rounded-xl border border-border bg-gradient-to-br from-background to-muted/20"
                      >
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <div
                                  className={`w-3 h-3 border ${
                                    item.isVeg ? "border-green-600" : "border-red-600"
                                  } flex items-center justify-center p-[1px] shrink-0`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.isVeg ? "bg-green-600" : "bg-red-600"
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                  {item.category}
                                </span>
                              </div>
                              <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-1">
                                {item.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatPrice(item.price)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-muted rounded-lg p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background text-muted-foreground hover:text-foreground transition-all"
                                  aria-label="Decrease"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background text-muted-foreground hover:text-foreground transition-all"
                                  aria-label="Increase"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-foreground">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Add More Items */}
              {visibleRecommendedItems.length > 0 && (
                <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Recommended for You
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {visibleRecommendedItems.map((item) => (
                        <div
                          key={item.id}
                          className="group relative rounded-xl border border-border bg-background overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative aspect-square bg-muted">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="(max-width: 640px) 50vw, 200px"
                            />
                            <button
                              onClick={() => handleAddRecommended(item)}
                              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-xs font-bold text-primary mt-0.5">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column - Minimal Order Summary */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-3">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* 1. Order Summary - Total Items */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Order Summary</span>
                      <span className="text-sm text-muted-foreground">{items.reduce((sum, i) => sum + i.quantity, 0)} item{items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? "s" : ""}</span>
                    </div>

                    {/* 2. Bill Details */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Item Total</span>
                        <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                      </div>
                      {gstAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">GST</span>
                          <span className="font-medium text-foreground">{formatPrice(gstAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className={"font-medium " + (deliveryChargeAmount === 0 ? "text-emerald-600" : "text-foreground")}>
                          {deliveryChargeAmount === 0 ? "Free" : formatPrice(deliveryChargeAmount)}
                        </span>
                      </div>
                      {amountToFreeDelivery > 0 && (
                        <p className="text-xs font-medium text-primary bg-primary/5 rounded-lg px-2.5 py-1.5">
                          Add {formatPrice(amountToFreeDelivery)} more for free delivery
                        </p>
                      )}
                      {packagingCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Packaging Fee</span>
                          <span className="font-medium text-foreground">{formatPrice(packagingCharge)}</span>
                        </div>
                      )}
                      {pricingDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-600">Coupon Discount</span>
                          <span className="font-medium text-emerald-600">-{formatPrice(pricingDiscount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Apply Coupon */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <button
                        onClick={() => setCouponOpen(!couponOpen)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Tag className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {appliedCoupon ? `Coupon Applied: ${appliedCoupon.code}` : "Apply Coupon"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {appliedCoupon && couponDiscountAmount > 0
                                ? `Hurrah! You save ${formatPrice(couponDiscountAmount)}`
                                : "View offers and apply coupon"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {appliedCoupon && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleRemoveCoupon();
                              }}
                            >
                              Remove
                            </Button>
                          )}
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              couponOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {couponOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-3 space-y-3">
                              <input
                                value={couponCodeInput}
                                onChange={(e) => {
                                  setCouponCodeInput(e.target.value.toUpperCase());
                                  setCouponError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    void applyCouponByCode(couponCodeInput);
                                  }
                                }}
                                placeholder={isAuthenticated ? "Enter coupon code" : "Sign in at checkout to apply"}
                                disabled={!isAuthenticated}
                                className="w-full rounded-xl border border-border px-3 py-2 text-sm disabled:bg-muted/40 disabled:cursor-not-allowed"
                              />
                              {couponError && (
                                <p className="text-xs font-medium text-destructive">{couponError}</p>
                              )}

                              {appliedCoupon && (
                                <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-3 text-center">
                                  <p className="text-sm font-bold text-emerald-800">
                                    {couponDiscountAmount > 0
                                      ? `Hurrah! You save ${formatPrice(couponDiscountAmount)}`
                                      : `Coupon ${appliedCoupon.code} applied`}
                                  </p>
                                  <p className="mt-0.5 text-xs text-emerald-600">
                                    Coupon <span className="font-semibold">{appliedCoupon.code}</span> applied to your order
                                  </p>
                                </div>
                              )}

                              <p className="text-xs font-medium text-foreground">Available Coupons</p>
                              {!isAuthenticated && availableCoupons.length > 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  Sign in at checkout to apply a coupon.
                                </p>
                              ) : null}
                              {availableCoupons.filter((c) => c.isActive && !c.isComingSoon).length === 0 ? (
                                <p className="text-xs text-muted-foreground">No coupons available at the moment</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {availableCoupons
                                    .filter((c) => c.isActive && !c.isComingSoon)
                                    .map((coupon) => {
                                      const isApplied = appliedCoupon?.id === coupon.id;
                                      const isApplyingThis =
                                        couponApplying &&
                                        applyingCouponCode?.toUpperCase() === coupon.code.toUpperCase();
                                      return (
                                        <div
                                          key={coupon.id}
                                          className={cn(
                                            "flex items-center justify-between gap-3 rounded-xl border-2 p-3 transition-all",
                                            isApplied
                                              ? "border-primary bg-primary/5"
                                              : "border-border",
                                          )}
                                        >
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-foreground">{coupon.code}</p>
                                            <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                            <p className="mt-0.5 text-xs font-semibold text-primary">
                                              {coupon.discount}
                                            </p>
                                            {coupon.minOrder && (
                                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                Min. order {formatPrice(coupon.minOrder)}
                                              </p>
                                            )}
                                          </div>
                                          {isApplied ? (
                                            <span className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                              Applied
                                            </span>
                                          ) : (
                                            <Button
                                              type="button"
                                              size="sm"
                                              className="shrink-0"
                                              disabled={couponApplying || !isAuthenticated}
                                              onClick={() => void applyCouponByCode(coupon.code)}
                                            >
                                              {isApplyingThis ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                "Apply"
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                     <Separator />

                      {/* 4. Total Payable */}
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">Total Payable</span>
                        <span className="text-lg font-bold text-foreground">{formatPrice(grandTotal)}</span>
                      </div>

                     {/* 5. Payment Method */}
                     {isAuthenticated ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedPaymentId("razorpay")}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              selectedPaymentId !== "cod"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                           <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                             selectedPaymentId !== "cod" ? "border-primary" : "border-muted-foreground"
                           }`}>
                             {selectedPaymentId !== "cod" && (
                               <div className="h-2 w-2 rounded-full bg-primary" />
                             )}
                           </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-semibold text-foreground">Pay Online</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">UPI, Cards, Wallets, Net Banking</p>
                            </div>
                          </button>

                          {codEnabled && (
                          <button
                            onClick={() => setSelectedPaymentId("cod")}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              selectedPaymentId === "cod"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                           <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                             selectedPaymentId === "cod" ? "border-primary" : "border-muted-foreground"
                           }`}>
                             {selectedPaymentId === "cod" && (
                               <div className="h-2 w-2 rounded-full bg-primary" />
                             )}
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center gap-2">
                               <Banknote className="h-3.5 w-3.5 text-primary" />
                               <span className="text-sm font-semibold text-foreground">Cash on Delivery</span>
                             </div>
                             <p className="text-xs text-muted-foreground mt-0.5">Pay the delivery partner after receiving your order.</p>
                           </div>
                         </button>
                          )}
                       </div>
                     ) : (
                       <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                         Sign in at checkout to choose payment method and place your order.
                       </p>
                     )}

                     {/* 6. Delivery Type */}
                    <div className="bg-muted/30 rounded-lg px-3 py-2.5 space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Delivery</span>
                        {instantEnabled && scheduledEnabled ? (
                        <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                          <button
                            onClick={() => {
                              setDeliveryMode("QUICK");
                              setSelectedSlot(null);
                            }}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-[3px] transition-all ${
                              deliveryMode === "QUICK"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Instant
                          </button>
                          <button
                            onClick={() => setDeliveryMode("SCHEDULED")}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-[3px] transition-all ${
                              deliveryMode === "SCHEDULED"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Schedule
                          </button>
                        </div>
                        ) : instantEnabled ? (
                          <span className="text-xs font-medium text-foreground">Instant delivery</span>
                        ) : scheduledEnabled ? (
                          <span className="text-xs font-medium text-foreground">Scheduled delivery</span>
                        ) : (
                          <span className="text-xs font-medium text-destructive">Unavailable</span>
                        )}
                      </div>
                      {deliveryMode === "SCHEDULED" && scheduledEnabled && (
                        <DeliverySlotPicker
                          slots={deliverySlots}
                          selectedSlotId={selectedSlot?.id}
                          onSelect={setSelectedSlot}
                          loading={slotsLoading}
                          error={slotsError}
                        />
                      )}
                    </div>

                    {/* 7. Estimated Delivery — instant/quick only */}
                    {deliveryMode === "QUICK" && estimatedTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>
                          Delivery by{" "}
                          <span className="font-medium text-foreground">20–30 mins</span>
                        </span>
                      </div>
                    )}

                     {/* 7. Savings */}
                     {totalSavings > 0 && (
                       <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                         <Flame className="w-4 h-4 shrink-0" />
                         You saved {formatPrice(totalSavings)} on this order
                       </div>
                      )}

                    {belowMinimumOrder && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Minimum order amount is {formatPrice(minimumOrderAmount)}. Add more items to checkout.
                        </AlertDescription>
                      </Alert>
                    )}

                    {deliveryAvailable === false && deliveryMessage && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{deliveryMessage}</AlertDescription>
                      </Alert>
                    )}

                      {/* CTA Button — desktop only; mobile uses floating bar below */}
                      <div className="hidden lg:block space-y-2">
                      <button
                        onClick={handleCtaClick}
                        disabled={getCtaDisabled()}
                        className={cn(
                          "w-full h-12 text-base font-bold shadow-lg rounded-lg transition-all duration-300 text-primary-foreground",
                          isCod
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 animate-pulse"
                            : "bg-primary hover:bg-primary/90 shadow-primary/20",
                          getCtaDisabled() && "opacity-50 cursor-not-allowed"
                        )}
                      >
                       {isProcessing ? (
                         <span className="flex items-center justify-center">
                           <Loader2 className="w-5 h-5 animate-spin" aria-label="Processing payment" />
                         </span>
                       ) : (
                         <span className="flex items-center justify-center gap-2">
                           {getCtaLabel()}
                           <ArrowRight className="w-4 h-4" />
                         </span>
                       )}
                     </button>
                     {!isAuthenticated && items.length > 0 && (
                       <p className="text-center text-[11px] text-muted-foreground">
                         No login needed to browse your cart. You&apos;ll sign in when you pay.
                       </p>
                     )}
                      </div>
                   </div>
                 </div>

                 {/* Delivery Address Section */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {isAuthenticated ? "Delivery Address" : "Delivery Location"}
                      </span>
                    </div>
                    {!isAuthenticated ? (
                      <button
                        onClick={handleOpenAddressFlow}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left group"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {isLocationSet() ? getDisplayName() : "Set delivery location"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isLocationSet()
                              ? pincode
                                ? `Pincode ${pincode} · Sign in at checkout to save address`
                                : "Sign in at checkout to save address and place order"
                              : "Choose where you want your order delivered"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ) : !selectedAddress ? (
                      <button
                        onClick={handleOpenAddressFlow}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left group"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">Add delivery address</p>
                          <p className="text-xs text-muted-foreground">Required to place order</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenAddressFlow}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.03] to-background border border-primary/20 hover:border-primary/40 transition-all text-left group"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">{selectedAddress.addressType}</span>
                            {selectedAddress.isDefault && <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate">{selectedAddress.name} · {selectedAddress.phone}</p>
                          <p className="text-xs text-muted-foreground truncate">{selectedAddress.house}{selectedAddress.apartment && `, ${selectedAddress.apartment}`}{selectedAddress.area && `, ${selectedAddress.area}`} — {selectedAddress.pincode}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                   </div>
                 </div>
               </div>
             </div>
             </div>
          )}
        </div>

        <KitchenUnavailableDialog
        open={kitchenUnavailableOpen}
        onOpenChange={setKitchenUnavailableOpen}
        status={kitchenStatus === "MAINTENANCE" ? "MAINTENANCE" : "CLOSED"}
      />

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onContinue={async () => {
          setProfileModalOpen(false);
          toast.success("Profile updated");
        }}
      />

      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onAddressSelected={handleAddressSelected}
      />

      <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />

      <SuccessModal
        open={successModalOpen}
        onOpenChange={handleSuccessClose}
        orderId={createdOrderId}
        estimatedTime={estimatedTime ?? undefined}
        branchName={branchName ?? undefined}
        onTrackOrder={() => router.push(`/profile?tab=orders${createdOrderId ? `&orderId=${createdOrderId}` : ""}`)}
        onContinueShopping={() => router.push("/menu")}
      />

      {/* Zepto-style floating pay bar — mobile only */}
      {hasHydrated && items.length > 0 && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-4 pt-3 pb-safe">
          <button
            type="button"
            onClick={handleCtaClick}
            disabled={getCtaDisabled()}
            className={cn(
              "w-full h-14 text-base font-bold rounded-2xl shadow-lg transition-all duration-300 text-primary-foreground",
              isCod
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                : "bg-primary hover:bg-primary/90 shadow-primary/25",
              getCtaDisabled() && "opacity-50 cursor-not-allowed",
            )}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" aria-label="Processing payment" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {getCtaLabel()}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

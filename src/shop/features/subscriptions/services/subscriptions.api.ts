import { apiClient } from "@shop/lib/api/client";
import type {
  CustomerSubscription,
  CreateSubscriptionResult,
  SubscriptionCheckoutSession,
  SubscriptionDelivery,
  SubscriptionDeliveryStatus,
  SubscriptionMenuItem,
  SubscriptionPlan,
  GroupedSubscriptionPlans,
  PendingSubscriptionResult,
  PlanChangeQuote,
  PlanChangeResult,
} from "../types/subscription";
import type {
  MealSlotCatalogue,
  MealSlotQuote,
  PlanMealBundle,
  PlanMealSlot,
  SubscriptionPackage,
  WeeklySchedulePreview,
  PackagePreviewMenuResponse,
  WeeklyMenuOverride,
} from "../types/package";

export const subscriptionsApi = {
  async listPlans(): Promise<GroupedSubscriptionPlans> {
    const { data } = await apiClient.get("/subscriptions/plans");
    const payload = data?.data;
    // Backward compat: flat array from older API
    if (Array.isArray(payload)) {
      const all = payload as SubscriptionPlan[];
      return {
        weekly: all.filter((p) => (p.billingCycle ?? p.type) === "WEEKLY"),
        monthly: all.filter((p) => (p.billingCycle ?? p.type) === "MONTHLY"),
        all,
      };
    }
    return (payload ?? { weekly: [], monthly: [], all: [] }) as GroupedSubscriptionPlans;
  },

  async listMenuItems(): Promise<SubscriptionMenuItem[]> {
    const { data } = await apiClient.get("/subscriptions/menu-items");
    return (data?.data ?? []) as SubscriptionMenuItem[];
  },

  async listMenuItemsByPlan(planId: string): Promise<SubscriptionMenuItem[]> {
    const { data } = await apiClient.get(`/subscriptions/menu-items/by-plan/${planId}`);
    return (data?.data ?? []) as SubscriptionMenuItem[];
  },

  async mine(): Promise<CustomerSubscription[]> {
    const { data } = await apiClient.get("/subscriptions");
    return (data?.data ?? []) as CustomerSubscription[];
  },

  async getById(id: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.get(`/subscriptions/${id}`);
    return (data?.data ?? data) as CustomerSubscription;
  },

  async getCheckout(subscriptionId: string): Promise<SubscriptionCheckoutSession> {
    const { data } = await apiClient.get(`/subscriptions/subscription-checkout/${subscriptionId}`);
    return (data?.data ?? data) as SubscriptionCheckoutSession;
  },

  async getPendingForPlan(planId: string): Promise<PendingSubscriptionResult | null> {
    const { data } = await apiClient.get(`/subscriptions/pending/${planId}`);
    return (data?.data ?? null) as PendingSubscriptionResult | null;
  },

  async cancelPending(id: string, reason?: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/cancel-pending`, { reason });
    return (data?.data ?? data) as CustomerSubscription;
  },

  async create(dto: {
    planId: string;
    addressId: string;
    deliverySlotId: string;
    deliverySlotIds?: string[];
    startDate: string;
    items: Array<{ subscriptionMenuItemId: string; quantity: number }>;
    branchId?: string;
    autoRenew?: boolean;
    paymentMethod?: "ONLINE";
  }): Promise<CreateSubscriptionResult> {
    const { data } = await apiClient.post("/subscriptions", dto);
    return (data?.data ?? data) as CreateSubscriptionResult;
  },

  async getDeliveries(id: string, from?: string, to?: string): Promise<SubscriptionDelivery[]> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await apiClient.get(`/subscriptions/${id}/deliveries`, { params });
    return (data?.data ?? []) as SubscriptionDelivery[];
  },

  async pause(id: string, reason?: string, untilDate?: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/pause`, { reason, untilDate });
    return (data?.data ?? data) as CustomerSubscription;
  },

  async resume(id: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/resume`);
    return (data?.data ?? data) as CustomerSubscription;
  },

  async skip(id: string, deliveryDate: string, reason?: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/skip`, { deliveryDate, reason });
    return (data?.data ?? data) as CustomerSubscription;
  },

  async changeSlot(
    id: string,
    payload: { deliverySlotId?: string; deliverySlotIds?: string[]; effectiveFrom?: string },
  ): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/change-slot`, payload);
    return (data?.data ?? data) as CustomerSubscription;
  },

  async changeAddress(id: string, addressId: string, effectiveFrom?: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/change-address`, { addressId, effectiveFrom });
    return (data?.data ?? data) as CustomerSubscription;
  },

  async cancel(id: string, reason?: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/cancel`, { reason });
    return (data?.data ?? data) as CustomerSubscription;
  },

  async revokeCancel(id: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/revoke-cancel`);
    return (data?.data ?? data) as CustomerSubscription;
  },

  async renew(id: string): Promise<CustomerSubscription> {
    const { data } = await apiClient.post(`/subscriptions/${id}/renew`);
    return (data?.data ?? data) as CustomerSubscription;
  },

  async quotePlanChange(
    id: string,
    dto: {
      targetPlanId: string;
      packageCategoryIds?: string[];
      deliverySlotIds?: string[];
      deliverySlotCount?: number;
      autoRenew?: boolean;
    },
  ): Promise<PlanChangeQuote> {
    const { data } = await apiClient.post(`/subscriptions/${id}/change-plan/quote`, dto);
    return (data?.data ?? data) as PlanChangeQuote;
  },

  async changePlan(
    id: string,
    dto: {
      targetPlanId: string;
      packageCategoryIds?: string[];
      deliverySlotIds?: string[];
      deliverySlotCount?: number;
      autoRenew?: boolean;
    },
  ): Promise<PlanChangeResult> {
    const { data } = await apiClient.post(`/subscriptions/${id}/change-plan`, dto);
    return (data?.data ?? data) as PlanChangeResult;
  },

  async listPackages(): Promise<SubscriptionPackage[]> {
    const { data } = await apiClient.get("/subscriptions/packages");
    return (data?.data ?? []) as SubscriptionPackage[];
  },

  async getPackageById(packageId: string): Promise<SubscriptionPackage> {
    const { data } = await apiClient.get(`/subscription-packages/${packageId}`);
    const detail = (data?.data ?? data) as SubscriptionPackage;
    return {
      ...detail,
      categories: detail.categories ?? [],
    };
  },

  async getMealCatalogue(packageId: string): Promise<MealSlotCatalogue> {
    const { data } = await apiClient.get(`/subscriptions/packages/${packageId}/meal-catalogue`);
    const payload = (data?.data ?? data ?? {}) as {
      mealSlots?: PlanMealSlot[];
      bundles?: PlanMealBundle[];
    };
    return {
      mealSlots: payload.mealSlots ?? [],
      bundles: payload.bundles ?? [],
    };
  },

  async getWeeklySchedule(packageId: string): Promise<WeeklySchedulePreview | null> {
    try {
      const { data } = await apiClient.get(`/subscriptions/packages/${packageId}/weekly-schedule`);
      return (data?.data ?? data ?? null) as WeeklySchedulePreview | null;
    } catch {
      return null;
    }
  },

  async getPackagePreviewMenu(
    packageId: string,
    day: string,
    mealSlotId: string,
  ): Promise<PackagePreviewMenuResponse> {
    const { data } = await apiClient.get(`/subscriptions/packages/${packageId}/preview-menu`, {
      params: { day: day.trim().toLowerCase(), mealSlotId },
    });
    return (data?.data ?? data) as PackagePreviewMenuResponse;
  },

  async quoteMealSlots(dto: {
    packageId: string;
    mealSlotIds: string[];
    bundleId?: string | null;
    durationOptionId?: string | null;
  }): Promise<MealSlotQuote> {
    const { data } = await apiClient.post("/subscriptions/quote/meal-slots", dto);
    return data?.data as MealSlotQuote;
  },

  async quotePrice(
    packageId: string,
    packageCategoryIds: string[],
    deliverySlotCount = 1,
  ) {
    const { data } = await apiClient.post("/subscriptions/quote", {
      packageId,
      packageCategoryIds,
      deliverySlotCount,
    });
    return data?.data as {
      originalPrice: number;
      finalPrice: number;
      savingsAmount: number;
      priceLabel: string;
      categories: Array<{ packageCategoryId: string; category: string; categoryPrice: number }>;
    };
  },

  async createWithCategories(dto: {
    packageId: string;
    addressId: string;
    deliverySlotId?: string;
    deliverySlotIds?: string[];
    selectedDeliveryDays?: string[];
    packageCategoryIds?: string[];
    mealSlotIds?: string[];
    bundleId?: string | null;
    durationOptionId?: string | null;
    startDate: string;
    branchId?: string;
    autoRenew?: boolean;
    weeklyMenuOverrides?: WeeklyMenuOverride[];
  }): Promise<CreateSubscriptionResult> {
    const { data } = await apiClient.post("/subscriptions", dto);
    return (data?.data ?? data) as CreateSubscriptionResult;
  },

  async getUpcomingDeliveries(subscriptionId: string, date?: string) {
    const { data } = await apiClient.get(`/subscriptions/${subscriptionId}/upcoming-deliveries`, {
      params: date ? { date } : undefined,
    });
    return (data?.data ?? []) as Array<{
      deliveryId: string;
      deliveryDate: string;
      status: SubscriptionDeliveryStatus;
      slot: { id: string; name: string; startTime: string; endTime: string } | null;
      selectionStatus: string;
      selectionDeadline: string;
      selectionLocked: boolean;
      selectionLockedLabel: string | null;
      selectedItems: Array<{ menuItemId: string; menuItemNameSnapshot: string; category: string; quantity: number }>;
      menuOptions: Array<{
        menuItemId: string;
        name: string;
        category: string;
        categoryLabel?: string;
        includedQuantityPerDelivery: number;
        maximumQuantityPerDelivery: number;
        allowsMultipleItemSelection?: boolean;
        maximumChoicesPerDelivery?: number | null;
      }>;
    }>;
  },

  async getDeliveryMenu(subscriptionId: string, deliveryId: string) {
    const { data } = await apiClient.get(
      `/subscriptions/${subscriptionId}/deliveries/${deliveryId}/menu`,
    );
    return data?.data;
  },

  async saveDeliveryMenu(
    subscriptionId: string,
    deliveryId: string,
    items: Array<{ menuItemId: string; quantity: number }>,
  ) {
    const { data } = await apiClient.put(
      `/subscriptions/${subscriptionId}/deliveries/${deliveryId}/menu`,
      { items },
    );
    return data?.data;
  },

  async initiatePayment(
    subscriptionId: string,
    checkoutSessionId: string,
  ): Promise<{
    paymentId: string;
    paymentReference: string;
    razorpaySubscriptionId: string;
    razorpayKeyId?: string;
    amount: number;
    currency: string;
  }> {
    const { data } = await apiClient.post(`/subscriptions/${subscriptionId}/payment/initiate`, {
      checkoutSessionId,
    });
    return (data?.data ?? data) as {
      paymentId: string;
      paymentReference: string;
      razorpaySubscriptionId: string;
      razorpayKeyId?: string;
      amount: number;
      currency: string;
    };
  },

  async verifyPayment(
    subscriptionId: string,
    dto: {
      checkoutSessionId: string;
      razorpaySubscriptionId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ): Promise<{ paymentId: string; subscriptionId: string; status: string }> {
    const { data } = await apiClient.post(`/subscriptions/${subscriptionId}/payment/verify`, dto);
    return (data?.data ?? data) as { paymentId: string; subscriptionId: string; status: string };
  },
};

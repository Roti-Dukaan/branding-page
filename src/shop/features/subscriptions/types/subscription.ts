export type SubscriptionPlanType = "WEEKLY" | "MONTHLY";

export const PLAN_TYPE_LABELS: Record<SubscriptionPlanType, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type SubscriptionDeliveryStatus =
  | "GENERATED"
  | "CONFIRMED"
  | "IN_KITCHEN"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "SKIPPED"
  | "PAUSED"
  | "CANCELLED";

export type RotiType = "JOWAR" | "RAGI" | "WHEAT" | "OTHERS";

export const ROTI_TYPE_LABELS: Record<RotiType, string> = {
  JOWAR: "Jowar",
  RAGI: "Ragi",
  WHEAT: "Wheat",
  OTHERS: "Others",
};

export interface SubscriptionMenuItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  rotiType: RotiType;
  description?: string | null;
  image?: string | null;
  active: boolean;
  subscriptionEnabled: boolean;
  defaultQty: number;
  sortOrder: number;
  kitchenLabel?: string | null;
  planLink?: {
    id: string;
    sortOrder: number;
    isDefault: boolean;
    maxQtyPerDelivery?: number | null;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  type: SubscriptionPlanType;
  billingCycle: SubscriptionPlanType;
  price: number | string;
  originalPrice: number;
  finalPrice: number;
  savingsAmount: number;
  discountType?: "FLAT" | "PERCENTAGE" | "NONE";
  discountValue?: number;
  discountLabel?: string | null;
  isDiscountActive?: boolean;
  validityDays: number;
  deliveriesPerCycle: number;
  itemRules?: {
    rotisPerDelivery?: number;
    maxItems?: number;
    maxRotiTypes?: number;
    allowedFoodItemIds?: string[];
  } | null;
  isActive: boolean;
  displayOrder: number;
  badge?: string | null;
  skipEnabled?: boolean;
  skipLimitDisplay?: string;
  razorpayPlanId?: string | null;
}

export interface GroupedSubscriptionPlans {
  weekly: SubscriptionPlan[];
  monthly: SubscriptionPlan[];
  all: SubscriptionPlan[];
}

export interface SubscriptionItem {
  id: string;
  subscriptionMenuItemId?: string | null;
  foodItemId?: string | null;
  quantity: number;
  nameSnapshot?: string | null;
  rotiTypeSnapshot?: RotiType | null;
  kitchenLabelSnapshot?: string | null;
  subscriptionMenuItem?: { id: string; name: string; image?: string | null; rotiType?: RotiType };
  foodItem?: { id: string; name: string; imageUrl?: string | null };
}

export interface SubscriptionDelivery {
  id: string;
  deliveryNumber?: string;
  deliveryDate: string;
  status: SubscriptionDeliveryStatus;
  slotSnapshot?: Record<string, unknown>;
  addressSnapshot?: Record<string, unknown>;
  itemsSnapshot?: Array<{
    subscriptionMenuItemId?: string;
    foodItemId?: string;
    name?: string;
    rotiType?: RotiType;
    kitchenLabel?: string;
    quantity: number;
  }>;
}

export interface CustomerSubscription {
  id: string;
  subscriptionNumber?: string;
  customerId: string;
  planId: string;
  addressId?: string;
  deliverySlotId?: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  pricePaid?: number | string | null;
  autoRenew: boolean;
  razorpaySubscriptionId?: string | null;
  plan?: SubscriptionPlan;
  planSnapshot?: Record<string, unknown> | null;
  items?: SubscriptionItem[];
  deliverySlot?: { id: string; name: string; startTime: string; endTime: string };
  address?: {
    id?: string;
    houseNumber?: string;
    house?: string;
    apartment?: string | null;
    street?: string;
    area?: string;
    landmark?: string | null;
    city?: string;
    state?: string;
    pincode?: string;
    phoneNumber?: string;
    phone?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  deliveries?: SubscriptionDelivery[];
  pausedAt?: string | null;
  pausedReason?: string | null;
  pausedUntil?: string | null;
  scheduledPlanId?: string | null;
  scheduledChangeAt?: string | null;
  scheduledCancelAt?: string | null;
  cancelReason?: string | null;
}

export type PlanChangeType = "UPGRADE" | "DOWNGRADE" | "SAME";

export interface PlanChangeQuote {
  changeType: PlanChangeType;
  currentPlanId: string;
  currentPlanName: string;
  targetPlanId: string;
  targetPlanName: string;
  currentCyclePrice: number;
  newCyclePrice: number;
  newProratedPrice: number;
  remainingCredit: number;
  amountDue: number;
  remainingDeliveries: number;
  totalDeliveries: number;
  effectiveAt: string;
  immediate: boolean;
}

export interface PlanChangeResult {
  changeType: PlanChangeType;
  amountDue: number;
  checkoutSessionId?: string;
  checkoutReference?: string;
  grandTotal?: number;
  expiresAt?: string;
  effectiveAt?: string;
  scheduled?: boolean;
  immediate?: boolean;
  quote?: PlanChangeQuote;
  subscription?: CustomerSubscription;
}

export interface SubscriptionCheckoutSession {
  id: string;
  paymentMethod: "ONLINE" | "COD" | string;
  grandTotal: number | string;
  currency?: string;
  pricingSnapshot?: {
    planPrice?: number;
    planName?: string;
    planLine?: { name: string; amount: number };
    items?: Array<{ name: string; quantity: number; lineTotal: number }>;
    subtotalAmount?: number;
    deliveryCharge?: number;
    discountAmount?: number;
    frozenAt?: string;
  };
}

export interface CreateSubscriptionResult {
  subscription: CustomerSubscription;
  checkoutSessionId: string;
  checkoutReference: string;
  grandTotal: number;
  expiresAt: string;
  resumed?: boolean;
}

export interface PendingSubscriptionResult {
  subscription: CustomerSubscription;
  checkoutSessionId: string;
  checkoutReference: string;
  grandTotal: number;
  expiresAt: string;
  resumed: boolean;
}

export interface SubscriptionLifecycleLog {
  id: string;
  action: string;
  reason?: string | null;
  fromDate?: string | null;
  createdAt: string;
}

export const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
  PAUSED: { label: "Paused", className: "bg-amber-100 text-amber-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-800" },
  EXPIRED: { label: "Expired", className: "bg-gray-100 text-gray-600" },
};

export const DELIVERY_STATUS_CONFIG: Record<SubscriptionDeliveryStatus, { label: string; className: string }> = {
  GENERATED: { label: "Scheduled", className: "bg-slate-100 text-slate-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  IN_KITCHEN: { label: "In kitchen", className: "bg-orange-100 text-orange-800" },
  PACKED: { label: "Packed", className: "bg-purple-100 text-purple-800" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", className: "bg-indigo-100 text-indigo-800" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
  SKIPPED: { label: "Skipped", className: "bg-gray-100 text-gray-500" },
  PAUSED: { label: "Paused", className: "bg-amber-100 text-amber-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

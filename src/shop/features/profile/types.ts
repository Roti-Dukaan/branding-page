import { CartItem, DeliveryAddress } from "@shop/lib/types";

export type { DeliveryAddress } from "@shop/lib/types";

export type ProfileTab =
  | "account"
  | "profile"
  | "addresses"
  | "orders"
  | "order-detail"
  | "order-history"
  | "payments"
  | "billing"
  | "subscriptions"
  | "favorites"
  | "offers"
  | "support"
  | "support-new"
  | "support-detail";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  language: string;
  avatar?: string;
}

export type OrderStatus =
  | "preparing"
  | "packed"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  deliverySlot: { id: string; label: string; time: string };
  paymentMethod: "online" | "cod";
  subtotal: number;
  deliveryCharge: number;
  platformFee: number;
  tax: number;
  total: number;
}

export interface FavoriteItem {
  menuItemId: string;
  addedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  minOrder?: number;
  expiryDate?: string;
  isActive: boolean;
  isComingSoon?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "subscription" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface ProfileSettings {
  darkMode: boolean;
  orderNotifications: boolean;
  promotionalNotifications: boolean;
  subscriptionReminders: boolean;
}

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export interface UserSubscription {
  planId: string;
  planName: string;
  billingCycle: "weekly" | "monthly";
  deliveryTime: "morning" | "afternoon" | "evening";
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  price: number;
  // Delivery management summary fields (optional to stay backward compatible)
  nextDelivery?: string;
  remainingDeliveries?: number;
  endDate?: string;
  pausedUntil?: string;
  daysPaused?: number;
  newEndDate?: string;
}

export type SubscriptionDeliveryStatus =
  | "scheduled"
  | "paused"
  | "delivered"
  | "cancelled"
  | "skipped";

export interface DeliveryCalendarEntry {
  date: string; // yyyy-mm-dd
  status: SubscriptionDeliveryStatus;
  meal: string;
  address?: DeliveryAddress;
}

export type SubscriptionTimelineType =
  | "created"
  | "paused"
  | "resumed"
  | "skipped"
  | "address-changed"
  | "renewed"
  | "completed";

export interface SubscriptionTimelineEvent {
  id: string;
  type: SubscriptionTimelineType;
  label: string;
  timestamp: string; // ISO
  description?: string;
}

export type PauseReason = "vacation" | "out-of-town" | "medical" | "other";

export interface PauseSubscriptionInput {
  from: string; // yyyy-mm-dd
  until: string; // yyyy-mm-dd
  reason?: PauseReason;
}

export interface SkipDeliveryInput {
  date: string; // yyyy-mm-dd
}

export interface ChangeDeliveryAddressInput {
  date: string; // yyyy-mm-dd (delivery to change)
  addressId: string;
}

export interface SubscriptionManagementState {
  status: SubscriptionStatus;
  nextDelivery: string;
  remainingDeliveries: number;
  endDate: string;
  pausedUntil?: string;
  daysPaused?: number;
  newEndDate?: string;
}

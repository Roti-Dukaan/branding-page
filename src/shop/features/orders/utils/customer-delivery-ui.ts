import { formatDisplayDate } from "@shop/lib/date";
import { formatDeliverySlotLabel } from "@shop/lib/delivery-slot-display";
import type {
  DeliveryOrderItem,
  DeliveryStatus,
  DeliveryTimelineEntry,
  DeliveryTracking,
} from "../types/delivery";
import {
  CUSTOMER_ETA_DELIVERING_MESSAGE,
  CUSTOMER_ETA_RANGE_LABEL,
  getEtaMinutes,
} from "./delivery-eta";

/** Customer-visible journey — never expose rider/provider assignment states. */
export type CustomerDeliveryStepId =
  | "pending"
  | "preparing"
  | "ready_for_pickup"
  | "on_the_way"
  | "arrived"
  | "delivered";

export const CUSTOMER_DELIVERY_STEPS: Array<{
  id: CustomerDeliveryStepId;
  label: string;
  description: string;
}> = [
  {
    id: "pending",
    label: "Order placed",
    description: "We have received your order.",
  },
  {
    id: "preparing",
    label: "Order preparing",
    description: "Our kitchen is preparing your order.",
  },
  {
    id: "ready_for_pickup",
    label: "Ready for pickup",
    description: "Your order is packed and ready for pickup.",
  },
  {
    id: "on_the_way",
    label: "On the way",
    description: "Your order is heading to you.",
  },
  {
    id: "arrived",
    label: "Rider arrived",
    description: "Your delivery partner has reached your location.",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Enjoy your meal!",
  },
];

const ON_THE_WAY_STATUSES: DeliveryStatus[] = [
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
];

const PREPARING_STATUSES: DeliveryStatus[] = [
  "WAITING_FOR_KITCHEN",
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
  "PROVIDER_ASSIGNED",
  "RIDER_ARRIVING",
  "RIDER_ARRIVED",
  "AWAITING_PICKUP",
];

const PICKUP_READY_DELIVERY_STATUSES: DeliveryStatus[] = [
  "AWAITING_PICKUP",
  "RIDER_ARRIVED",
];

const PENDING_ORDER_STATUSES = new Set([
  "PENDING_CONFIRMATION",
  "PENDING",
]);

const ON_THE_WAY_ORDER_STATUSES = new Set([
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
]);

const DEFAULT_PREP_MINUTES = 20;
const DEFAULT_TRAVEL_MINUTES = 25;
const MAX_REASONABLE_ETA_MINUTES = 90;
const TERMINAL_ORDER_STATUSES = new Set(["DELIVERED", "CANCELLED", "FAILED", "REFUNDED"]);

export function isTerminalDelivery(delivery: DeliveryTracking): boolean {
  if (["DELIVERED", "FAILED", "CANCELLED"].includes(delivery.status)) return true;
  const orderStatus = delivery.order?.status;
  return !!orderStatus && TERMINAL_ORDER_STATUSES.has(orderStatus);
}

export function isScheduledDelivery(delivery: DeliveryTracking): boolean {
  return delivery.deliveryType === "SCHEDULED" || delivery.order?.deliveryType === "SCHEDULED";
}

export function formatScheduledDeliveryMessage(delivery: DeliveryTracking): string {
  const slot = delivery.order?.deliverySlot;
  const orderDate = delivery.order?.createdAt ?? delivery.createdAt;

  if (!slot) {
    return "Scheduled delivery — we'll confirm your slot soon";
  }

  const dateLabel = formatDisplayDate(orderDate);
  const timeLabel = formatDeliverySlotLabel(slot.startTime, slot.endTime);
  return `Scheduled for ${dateLabel}, ${timeLabel}`;
}

export function getCustomerEtaLabel(delivery: DeliveryTracking): string {
  const { status } = delivery;
  const orderStatus = delivery.order?.status;

  if (status === "DELIVERED" || orderStatus === "DELIVERED") return "Delivery status";
  if (
    status === "FAILED"
    || status === "CANCELLED"
    || orderStatus === "CANCELLED"
    || orderStatus === "FAILED"
    || orderStatus === "REFUNDED"
  ) {
    return "Status";
  }
  if (isScheduledDelivery(delivery)) return "Scheduled delivery";
  return "Delivery estimate";
}

function isReadyForPickup(status: DeliveryStatus, orderStatus?: string): boolean {
  if (orderStatus === "READY_FOR_PICKUP") return true;
  return PICKUP_READY_DELIVERY_STATUSES.includes(status);
}

export function formatOrderItemNames(items?: DeliveryOrderItem[]): string | null {
  const names = (items ?? [])
    .map((item) => item.foodNameSnapshot?.trim())
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function formatPreparingMessage(items?: DeliveryOrderItem[]): string {
  const names = formatOrderItemNames(items);
  if (!names) return "Our kitchen is preparing your order.";
  return `Our kitchen is preparing your ${names}.`;
}

export function formatReadyForPickupMessage(items?: DeliveryOrderItem[]): string {
  const names = formatOrderItemNames(items);
  if (!names) return "Your order is packed and ready for pickup.";
  const itemCount = (items ?? []).filter((item) => item.foodNameSnapshot?.trim()).length;
  const verb = itemCount > 1 ? "are" : "is";
  return `Your ${names} ${verb} packed and ready for pickup.`;
}

function getStepDescription(
  stepId: CustomerDeliveryStepId,
  delivery: DeliveryTracking,
): string {
  if (stepId === "preparing") {
    return formatPreparingMessage(delivery.order?.items);
  }
  if (stepId === "ready_for_pickup") {
    return formatReadyForPickupMessage(delivery.order?.items);
  }
  return CUSTOMER_DELIVERY_STEPS.find((s) => s.id === stepId)?.description ?? "";
}

export function getCustomerStepId(
  status: DeliveryStatus,
  orderStatus?: string,
): CustomerDeliveryStepId {
  if (status === "DELIVERED" || orderStatus === "DELIVERED") return "delivered";
  if (status === "NEAR_CUSTOMER") return "arrived";
  if (
    ON_THE_WAY_STATUSES.includes(status)
    || (orderStatus && ON_THE_WAY_ORDER_STATUSES.has(orderStatus))
  ) {
    return "on_the_way";
  }
  if (isReadyForPickup(status, orderStatus)) return "ready_for_pickup";
  if (PREPARING_STATUSES.includes(status)) {
    if (orderStatus && PENDING_ORDER_STATUSES.has(orderStatus)) return "pending";
    return "preparing";
  }
  if (orderStatus === "PREPARING" || orderStatus === "ACCEPTED" || orderStatus === "CONFIRMED") {
    return "preparing";
  }
  if (orderStatus && PENDING_ORDER_STATUSES.has(orderStatus)) return "pending";
  return "preparing";
}

export function getCustomerStepIndex(stepId: CustomerDeliveryStepId): number {
  return CUSTOMER_DELIVERY_STEPS.findIndex((s) => s.id === stepId);
}

export function getCustomerStatusLabel(
  status: DeliveryStatus,
  orderStatus?: string,
): string {
  const stepId = getCustomerStepId(status, orderStatus);
  const step = CUSTOMER_DELIVERY_STEPS.find((s) => s.id === stepId);
  return step?.label ?? "Order preparing";
}

export function getCustomerStatusDescription(
  status: DeliveryStatus,
  orderStatus?: string,
  items?: DeliveryOrderItem[],
): string {
  const stepId = getCustomerStepId(status, orderStatus);
  if (stepId === "preparing") return formatPreparingMessage(items);
  if (stepId === "ready_for_pickup") return formatReadyForPickupMessage(items);
  return CUSTOMER_DELIVERY_STEPS.find((s) => s.id === stepId)?.description ?? "";
}

/** Hide provider/rider timeline noise; show the customer journey only. */
export function buildCustomerTimeline(
  delivery: DeliveryTracking,
): Array<{
  id: string;
  stepId: CustomerDeliveryStepId;
  label: string;
  description: string;
  timestamp?: string;
}> {
  const currentStep = getCustomerStepId(delivery.status, delivery.order?.status);
  const currentIndex = getCustomerStepIndex(currentStep);
  const rawTimeline = delivery.timeline ?? [];

  const timestampForStep = (stepId: CustomerDeliveryStepId): string | undefined => {
    if (stepId === "pending") {
      return delivery.order?.createdAt ?? delivery.createdAt;
    }
    if (stepId === "preparing") {
      const kitchen = rawTimeline.find((e) => e.status === "WAITING_FOR_KITCHEN");
      return kitchen?.timestamp ?? delivery.order?.createdAt ?? delivery.createdAt;
    }
    if (stepId === "ready_for_pickup") {
      const pickupReady = rawTimeline.find((e) =>
        ["AWAITING_PICKUP", "RIDER_ARRIVED", "WAITING_FOR_PROVIDER"].includes(e.status),
      );
      return pickupReady?.timestamp ?? delivery.updatedAt;
    }
    if (stepId === "on_the_way") {
      const picked = rawTimeline.find((e) =>
        ["PICKED_UP", "OUT_FOR_DELIVERY"].includes(e.status),
      );
      return picked?.timestamp ?? delivery.actualPickupAt;
    }
    if (stepId === "arrived") {
      const near = rawTimeline.find((e) => e.status === "NEAR_CUSTOMER");
      return near?.timestamp ?? delivery.updatedAt;
    }
    if (stepId === "delivered") {
      return delivery.actualDeliveryAt ?? rawTimeline.find((e) => e.status === "DELIVERED")?.timestamp;
    }
    return undefined;
  };

  return CUSTOMER_DELIVERY_STEPS.map((step, index) => ({
    id: step.id,
    stepId: step.id,
    label: step.label,
    description: getStepDescription(step.id, delivery),
    timestamp: index <= currentIndex ? timestampForStep(step.id) : undefined,
  }));
}

export function computeCustomerEtaMinutes(delivery: DeliveryTracking): number | null {
  if (isTerminalDelivery(delivery)) return null;
  if (isScheduledDelivery(delivery)) return null;

  const { status } = delivery;
  const orderStatus = delivery.order?.status;

  const order = delivery.order;
  const prepMinutes = order?.estimatedPreparationTime ?? DEFAULT_PREP_MINUTES;
  const travelMinutes = order?.estimatedDeliveryTime ?? DEFAULT_TRAVEL_MINUTES;
  const createdAt = new Date(order?.createdAt ?? delivery.createdAt);
  const elapsedMinutes = Math.max(0, (Date.now() - createdAt.getTime()) / 60_000);

  const providerEta = getEtaMinutes(delivery.estimatedDeliveryAt);
  const providerEtaReasonable =
    providerEta !== null && providerEta > 0 && providerEta <= MAX_REASONABLE_ETA_MINUTES;

  if (ON_THE_WAY_STATUSES.includes(status)) {
    if (providerEtaReasonable) return providerEta;
    if (delivery.actualPickupAt) {
      const sincePickup = (Date.now() - new Date(delivery.actualPickupAt).getTime()) / 60_000;
      return Math.max(5, Math.ceil(travelMinutes - sincePickup));
    }
    return Math.max(10, Math.ceil(travelMinutes * 0.65));
  }

  if (isReadyForPickup(status, orderStatus)) {
    if (providerEtaReasonable) return providerEta;
    return Math.max(10, Math.ceil(travelMinutes));
  }

  if (PREPARING_STATUSES.includes(status) || status === "WAITING_FOR_KITCHEN") {
    const prepRemaining = Math.max(0, prepMinutes - elapsedMinutes);
    const total = prepRemaining + travelMinutes;
    if (providerEtaReasonable && providerEta < total) return providerEta;
    return Math.max(10, Math.ceil(total));
  }

  if (providerEtaReasonable) return providerEta;
  return Math.max(10, Math.ceil(prepMinutes + travelMinutes - elapsedMinutes));
}

export function formatCustomerEtaMessage(delivery: DeliveryTracking): string {
  const { status } = delivery;
  const orderStatus = delivery.order?.status;

  if (status === "DELIVERED" || orderStatus === "DELIVERED") return "Delivered";
  if (status === "FAILED" || orderStatus === "FAILED") return "Delivery could not be completed";
  if (status === "CANCELLED" || orderStatus === "CANCELLED" || orderStatus === "REFUNDED") {
    return "Delivery cancelled";
  }
  if (status === "NEAR_CUSTOMER") return "Your rider is nearby";
  if (isReadyForPickup(status, orderStatus)) return "Ready for pickup";
  if (isScheduledDelivery(delivery)) return formatScheduledDeliveryMessage(delivery);

  if (isScheduledDelivery(delivery)) return formatScheduledDeliveryMessage(delivery);

  return CUSTOMER_ETA_DELIVERING_MESSAGE;
}

export { CUSTOMER_ETA_RANGE_LABEL, CUSTOMER_ETA_DELIVERING_MESSAGE };

/** @deprecated Raw timeline entries may contain provider-specific statuses. */
export function sanitizeTimelineForCustomer(
  timeline: DeliveryTimelineEntry[],
): DeliveryTimelineEntry[] {
  return timeline.filter(
    (entry) => !["WAITING_FOR_PROVIDER", "PROVIDER_ASSIGNMENT_FAILED", "PROVIDER_ASSIGNED", "RIDER_ARRIVING", "RIDER_ARRIVED"].includes(entry.status),
  );
}

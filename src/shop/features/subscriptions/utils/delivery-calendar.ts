import { dateKeyFromIso } from "@shop/lib/date";
import type { SubscriptionDeliveryStatus as CalendarStatus } from "@shop/features/profile/types";
import type { SubscriptionDelivery, SubscriptionDeliveryStatus } from "../types/subscription";

export function toCalendarDeliveryStatus(
  status: SubscriptionDeliveryStatus,
): CalendarStatus {
  switch (status) {
    case "DELIVERED":
      return "delivered";
    case "SKIPPED":
      return "skipped";
    case "PAUSED":
      return "paused";
    case "CANCELLED":
      return "cancelled";
    default:
      return "scheduled";
  }
}

export function buildDeliveryStatusMap(
  deliveries: SubscriptionDelivery[],
): Record<string, CalendarStatus> {
  const map: Record<string, CalendarStatus> = {};
  for (const delivery of deliveries) {
    map[dateKeyFromIso(delivery.deliveryDate)] = toCalendarDeliveryStatus(delivery.status);
  }
  return map;
}

/** Matches backend skip eligibility in subscription-lifecycle.service */
export function canSkipDelivery(status: SubscriptionDeliveryStatus): boolean {
  return ![
    "DELIVERED",
    "OUT_FOR_DELIVERY",
    "PACKED",
    "IN_KITCHEN",
    "SKIPPED",
    "CANCELLED",
  ].includes(status);
}

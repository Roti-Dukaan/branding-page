import type { DeliveryStatus } from "../types/delivery";

/** Standard customer-facing delivery window shown across the app. */
export const CUSTOMER_ETA_RANGE_LABEL = "20 to 30 mins";
export const CUSTOMER_ETA_DELIVERING_MESSAGE = `Delivering in ${CUSTOMER_ETA_RANGE_LABEL}`;

export function getEtaMinutes(estimatedAt?: string | null): number | null {
  if (!estimatedAt) return null;
  const target = new Date(estimatedAt);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 60_000);
}

const TERMINAL_STATUSES: DeliveryStatus[] = ["DELIVERED", "FAILED", "CANCELLED"];

const STATUS_ETA_FALLBACK: Partial<Record<DeliveryStatus, string>> = {
  WAITING_FOR_KITCHEN: "Preparing your order",
  WAITING_FOR_PROVIDER: "Preparing your order",
  PROVIDER_ASSIGNMENT_FAILED: "Preparing your order",
  PROVIDER_ASSIGNED: "Preparing your order",
  RIDER_ARRIVING: "Preparing your order",
  RIDER_ARRIVED: "Preparing your order",
  AWAITING_PICKUP: "Preparing your order",
  PICKED_UP: "Your order is on the way",
  OUT_FOR_DELIVERY: "Your order is on the way",
  NEAR_CUSTOMER: "Your rider is nearby",
  DELIVERED: "Delivered",
  FAILED: "Delivery could not be completed",
  CANCELLED: "Delivery cancelled",
};

export function getEtaMessage(
  estimatedAt?: string | null,
  status?: DeliveryStatus,
): string {
  if (status && TERMINAL_STATUSES.includes(status)) {
    return STATUS_ETA_FALLBACK[status]!;
  }

  if (status && !TERMINAL_STATUSES.includes(status)) {
    return CUSTOMER_ETA_DELIVERING_MESSAGE;
  }

  const minutes = getEtaMinutes(estimatedAt);
  if (minutes !== null) {
    return CUSTOMER_ETA_DELIVERING_MESSAGE;
  }

  if (status && STATUS_ETA_FALLBACK[status]) {
    return STATUS_ETA_FALLBACK[status]!;
  }

  return "We'll update you soon";
}

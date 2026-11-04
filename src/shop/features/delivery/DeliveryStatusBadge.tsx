"use client";

import type { DeliveryStatus } from "../orders/types/delivery";

import { DELIVERY_STATUS_LABELS } from "../orders/types/delivery";

/**
 * Customer-facing status badge — labels hide provider/rider assignment details.
 */
export const DELIVERY_BADGE_CONFIG: Record<
  DeliveryStatus,
  { label: string; className: string }
> = {
  WAITING_FOR_KITCHEN: {
    label: DELIVERY_STATUS_LABELS.WAITING_FOR_KITCHEN,
    className: "bg-amber-100 text-amber-800",
  },
  WAITING_FOR_PROVIDER: {
    label: DELIVERY_STATUS_LABELS.WAITING_FOR_PROVIDER,
    className: "bg-amber-100 text-amber-800",
  },
  PROVIDER_ASSIGNMENT_FAILED: {
    label: DELIVERY_STATUS_LABELS.PROVIDER_ASSIGNMENT_FAILED,
    className: "bg-amber-100 text-amber-800",
  },
  PROVIDER_ASSIGNED: {
    label: DELIVERY_STATUS_LABELS.PROVIDER_ASSIGNED,
    className: "bg-amber-100 text-amber-800",
  },
  RIDER_ARRIVING: {
    label: DELIVERY_STATUS_LABELS.RIDER_ARRIVING,
    className: "bg-amber-100 text-amber-800",
  },
  RIDER_ARRIVED: {
    label: DELIVERY_STATUS_LABELS.RIDER_ARRIVED,
    className: "bg-amber-100 text-amber-800",
  },
  AWAITING_PICKUP: {
    label: DELIVERY_STATUS_LABELS.AWAITING_PICKUP,
    className: "bg-amber-100 text-amber-800",
  },
  PICKED_UP: {
    label: DELIVERY_STATUS_LABELS.PICKED_UP,
    className: "bg-indigo-100 text-indigo-800",
  },
  OUT_FOR_DELIVERY: {
    label: DELIVERY_STATUS_LABELS.OUT_FOR_DELIVERY,
    className: "bg-indigo-100 text-indigo-800",
  },
  NEAR_CUSTOMER: {
    label: DELIVERY_STATUS_LABELS.NEAR_CUSTOMER,
    className: "bg-indigo-100 text-indigo-800",
  },
  DELIVERED: {
    label: DELIVERY_STATUS_LABELS.DELIVERED,
    className: "bg-green-100 text-green-700",
  },
  FAILED: {
    label: DELIVERY_STATUS_LABELS.FAILED,
    className: "bg-red-100 text-red-700",
  },
  CANCELLED: {
    label: DELIVERY_STATUS_LABELS.CANCELLED,
    className: "bg-gray-100 text-gray-700",
  },
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const config = DELIVERY_BADGE_CONFIG[status] ?? DELIVERY_BADGE_CONFIG.OUT_FOR_DELIVERY;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}

import { Badge } from "@shop/components/ui/badge";
import { STATUS_CONFIG, DELIVERY_STATUS_CONFIG, type SubscriptionStatus, type SubscriptionDeliveryStatus } from "../types/subscription";

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "" };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: SubscriptionDeliveryStatus }) {
  const cfg = DELIVERY_STATUS_CONFIG[status] ?? { label: status, className: "" };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/** @deprecated use DeliveryStatusBadge */
export const OccurrenceStatusBadge = DeliveryStatusBadge;

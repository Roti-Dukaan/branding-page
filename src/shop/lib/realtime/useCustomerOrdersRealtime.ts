import { useEffect, useRef } from "react";
import { connectRealtime, disconnectRealtime, onRealtime } from "./socket";
import { REALTIME_EVENTS, type AdminOrderUpdatedPayload, type DeliveryUpdatedPayload } from "./events";
import { playChime, ensureNotificationPermission, showOrderNotification } from "./notify";
import { toast } from "@shop/lib/toast";

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const TERMINAL_ORDER_STATUSES = new Set(["DELIVERED", "CANCELLED", "FAILED", "REFUNDED"]);

/**
 * Live sync for the customer "My Orders" screen. Refreshes when the order or
 * its delivery reaches a new status (including Borzo delivery completion).
 */
export function useCustomerOrdersRealtime(onUpdate?: () => void) {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    connectRealtime();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        onUpdate?.();
      }, 500);
    };

    const notify = (orderNumber: string, status: string) => {
      const label = STATUS_LABELS[status] ?? status;
      playChime();
      ensureNotificationPermission();

      if (typeof document !== "undefined" && document.hidden) {
        showOrderNotification(`Order ${orderNumber} · ${label}`, "Tap to view your order.", () =>
          onUpdate?.(),
        );
      } else if (TERMINAL_ORDER_STATUSES.has(status)) {
        toast.success(`Order ${orderNumber} is ${label.toLowerCase()}`);
      } else {
        toast.info(`Order ${orderNumber} is now ${label}`);
      }
      schedule();
    };

    const offOrder = onRealtime(REALTIME_EVENTS.CUSTOMER_ORDER_UPDATED, (raw) => {
      const payload = raw as AdminOrderUpdatedPayload;
      const key = `order:${payload.orderId}:${payload.occurredAt}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      notify(payload.orderNumber, payload.status);
    });

    const offDelivery = onRealtime(REALTIME_EVENTS.CUSTOMER_DELIVERY_UPDATED, (raw) => {
      const payload = raw as DeliveryUpdatedPayload;
      const key = `delivery:${payload.orderId}:${payload.status}:${payload.occurredAt}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      schedule();
    });

    return () => {
      offOrder();
      offDelivery();
      if (timer) clearTimeout(timer);
      disconnectRealtime();
    };
  }, [onUpdate]);

  return {};
}

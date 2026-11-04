"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connectRealtime, disconnectRealtime, onRealtime } from "@shop/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type AdminOrderUpdatedPayload,
  type DeliveryEtaUpdatedPayload,
  type DeliveryTrackingUpdatedPayload,
  type DeliveryUpdatedPayload,
} from "@shop/lib/realtime/events";
import { deliveryApi } from "../services/delivery.api";

const TRACKING_QUERY_KEY = "delivery";
const ORDER_QUERY_KEY = "order";

function isForOrder(
  payload: { orderId?: string },
  orderId: string,
): boolean {
  return payload.orderId === orderId;
}

/**
 * Live delivery tracking for a single order. Loads once, then refreshes when
 * delivery/order socket events arrive — no polling.
 */
export function useDeliveryTrackingRealtime(orderId: string | null) {
  const queryClient = useQueryClient();
  const seen = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey: [TRACKING_QUERY_KEY, "tracking", orderId],
    queryFn: () => deliveryApi.getTracking(orderId!),
    enabled: !!orderId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!orderId) return;

    connectRealtime();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        void queryClient.invalidateQueries({ queryKey: [TRACKING_QUERY_KEY, "tracking", orderId] });
        void queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEY, orderId] });
      }, 400);
    };

    const dedupeAndRefresh = (key: string) => {
      if (seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      scheduleRefresh();
    };

    const offDelivery = onRealtime(REALTIME_EVENTS.CUSTOMER_DELIVERY_UPDATED, (raw) => {
      const payload = raw as DeliveryUpdatedPayload;
      if (!isForOrder(payload, orderId)) return;
      dedupeAndRefresh(`${payload.status}:${payload.occurredAt}`);
    });

    const offTracking = onRealtime(REALTIME_EVENTS.DELIVERY_TRACKING_UPDATED, (raw) => {
      const payload = raw as DeliveryTrackingUpdatedPayload;
      if (!isForOrder(payload, orderId)) return;
      dedupeAndRefresh(`${payload.status}:${payload.estimatedDeliveryAt ?? ""}`);
    });

    const offEta = onRealtime(REALTIME_EVENTS.DELIVERY_ETA_UPDATED, (raw) => {
      const payload = raw as DeliveryEtaUpdatedPayload;
      if (!isForOrder(payload, orderId)) return;
      dedupeAndRefresh(`eta:${payload.estimatedDeliveryAt}`);
    });

    const offOrder = onRealtime(REALTIME_EVENTS.CUSTOMER_ORDER_UPDATED, (raw) => {
      const payload = raw as AdminOrderUpdatedPayload;
      if (!isForOrder(payload, orderId)) return;
      dedupeAndRefresh(`${payload.status}:${payload.occurredAt}`);
    });

    return () => {
      offDelivery();
      offTracking();
      offEta();
      offOrder();
      if (timer) clearTimeout(timer);
      disconnectRealtime();
    };
  }, [orderId, queryClient]);

  return query;
}

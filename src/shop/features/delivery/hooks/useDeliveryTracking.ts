"use client";

import { useEffect, useRef, useState } from "react";
import { connectRealtime, disconnectRealtime, onRealtime } from "@shop/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type DeliveryEtaUpdatedPayload,
  type DeliveryTrackingUpdatedPayload,
  type DeliveryUpdatedPayload,
} from "@shop/lib/realtime/events";
import { deliveryApi } from "@shop/features/orders/services/delivery.api";
import type { DeliveryTracking } from "@shop/features/orders/types/delivery";

/**
 * Live delivery tracking for a single order. Loads once on mount, then refreshes
 * when delivery/order socket events arrive — no polling fallback.
 */
export function useDeliveryTracking(orderId: string | undefined) {
  const [delivery, setDelivery] = useState<DeliveryTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!orderId) return;
    const id = orderId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await deliveryApi.getTracking(id);
        if (!cancelled) {
          setDelivery(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load delivery");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    connectRealtime();

    const scheduleLoad = () => {
      void load();
    };

    const dedupeAndLoad = (key: string) => {
      if (seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 100) seen.current.clear();
      scheduleLoad();
    };

    const offDelivery = onRealtime(REALTIME_EVENTS.CUSTOMER_DELIVERY_UPDATED, (raw: unknown) => {
      const payload = raw as DeliveryUpdatedPayload;
      if (payload.orderId !== orderId) return;
      dedupeAndLoad(`${payload.status}:${payload.occurredAt}`);
    });

    const offTracking = onRealtime(REALTIME_EVENTS.DELIVERY_TRACKING_UPDATED, (raw: unknown) => {
      const payload = raw as DeliveryTrackingUpdatedPayload;
      if (payload.orderId !== orderId) return;
      dedupeAndLoad(`${payload.status}:${payload.estimatedDeliveryAt ?? ""}`);
    });

    const offEta = onRealtime(REALTIME_EVENTS.DELIVERY_ETA_UPDATED, (raw: unknown) => {
      const payload = raw as DeliveryEtaUpdatedPayload;
      if (payload.orderId !== orderId) return;
      dedupeAndLoad(`eta:${payload.estimatedDeliveryAt}`);
    });

    return () => {
      cancelled = true;
      offDelivery();
      offTracking();
      offEta();
      disconnectRealtime();
    };
  }, [orderId]);

  return { delivery, isLoading, error };
}

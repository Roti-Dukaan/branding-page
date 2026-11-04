"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectRealtime, disconnectRealtime, onRealtime } from "@shop/lib/realtime/socket";
import { REALTIME_EVENTS, type KitchenStatusUpdatedPayload } from "@shop/lib/realtime/events";
import { toast } from "@shop/lib/toast";
import { useLocationStore } from "@shop/lib/stores/location-store";
import {
  useKitchenStatusQuery,
  KITCHEN_STATUS_QUERY_KEY,
  type KitchenStatus,
  type KitchenStatusValue,
} from "@shop/hooks/useKitchenStatus";

interface KitchenStatusContextValue {
  status: KitchenStatusValue | undefined;
  data: KitchenStatus | undefined;
  isLoading: boolean;
  isOpen: boolean;
  isBusy: boolean;
  isClosed: boolean;
  isMaintenance: boolean;
  /** True when checkout/order placement should be blocked. */
  isBlockingOrders: boolean;
  acceptingOrders: boolean;
}

const KitchenStatusContext = React.createContext<KitchenStatusContextValue | null>(null);

/**
 * Global provider that keeps the kitchen operational status in sync across the
 * customer app. It fetches once, refetches every 30s (fallback) and also
 * subscribes to the realtime `KITCHEN_STATUS_UPDATED` event for instant updates.
 */
export function KitchenStatusProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const branchId = useLocationStore((s) => s.branchId);
  const { data, isLoading } = useKitchenStatusQuery();
  const previousStatus = React.useRef<KitchenStatusValue | undefined>(undefined);

  React.useEffect(() => {
    connectRealtime();

    const off = onRealtime(REALTIME_EVENTS.KITCHEN_STATUS_UPDATED, (raw) => {
      const payload = raw as KitchenStatusUpdatedPayload & { branchId?: string };
      // Only apply update if it matches the customer's current branch
      if (payload.branchId && payload.branchId !== branchId) return;
      const next: KitchenStatus = {
        status: payload.status,
        busyDelayMinutes: payload.busyDelayMinutes,
        message: payload.message,
        scheduledReopenAt: payload.scheduledReopenAt ?? null,
        acceptingOrders: payload.acceptingOrders,
        updatedBy: payload.updatedBy,
        updatedAt: payload.updatedAt,
        createdAt: previousStatus.current ? (data?.createdAt ?? payload.updatedAt) : payload.updatedAt,
      };
      queryClient.setQueryData([...KITCHEN_STATUS_QUERY_KEY, branchId], next);

      const prev = previousStatus.current;
      if (prev && prev !== payload.status) {
        if (payload.status === "CLOSED") {
          toast.error("Kitchen has closed. Please try again tomorrow.");
        } else if (payload.status === "MAINTENANCE") {
          toast.error("Kitchen is temporarily unavailable. Please try again shortly.");
        } else if (payload.status === "OPEN" && (prev === "CLOSED" || prev === "MAINTENANCE")) {
          toast.success("Kitchen is now open — you can place your order!");
        }
      }
      previousStatus.current = payload.status;
    });

    return () => {
      off();
      disconnectRealtime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (data?.status) previousStatus.current = data.status;
  }, [data?.status]);

  const status = data?.status;
  const isOpen = status === "OPEN";
  const isBusy = status === "BUSY";
  const isClosed = status === "CLOSED";
  const isMaintenance = status === "MAINTENANCE";

  const acceptingOrders =
    data?.acceptingOrders ?? (status === "OPEN" || status === "BUSY");

  const value: KitchenStatusContextValue = {
    status,
    data,
    isLoading,
    isOpen,
    isBusy,
    isClosed,
    isMaintenance,
    isBlockingOrders: !acceptingOrders,
    acceptingOrders,
  };

  return (
    <KitchenStatusContext.Provider value={value}>{children}</KitchenStatusContext.Provider>
  );
}

export function useKitchenStatus(): KitchenStatusContextValue {
  const ctx = React.useContext(KitchenStatusContext);
  if (!ctx) {
    throw new Error("useKitchenStatus must be used within a KitchenStatusProvider");
  }
  return ctx;
}

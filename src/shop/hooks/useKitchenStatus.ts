"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { kitchenApi, type KitchenStatus, type KitchenStatusValue } from "@shop/lib/api/kitchen.api";

export const KITCHEN_STATUS_QUERY_KEY = ["kitchen", "status"] as const;

/**
 * Fetches the current kitchen operational status for the customer's assigned branch.
 * Refetches every 30s as a fallback so the UI stays correct even if the websocket is unavailable.
 */
export function useKitchenStatusQuery() {
  const branchId = useLocationStore((s) => s.branchId);

  return useQuery({
    queryKey: [...KITCHEN_STATUS_QUERY_KEY, branchId],
    queryFn: () => kitchenApi.getStatus(branchId),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!branchId,
  });
}

export type { KitchenStatus, KitchenStatusValue };

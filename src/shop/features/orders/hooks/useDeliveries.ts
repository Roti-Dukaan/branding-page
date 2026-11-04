"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeliveryTracking, DeliveryListItem, PaginatedDeliveryResponse, DeliveryFilters } from "../types/delivery";
import { deliveryApi } from "../services/delivery.api";

export function useDeliveries(filters: DeliveryFilters = {}) {
  return useQuery({
    queryKey: ["deliveries", filters],
    queryFn: () => deliveryApi.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderDelivery(orderId: string | null) {
  return useQuery({
    queryKey: ["delivery", "order", orderId],
    queryFn: () => deliveryApi.getByOrderId(orderId!),
    enabled: !!orderId,
    staleTime: 30_000,
  });
}

/** @deprecated Prefer `useDeliveryTrackingRealtime` for live order tracking pages. */
export function useDeliveryTracking(orderId: string | null) {
  return useQuery({
    queryKey: ["delivery", "tracking", orderId],
    queryFn: () => deliveryApi.getTracking(orderId!),
    enabled: !!orderId,
    staleTime: 60_000,
  });
}

export function useDeliveryHistory(filters: DeliveryFilters = {}) {
  return useQuery({
    queryKey: ["deliveryHistory", filters],
    queryFn: () => deliveryApi.list({ ...filters, limit: filters.limit || 20 }),
    placeholderData: (previousData) => previousData,
  });
}

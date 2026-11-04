import { apiClient, unwrapApiResponse } from "@shop/lib/api/client";
import type {
  DeliveryTracking,
  DeliveryTimelineEntry,
  DeliveryListItem,
  PaginatedDeliveryResponse,
  DeliveryFilters,
} from "../types/delivery";

/** Backend timeline rows use `occurredAt`; customer UI expects `timestamp`. */
function normalizeTimeline(
  timeline?: Array<DeliveryTimelineEntry & { occurredAt?: string }>,
): DeliveryTimelineEntry[] | undefined {
  if (!timeline?.length) return timeline;
  return timeline.map((entry) => ({
    ...entry,
    timestamp: entry.timestamp ?? entry.occurredAt ?? entry.timestamp,
  }));
}

function normalizeDelivery(raw: DeliveryTracking): DeliveryTracking {
  return {
    ...raw,
    timeline: normalizeTimeline(raw.timeline as Array<DeliveryTimelineEntry & { occurredAt?: string }>),
  };
}

export const deliveryApi = {
  list: async (filters: DeliveryFilters = {}): Promise<PaginatedDeliveryResponse> => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.provider && filters.provider !== "all") params.append("provider", filters.provider);
    if (filters.deliveryType && filters.deliveryType !== "all") params.append("deliveryType", filters.deliveryType);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.search) params.append("search", filters.search);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const response = await apiClient.get<{ success: boolean; data: PaginatedDeliveryResponse }>(
      `/customer/orders/history?${params.toString()}`,
    );
    return unwrapApiResponse(response, "Failed to load delivery history");
  },

  getByOrderId: async (orderId: string): Promise<DeliveryTracking> => {
    const response = await apiClient.get<{ success: boolean; data: DeliveryTracking }>(
      `/customer/orders/${encodeURIComponent(orderId)}/delivery`,
    );
    return normalizeDelivery(unwrapApiResponse(response, "Delivery not found for this order"));
  },

  getTracking: async (orderId: string): Promise<DeliveryTracking> => {
    const response = await apiClient.get<{ success: boolean; data: DeliveryTracking }>(
      `/customer/orders/${encodeURIComponent(orderId)}/delivery/tracking`,
    );
    return normalizeDelivery(unwrapApiResponse(response, "Failed to load delivery tracking"));
  },

  cancel: async (
    orderId: string,
    reason?: string,
  ): Promise<DeliveryTracking> => {
    const response = await apiClient.post<{ success: boolean; data: DeliveryTracking }>(
      `/customer/orders/${encodeURIComponent(orderId)}/delivery/cancel`,
      { reason },
    );
    return normalizeDelivery(unwrapApiResponse(response, "Failed to cancel delivery"));
  },

  reportIssue: async (
    orderId: string,
    payload: { subject: string; description: string; contactPhone?: string },
  ): Promise<{ success: true }> => {
    const response = await apiClient.post<{ success: boolean; data: { success: true } }>(
      `/customer/orders/${encodeURIComponent(orderId)}/delivery/report`,
      payload,
    );
    return unwrapApiResponse(response, "Failed to report delivery issue");
  },
};

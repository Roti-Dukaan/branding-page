import { apiClient } from "./client";

export type KitchenStatusValue = "OPEN" | "BUSY" | "CLOSED" | "MAINTENANCE";

export interface KitchenStatus {
  status: KitchenStatusValue;
  busyDelayMinutes: number;
  message: string | null;
  scheduledReopenAt?: string | null;
  acceptingOrders?: boolean;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

export const kitchenApi = {
  /** GET /kitchen/status — public kitchen operational status for a branch. */
  async getStatus(branchId?: string | null): Promise<KitchenStatus> {
    const { data } = await apiClient.get<{ success: true; data: KitchenStatus }>(
      "/kitchen/status",
      { params: branchId ? { branchId } : undefined }
    );
    return data.data;
  },
};

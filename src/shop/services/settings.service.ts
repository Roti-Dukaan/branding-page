import { apiClient, unwrapApiResponse } from "@shop/lib/api/client";

export interface PublicSettings {
  businessName: string;
  businessLogo: string | null;
  currency: string;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
  gstPercentage: number;
  gstType: string;
  sacCode: string | null;
  serviceablePincodes: string[];
  isOrderingEnabled: boolean;
  maintenanceMode: boolean;
  cashOnDeliveryEnabled: boolean;
  codEnabledForOneTime: boolean;
  razorpayEnabled: boolean;
  allowScheduledDelivery: boolean;
  allowInstantDelivery: boolean;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const response = await apiClient.get("/settings/public");
  return unwrapApiResponse(response);
}

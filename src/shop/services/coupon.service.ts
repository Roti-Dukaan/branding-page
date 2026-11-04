import { apiClient, getApiErrorMessage, unwrapApiResponse } from "@shop/lib/api/client";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalUuid(value?: string | null): string | undefined {
  if (!value || !UUID_RE.test(value)) return undefined;
  return value;
}

function buildCouponPayload(params: {
  code: string;
  cartSubtotal: number;
  branchId?: string | null;
  orderType?: "realtime";
}) {
  const branchId = optionalUuid(params.branchId);
  return {
    code: params.code,
    cartSubtotal: params.cartSubtotal,
    orderType: params.orderType ?? "realtime",
    ...(branchId ? { branchId } : {}),
  };
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  originalSubtotal: number;
  couponDiscount: number;
  finalPayable: number;
  appliedCoupon?: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    discountType: "FLAT" | "PERCENTAGE";
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount: number | null;
  };
}

export interface AvailableCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrder?: number;
  expiryDate?: string;
  isActive: boolean;
  isComingSoon?: boolean;
}

export const couponService = {
  async listAvailable(): Promise<AvailableCoupon[]> {
    const response = await apiClient.get("/coupons/available");
    return unwrapApiResponse<AvailableCoupon[]>(response, "Failed to load coupons");
  },

  async listAvailablePublic(branchId?: string): Promise<AvailableCoupon[]> {
    const response = await apiClient.get("/coupons/public/available", {
      params: branchId ? { branchId } : undefined,
    });
    return unwrapApiResponse<AvailableCoupon[]>(response, "Failed to load coupons");
  },

  async validate(params: {
    code: string;
    cartSubtotal: number;
    branchId?: string;
    orderType?: "realtime";
  }): Promise<CouponValidationResult> {
    const response = await apiClient.post("/checkout/validate-coupon", buildCouponPayload(params));
    return unwrapApiResponse<CouponValidationResult>(response, "Failed to validate coupon");
  },

  async apply(params: {
    code: string;
    cartSubtotal: number;
    branchId?: string;
    orderType?: "realtime";
  }): Promise<CouponValidationResult> {
    const response = await apiClient.post("/checkout/apply-coupon", buildCouponPayload(params));
    return unwrapApiResponse<CouponValidationResult>(response, "Failed to apply coupon");
  },

  async remove(): Promise<void> {
    await apiClient.delete("/coupons/cart");
  },

  getErrorMessage(error: unknown, fallback = "Coupon error"): string {
    return getApiErrorMessage(error, fallback);
  },
};

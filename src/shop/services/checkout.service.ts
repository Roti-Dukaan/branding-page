import { apiClient, getApiErrorMessage, unwrapApiResponse } from "@shop/lib/api/client";
import { paymentService } from "@shop/services/payment.service";
import type { PaymentOrderResponse } from "@shop/services/payment.service";

export interface PrepareCheckoutPayload {
  addressId?: string;
  paymentMethod?: "COD" | "ONLINE";
  deliveryType?: "QUICK" | "SCHEDULED";
  deliverySlotId?: string;
}

export interface PrepareCheckoutResponse {
  checkoutSessionId: string;
  checkoutReference: string;
  grandTotal: number;
  paymentMethod: "COD" | "ONLINE";
  payment?: PaymentOrderResponse;
}

function normalizePayment(
  payment: PaymentOrderResponse | { data?: PaymentOrderResponse } | null | undefined,
): PaymentOrderResponse | undefined {
  if (!payment || typeof payment !== "object") return undefined;
  if ("paymentId" in payment && payment.paymentId) {
    return payment as PaymentOrderResponse;
  }
  if ("data" in payment && payment.data && typeof payment.data === "object") {
    return payment.data;
  }
  return undefined;
}

async function prepareViaLegacyFlow(
  payload: PrepareCheckoutPayload,
): Promise<PrepareCheckoutResponse> {
  try {
    const response = await apiClient.post("/checkout", payload);
    const data = unwrapApiResponse<{
      id: string;
      checkoutReference: string;
      pricing: { grandTotal: number };
    }>(response);

    const sessionId = data.id;
    const base: PrepareCheckoutResponse = {
      checkoutSessionId: sessionId,
      checkoutReference: data.checkoutReference,
      grandTotal: data.pricing.grandTotal,
      paymentMethod: payload.paymentMethod ?? "ONLINE",
    };

    if (payload.paymentMethod === "COD") {
      const payment = await paymentService.createOrder(sessionId);
      return { ...base, paymentMethod: "COD", payment };
    }

    const payment = await paymentService.createOrder(sessionId);
    return { ...base, paymentMethod: "ONLINE", payment };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to initialize checkout"));
  }
}

export const checkoutService = {
  async prepare(payload: PrepareCheckoutPayload): Promise<PrepareCheckoutResponse> {
    try {
      const response = await apiClient.post("/checkout/prepare", payload);
      const data = unwrapApiResponse<PrepareCheckoutResponse>(
        response,
        "Failed to prepare checkout",
      );
      return {
        ...data,
        payment: normalizePayment(data.payment),
      };
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // Older backends / transient routing issues — fall back to checkout + create-order.
      if (status === 404 || status === 405 || status === 501) {
        return prepareViaLegacyFlow(payload);
      }
      throw error instanceof Error
        ? error
        : new Error(getApiErrorMessage(error, "Failed to prepare checkout"));
    }
  },
};

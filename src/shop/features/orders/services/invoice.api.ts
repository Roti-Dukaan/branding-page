import { apiClient, unwrapApiResponse } from "@shop/lib/api/client";
import type { InvoiceData } from "@shop/features/invoice/types/invoice";

export type InvoiceState = "PENDING" | "GENERATED" | "FAILED" | "REGENERATED";

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  paymentId?: string;
  orderNumber?: string | null;
  financialYear?: string | null;
  customerId: string;
  invoiceDate: string;
  status: InvoiceState;
  downloadUrl?: string | null;
  generatedAt: string;
  errorMessage?: string | null;
}

export interface InvoiceDetail extends InvoiceData {
  id?: string;
  financialYear: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  orderType: "Live Order" | "Subscription";
  orderDate: string;
  orderTime: string;
  deliveryAddress: InvoiceData["customer"]["address"];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponDiscount?: number;
  couponCode?: string | null;
  grandTotal: number;
  currency: string;
  status: InvoiceState;
  downloadUrl?: string | null;
  payment: InvoiceData["payment"] & {
    transactionId?: string | null;
    couponCode?: string | null;
  };
}

export interface InvoiceView {
  invoice: InvoiceEntity | null;
  detail: InvoiceDetail | null;
  state: InvoiceState;
}

export interface InvoiceDownload {
  downloadUrl: string | null;
  fileName: string;
  mimeType: string;
}

function parseFileNameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? null;
}

async function parseBlobError(blob: Blob, fallback: string): Promise<never> {
  try {
    const text = await blob.text();
    const body = JSON.parse(text) as { message?: string };
    throw new Error(body.message || fallback);
  } catch {
    throw new Error(fallback);
  }
}

export const invoiceApi = {
  getByOrder: async (orderId: string): Promise<InvoiceView> => {
    const response = await apiClient.get(`/orders/${encodeURIComponent(orderId)}/invoice`);
    return unwrapApiResponse<InvoiceView>(response, "Failed to load invoice");
  },

  getById: async (invoiceId: string): Promise<InvoiceView> => {
    const response = await apiClient.get(`/invoices/${encodeURIComponent(invoiceId)}`);
    return unwrapApiResponse<InvoiceView>(response, "Failed to load invoice");
  },

  generate: async (orderId: string): Promise<InvoiceView> => {
    const response = await apiClient.post("/invoices/generate", { orderId });
    return unwrapApiResponse<InvoiceView>(response, "Failed to generate invoice");
  },

  generateForPayment: async (paymentId: string): Promise<InvoiceView> => {
    const response = await apiClient.post("/invoices/generate", { paymentId });
    return unwrapApiResponse<InvoiceView>(response, "Failed to generate invoice");
  },

  getByPayment: async (paymentId: string): Promise<InvoiceView> => {
    const response = await apiClient.get(`/payments/${encodeURIComponent(paymentId)}/invoice`);
    return unwrapApiResponse<InvoiceView>(response, "Failed to load invoice");
  },

  getDownloadByOrder: async (orderId: string): Promise<InvoiceDownload> => {
    const response = await apiClient.get(
      `/orders/${encodeURIComponent(orderId)}/invoice/download`,
    );
    return unwrapApiResponse<InvoiceDownload>(response, "Failed to download invoice");
  },

  downloadPdfByOrder: async (orderId: string): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get(
      `/orders/${encodeURIComponent(orderId)}/invoice/download`,
      { responseType: "blob" },
    );
    const blob = response.data as Blob;
    if (blob.type.includes("application/json")) {
      await parseBlobError(blob, "Failed to download invoice");
    }
    const fileName =
      parseFileNameFromDisposition(response.headers["content-disposition"] as string | undefined) ??
      `invoice-${orderId}.pdf`;
    return { blob, fileName };
  },

  downloadPdfByPayment: async (paymentId: string): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get(
      `/payments/${encodeURIComponent(paymentId)}/invoice/download`,
      { responseType: "blob" },
    );
    const blob = response.data as Blob;
    if (blob.type.includes("application/json")) {
      await parseBlobError(blob, "Failed to download invoice");
    }
    const fileName =
      parseFileNameFromDisposition(response.headers["content-disposition"] as string | undefined) ??
      `invoice-${paymentId}.pdf`;
    return { blob, fileName };
  },

  getPdfByInvoiceId: async (invoiceId: string): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get(`/invoices/${encodeURIComponent(invoiceId)}/pdf`, {
      responseType: "blob",
    });
    const blob = response.data as Blob;
    if (blob.type.includes("application/json")) {
      await parseBlobError(blob, "Failed to download invoice");
    }
    const fileName =
      parseFileNameFromDisposition(response.headers["content-disposition"] as string | undefined) ??
      `invoice-${invoiceId}.pdf`;
    return { blob, fileName };
  },
};

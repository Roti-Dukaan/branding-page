import type { InvoiceDetail } from "@shop/features/orders/services/invoice.api";
import type { InvoiceData } from "../types/invoice";

/** Maps API invoice detail (immutable snapshot) to printable UI model. */
export function mapInvoiceDetailToInvoiceData(detail: InvoiceDetail): InvoiceData {
  return {
    invoiceNumber: detail.invoiceNumber,
    orderId: detail.orderNumber,
    date: detail.orderDate,
    time: detail.orderTime,
    paymentStatus: detail.payment.status,
    customer: {
      name: detail.customer.name,
      phone: detail.customer.phone,
      email: detail.customer.email ?? undefined,
      address: detail.deliveryAddress,
    },
    items: detail.items.map((item) => ({
      id: item.lineNumber ?? item.id,
      name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    summary: {
      subtotal: detail.subtotal,
      deliveryCharge: detail.deliveryCharge,
      discount: detail.discount,
      couponCode: detail.couponCode ?? detail.payment.couponCode ?? undefined,
      grandTotal: detail.grandTotal,
    },
    payment: {
      method: detail.payment.method,
      transactionId: detail.payment.transactionId ?? "—",
      status:
        detail.payment.status === "Paid"
          ? "Paid"
          : detail.payment.status === "Failed"
            ? "Failed"
            : "Pending",
    },
    specialInstructions: detail.specialInstructions,
  };
}

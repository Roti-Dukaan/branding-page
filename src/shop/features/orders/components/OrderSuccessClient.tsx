"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { orderService, type Order } from "@shop/services/order.service";
import { invoiceApi } from "@shop/features/orders/services/invoice.api";
import { useInvoiceActions } from "@shop/features/invoice/hooks/useInvoiceActions";
import { formatPrice } from "@shop/lib/utils";
import { isOrderPaidForMetaPurchase, trackMetaPurchase } from "@shop/lib/meta/purchase";

export function OrderSuccessClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { downloadInvoice, loading: invoiceLoading } = useInvoiceActions(orderId);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [orderData, invoiceView] = await Promise.all([
          orderService.getById(orderId),
          invoiceApi.getByOrder(orderId).catch(() => null),
        ]);
        if (cancelled) return;
        setOrder(orderData);
        if (isOrderPaidForMetaPurchase(orderData)) {
          trackMetaPurchase({
            orderNumber: orderData.orderNumber,
            value: Number(orderData.grandTotal),
            currency: "INR",
            eventId: (orderData as { metaPurchaseEventId?: string }).metaPurchaseEventId,
          });
        }
        if (invoiceView?.invoice?.invoiceNumber) {
          setInvoiceNumber(invoiceView.invoice.invoiceNumber);
        } else {
          invoiceApi.generate(orderId).then((v) => {
            if (!cancelled && v.invoice?.invoiceNumber) {
              setInvoiceNumber(v.invoice.invoiceNumber);
            }
          }).catch(() => undefined);
        }
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paymentLabel =
    order?.paymentMethod?.toLowerCase() === "cod" ? "Pay on Delivery" : "Paid";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Order Confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for ordering from Roti Dukaan.
        </p>

        <dl className="mt-6 space-y-3 rounded-xl bg-muted/40 p-4 text-left text-sm">
          {order?.orderNumber && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Order ID</dt>
              <dd className="font-semibold text-foreground">{order.orderNumber}</dd>
            </div>
          )}
          {invoiceNumber && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Invoice Number</dt>
              <dd className="font-semibold text-foreground">{invoiceNumber}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment Status</dt>
            <dd className="font-semibold text-foreground">{paymentLabel}</dd>
          </div>
          {order?.estimatedDeliveryTime != null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Estimated Delivery</dt>
              <dd className="font-semibold text-foreground">20–30 mins</dd>
            </div>
          )}
          {order?.grandTotal != null && (
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="font-medium text-foreground">Grand Total</dt>
              <dd className="text-lg font-bold text-foreground">
                {formatPrice(Number(order.grandTotal))}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => void downloadInvoice()}
            disabled={invoiceLoading}
            className="w-full min-h-[48px]"
          >
            {invoiceLoading ? "Preparing PDF…" : "Download Invoice"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/menu")}
            className="w-full min-h-[48px]"
          >
            Continue Shopping
          </Button>
          <Link
            href={`/orders/${orderId}/tracking`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Track your order
          </Link>
        </div>
      </div>
    </div>
  );
}

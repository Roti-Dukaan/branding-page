"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  ChevronRight,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orderService, type Order } from "@shop/services/order.service";
import { formatTimestamp } from "@shop/lib/date";
import { OrderInvoiceActions } from "@shop/features/invoice/components/OrderInvoiceActions";
import { useCustomerOrdersRealtime } from "@shop/lib/realtime/useCustomerOrdersRealtime";

const ORDER_LABEL: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending confirmation",
  CONFIRMED: "Confirmed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing your order",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const TERMINAL = new Set(["DELIVERED", "CANCELLED", "FAILED", "REFUNDED"]);
const CANCELLED_SET = new Set(["CANCELLED", "FAILED", "REFUNDED"]);

function formatPlacedAt(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return formatTimestamp(date);
}

function itemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
}

function isOngoing(order: Order): boolean {
  return !TERMINAL.has(order.status);
}

function formatOrderPaymentLabel(order: Order): string {
  const method = order.paymentMethod?.toLowerCase();
  if (method === "cod") {
    return "Cash on Delivery";
  }

  const status = order.paymentStatus?.toUpperCase();
  if (status === "CAPTURED" || status === "AUTHORIZED") {
    return "Paid online";
  }
  if (!status || status === "CREATED" || status === "PENDING") {
    return "Payment pending";
  }

  return "Paid online";
}

function LiveStatus({ status }: { status: string }) {
  const label = ORDER_LABEL[status] ?? status;

  if (CANCELLED_SET.has(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <XCircle className="size-3.5" />
        {label}
      </span>
    );
  }

  if (status === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
        <CheckCircle2 className="size-3.5" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40" />
        <span className="relative inline-flex size-2 rounded-full bg-foreground" />
      </span>
      {label}
    </span>
  );
}

export function ProfileOrders({
  highlightOrderId,
  onSelectOrder,
}: {
  highlightOrderId?: string | null;
  onSelectOrder?: (orderId: string) => void;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<"all" | "ongoing" | "past">("all");

  const openOrder = (orderId: string) => {
    if (onSelectOrder) onSelectOrder(orderId);
    else router.push(`/orders/${orderId}/tracking`);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getHistory(1, 20);
      const sorted = [...(data.items ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useCustomerOrdersRealtime(load);

  useEffect(() => {
    if (highlightOrderId && !isLoading && !orders.some((o) => o.id === highlightOrderId)) {
      const t = setTimeout(load, 800);
      return () => clearTimeout(t);
    }
  }, [highlightOrderId, isLoading, orders, load]);

  const filtered = useMemo(() => {
    if (segment === "ongoing") return orders.filter(isOngoing);
    if (segment === "past") return orders.filter((o) => !isOngoing(o));
    return orders;
  }, [orders, segment]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">My Orders</h2>
          <p className="text-sm text-muted-foreground">
            View your order history and track current orders
          </p>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/70"
        >
          <ShoppingBag className="w-4 h-4" />
          Order More
        </Link>
      </div>

      {!isLoading && !error && orders.length > 0 && (
        <div className="inline-flex rounded-xl bg-muted p-1 text-sm">
          {(["all", "ongoing", "past"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSegment(s)}
              className={`px-4 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                segment === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s === "all" ? "All" : s === "ongoing" ? "Ongoing" : "Past"}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="size-14 rounded-xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <AlertCircle className="size-8 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={load} className="gap-2">
              <Loader2 className="size-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Package className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your order history will appear here once you place an order.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShoppingBag className="size-4" />
              Continue Shopping
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Package className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No {segment === "ongoing" ? "ongoing" : "past"} orders
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isNew = order.id === highlightOrderId;
            const totalQty = itemCount(order);
            const itemsSummary =
              order.items.map((i) => i.foodNameSnapshot).slice(0, 2).join(", ") +
              (order.items.length > 2 ? ` +${order.items.length - 2} more` : "");
            return (
              <Card key={order.id} className={isNew ? "ring-1 ring-foreground/20" : ""}>
                <CardContent className="p-4">
                  <button
                    type="button"
                    onClick={() => openOrder(order.id)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <LiveStatus status={order.status} />
                      <p className="mt-1.5 truncate text-sm font-medium text-foreground">
                        {itemsSummary}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        #{order.orderNumber} · {totalQty} {totalQty === 1 ? "item" : "items"} · {formatPlacedAt(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        ₹{Number(order.grandTotal).toLocaleString("en-IN")}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </button>

                  <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatOrderPaymentLabel(order)}
                    </span>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <button
                        type="button"
                        onClick={() => openOrder(order.id)}
                        className="text-left text-xs font-medium text-foreground hover:text-foreground/70 sm:text-right"
                      >
                        {isOngoing(order) ? "Track order" : "View details"}
                      </button>
                      <OrderInvoiceActions orderId={order.id} compact />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

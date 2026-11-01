"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck, Clock, CheckCircle, Package, Phone, XCircle, FileWarning } from "lucide-react";
import Link from "next/link";
import { formatTimestamp } from "@shop/lib/date";
import { useDeliveryTrackingRealtime } from "@shop/features/orders/hooks/useDeliveryTrackingRealtime";
import { DELIVERY_TYPE_LABELS } from "@shop/features/orders/types/delivery";
import { getCustomerStatusLabel, isTerminalDelivery } from "@shop/features/orders/utils/customer-delivery-ui";
import {
  DeliveryEtaCard,
  DeliveryInfo,
  CustomerDeliveryProgress,
  RiderInfoCard,
} from "@shop/features/orders/components/DeliveryTrackingComponents";
import { OrderReportIssueDialog } from "@shop/features/support/components/OrderReportIssueDialog";
import { useQuery } from "@tanstack/react-query";
import { orderService, type Order } from "@shop/services/order.service";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useAuthHydrated } from "@shop/hooks/useAuth";
import { OrderInvoiceActions } from "@shop/features/invoice/components/OrderInvoiceActions";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const authHydrated = useAuthHydrated();
  const { isAuthenticated, setAuthDialogOpen } = useAuthStore();

  const { data: delivery, isLoading, error } = useDeliveryTrackingRealtime(orderId);
  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      router.replace("/");
    }
  }, [authHydrated, isAuthenticated, router, setAuthDialogOpen]);

  // Fallback: when no delivery/courier record exists yet (early-stage orders),
  // fetch the plain order so we can still show status instead of dead-ending.
  const {
    data: order,
    isLoading: orderLoading,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId && !isLoading && !delivery,
  });

  const [reportOpen, setReportOpen] = useState(false);

  if (!authHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">
            {!authHydrated ? "Loading..." : "Redirecting to sign in..."}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    if (orderLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading order...</p>
          </div>
        </div>
      );
    }

    if (order) {
      return <OrderStatusFallback order={order} />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to load tracking</h1>
          <p className="text-gray-600 mb-6">The delivery information could not be found.</p>
          <Link href="/orders/history" className="text-orange-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const customerStatusLabel = getCustomerStatusLabel(
    delivery.status,
    delivery.order?.status,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/orders/history"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Order Tracking</h1>
              <p className="text-sm text-gray-500">#{delivery.order?.orderNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 rounded-lg bg-orange-100">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="font-semibold text-gray-900">{customerStatusLabel}</p>
              <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                {DELIVERY_TYPE_LABELS[delivery.deliveryType]}
              </span>
            </div>
          </div>
          {!isTerminalDelivery(delivery) && <DeliveryEtaCard delivery={delivery} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Order Progress
              </h2>
              <CustomerDeliveryProgress delivery={delivery} />
            </div>

            {delivery.riderName && (
              <RiderInfoCard
                name={delivery.riderName}
                phone={delivery.riderPhone}
                vehicleNumber={delivery.vehicleNumber}
              />
            )}

            {delivery.pickupOtp && ["PROVIDER_ASSIGNED", "RIDER_ARRIVING", "RIDER_ARRIVED", "AWAITING_PICKUP"].includes(delivery.status) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  Pickup OTP
                </h2>
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-4 text-center">
                  <p className="font-mono text-3xl font-bold tracking-[0.35em] text-indigo-700">
                    {delivery.pickupOtp}
                  </p>
                  <p className="mt-1 text-xs text-indigo-500">Share this OTP with the rider at pickup</p>
                </div>
              </div>
            )}

            <DeliveryInfo order={delivery.order} delivery={delivery} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {delivery.riderPhone && (
                  <a
                    href={`tel:${delivery.riderPhone}`}
                    className="block w-full p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-center font-medium flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call Rider
                  </a>
                )}
                <button
                  onClick={() => setReportOpen(true)}
                  className="block w-full p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <FileWarning className="w-5 h-5" />
                  Report Issue
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tracking #</dt>
                  <dd className="font-mono font-medium text-gray-900">{delivery.trackingNumber || "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">{formatTimestamp(delivery.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Updated</dt>
                  <dd className="text-gray-900">{formatTimestamp(delivery.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      <OrderReportIssueDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        orderId={orderId}
        orderNumber={delivery.order?.orderNumber ?? orderId}
      />
    </div>
  );
}

const ORDER_STEPS: { keys: string[]; label: string }[] = [
  { keys: ["PENDING_CONFIRMATION"], label: "Order placed" },
  { keys: ["CONFIRMED", "ACCEPTED"], label: "Confirmed" },
  { keys: ["PREPARING"], label: "Preparing your order" },
  { keys: ["READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"], label: "Out for delivery" },
  { keys: ["DELIVERED"], label: "Delivered" },
];

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

function orderStepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.keys.includes(status));
  return idx === -1 ? 0 : idx;
}

function OrderStatusFallback({ order }: { order: Order }) {
  const [reportOpen, setReportOpen] = useState(false);
  const cancelled = ["CANCELLED", "FAILED", "REFUNDED"].includes(order.status);
  const currentIdx = orderStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/orders/history"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Order Status</h1>
              <p className="text-sm text-gray-500">#{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 rounded-lg bg-orange-100">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="font-semibold text-gray-900">{ORDER_LABEL[order.status] ?? order.status}</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ₹{Number(order.grandTotal).toLocaleString("en-IN")}
            </p>
          </div>
          {!cancelled && (
            <p className="mt-3 text-sm text-gray-500">
              We&apos;ll share a delivery estimate once your order is on the way.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Order Progress
          </h2>
          {cancelled ? (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-700">
                {ORDER_LABEL[order.status] ?? order.status}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {ORDER_STEPS.map((step, index) => {
                const completed = index < currentIdx || order.status === "DELIVERED";
                const current = index === currentIdx && order.status !== "DELIVERED";
                const isLast = index === ORDER_STEPS.length - 1;
                return (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          completed
                            ? "bg-orange-500 text-white"
                            : current
                              ? "bg-orange-100 text-orange-600 ring-2 ring-orange-500"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {completed ? <CheckCircle className="size-4" /> : <span className="text-xs font-semibold">{index + 1}</span>}
                      </div>
                      {!isLast && <div className={`w-0.5 flex-1 ${completed ? "bg-orange-500" : "bg-gray-100"}`} />}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className={`text-sm ${completed || current ? "font-medium text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {order.items?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity} × {item.foodNameSnapshot}
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{Number(item.lineTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice</h2>
          <OrderInvoiceActions orderId={order.id} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 p-3 text-center font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            <FileWarning className="h-5 w-5" />
            Report Issue
          </button>
        </div>
      </main>

      <OrderReportIssueDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        orderId={order.id}
        orderNumber={order.orderNumber}
      />
    </div>
  );
}
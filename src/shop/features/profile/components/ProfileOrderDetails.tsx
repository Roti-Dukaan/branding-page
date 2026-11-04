"use client";

import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useProfileNavigation } from "../hooks/useProfileNavigation";
import { MENU_ITEMS } from "@shop/lib/data";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { formatPrice } from "@shop/lib/utils";
import { useCartStore } from "@shop/lib/store";
import { toast } from "@shop/lib/toast";
import { OrderInvoiceActions } from "@shop/features/invoice/components/OrderInvoiceActions";
import {
  ArrowLeft,
  RotateCcw,
  MapPin,
  CreditCard,
  Clock,
  Check,
  ChefHat,
  Package,
  Truck,
  CircleCheck,
  CircleX,
} from "lucide-react";

const TIMELINE_STEPS = [
  { key: "received", label: "Order Received", icon: Check },
  { key: "preparing", label: "Preparing Ingredients", icon: ChefHat },
  { key: "cooking", label: "Cooking Fresh", icon: ChefHat },
  { key: "packed", label: "Packed", icon: Package },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CircleCheck },
];

const STATUS_ORDER: Record<string, number> = {
  preparing: 2,
  packed: 4,
  "out-for-delivery": 5,
  delivered: 6,
  cancelled: -1,
};

export function ProfileOrderDetails() {
  const { orders, selectedOrderId } = useProfileStore();
  const { navigateToTab } = useProfileNavigation();
  const addItem = useCartStore((s) => s.addItem);
  const order = orders.find((o) => o.id === selectedOrderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Order not found</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => navigateToTab("orders")}
        >
          <ArrowLeft className="size-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[order.status];
  const isCancelled = order.status === "cancelled";

  const handleReorder = () => {
    order.items.forEach((item) => {
      const menuItem = MENU_ITEMS.find((m) => m.id === item.id);
      if (menuItem) addItem(menuItem, item.quantity);
    });
    toast.success("Items added to cart!");
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateToTab("orders")}
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">
                {order.orderNumber}
              </p>
              <p className="text-sm text-muted-foreground">{order.date}</p>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatPrice(order.total)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent>
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
            Order Status
          </h3>
          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
              <CircleX className="size-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Order Cancelled
                </p>
                <p className="text-xs text-muted-foreground">
                  Refund will be processed in 3-5 business days
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Vertical Line + Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                            ? "bg-primary/20 text-primary ring-2 ring-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StepIcon className="size-4" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 ${
                            isCompleted ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-6 pt-1.5">
                      <p
                        className={`text-sm ${
                          isCompleted || isCurrent
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent>
          <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
            Order Items
          </h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardContent>
          <h3 className="mb-2 font-heading text-base font-semibold text-foreground">
            Delivery Address
          </h3>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {order.deliveryAddress.name} · {order.deliveryAddress.phone}
              </p>
              <p>
                {order.deliveryAddress.house}
                {order.deliveryAddress.apartment
                  ? `, ${order.deliveryAddress.apartment}`
                  : ""}
              </p>
              {order.deliveryAddress.street && (
                <p>{order.deliveryAddress.street}</p>
              )}
              {order.deliveryAddress.area && (
                <p>{order.deliveryAddress.area}</p>
              )}
              <p>
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.state} -{" "}
                {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Delivery Slot */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">
              Delivery Slot
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {order.deliverySlot.label}
                </p>
                <p>{order.deliverySlot.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">
              Payment Method
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-4 text-primary" />
              <p className="font-medium text-foreground">
                {order.paymentMethod === "online"
                  ? "Online Payment"
                  : "Cash on Delivery"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Breakdown */}
      <Card>
        <CardContent>
          <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
            Price Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charge</span>
              <span>
                {order.deliveryCharge === 0
                  ? "FREE"
                  : formatPrice(order.deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(order.total - order.platformFee)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Invoice</h3>
          <OrderInvoiceActions orderId={order.id} />
        </CardContent>
      </Card>

      {/* Reorder Button */}
      {order.status === "delivered" && (
        <div className="flex justify-end">
          <Button onClick={handleReorder}>
            <RotateCcw className="size-4" />
            Reorder
          </Button>
        </div>
      )}
    </div>
  );
}

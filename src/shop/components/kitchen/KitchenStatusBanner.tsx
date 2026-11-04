"use client";

import { Alert, AlertDescription, AlertTitle } from "@shop/components/ui/alert";
import { Info, AlertTriangle, Wrench, Clock } from "lucide-react";
import { useKitchenStatus } from "./KitchenStatusProvider";

const BANNER_CONFIG = {
  BUSY: {
    icon: Clock,
    className: "bg-cream-deep border-amber-200 text-amber-900",
    iconClassName: "text-amber-600",
  },
  CLOSED: {
    icon: AlertTriangle,
    className: "bg-red-50 border-red-200 text-red-900",
    iconClassName: "text-red-600",
  },
  MAINTENANCE: {
    icon: Wrench,
    className: "bg-gray-100 border-gray-300 text-gray-800",
    iconClassName: "text-gray-600",
  },
} as const;

/**
 * Sticky top banner shown to customers based on the kitchen operational status.
 * Renders nothing while OPEN or while status is still loading.
 */
export function KitchenStatusBanner() {
  const { status, data, isLoading } = useKitchenStatus();

  if (isLoading || !status || status === "OPEN") return null;

  const config = BANNER_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;
  const message =
    data?.message ??
    (status === "BUSY"
      ? "Kitchen is currently experiencing high order volume. Orders are still being accepted. Delivery may take approximately 15–20 minutes longer than usual."
      : status === "CLOSED"
        ? "We're closed for today. You can still browse our menu and prepare your cart. We'll be happy to serve you during our next operating hours."
        : "Our kitchen is temporarily unavailable due to maintenance. Please try again shortly.");

  return (
    <div className="sticky top-20 z-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Alert className={`flex items-start gap-3 ${config.className}`} style={{ borderRadius: "0.75rem" }}>
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClassName}`} />
          <div>
            <AlertTitle>
              {status === "BUSY"
                ? "Kitchen is busy"
                : status === "CLOSED"
                  ? "We're closed for today"
                  : "Temporarily unavailable"}
            </AlertTitle>
            <AlertDescription className="mt-0.5 text-[13px] leading-relaxed opacity-90">
              {message}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
}

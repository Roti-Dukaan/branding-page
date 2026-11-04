"use client";

import { AlertTriangle, Wrench } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import type { KitchenStatusValue } from "@shop/hooks/useKitchenStatus";

/**
 * Friendly illustration shown on the checkout review step when the kitchen is
 * CLOSED or in MAINTENANCE. The payment section is hidden and Place Order is
 * disabled — the customer's cart is preserved so they can return later.
 */
export function KitchenClosedIllustration({
  status,
}: {
  status: KitchenStatusValue | undefined;
}) {
  const isMaintenance = status === "MAINTENANCE";
  const Icon = isMaintenance ? Wrench : AlertTriangle;

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Icon className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {isMaintenance ? "Kitchen Temporarily Unavailable" : "Kitchen Closed"}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {isMaintenance
            ? "Our kitchen is temporarily unavailable due to maintenance. Please try again shortly — your cart is safe."
            : "We're currently not accepting new orders. Please visit us again during operating hours. Your cart is safe."}
        </p>
      </CardContent>
    </Card>
  );
}

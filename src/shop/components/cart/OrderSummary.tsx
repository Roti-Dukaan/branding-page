"use client";

import { Separator } from "@shop/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { type ApiPricingBreakdown } from "@shop/lib/types/api";
import { PricingSkeleton } from "./PricingSkeleton";
import { OrderSummaryRow } from "./OrderSummaryRow";
import { TaxBreakdown } from "./TaxBreakdown";
import { GrandTotalCard } from "./GrandTotalCard";

interface OrderSummaryProps {
  pricing: ApiPricingBreakdown | null;
  isLoading?: boolean;
  /** Render the "Order Summary" heading. Set false when the parent already shows one. */
  showHeading?: boolean;
  className?: string;
}

export function OrderSummary({
  pricing,
  isLoading = false,
  showHeading = true,
  className,
}: OrderSummaryProps) {
  if (isLoading || !pricing) {
    return <PricingSkeleton />;
  }

  const {
    subtotal,
    cgstRate,
    sgstRate,
    cgstAmount,
    sgstAmount,
    gstAmount,
    igstAmount,
    isInterState,
    deliveryCharge,
    packagingCharge,
    discount,
    grandTotal,
  } = pricing;

  const hasTax = gstAmount > 0;
  const showPackaging = packagingCharge > 0;
  const showDiscount = discount > 0;

  return (
    <div className={className}>
      {showHeading && (
        <h3 className="text-xl font-bold text-foreground mb-6 pb-4 border-b border-border">
          Order Summary
        </h3>
      )}

      <div className="space-y-1">
        <OrderSummaryRow label="Items Total" value={subtotal} muted={false} />

        {hasTax && (
          <TaxBreakdown
            cgstRate={cgstRate}
            sgstRate={sgstRate}
            cgstAmount={cgstAmount}
            sgstAmount={sgstAmount}
            igstAmount={igstAmount}
            gstAmount={gstAmount}
            isInterState={isInterState}
          />
        )}

        <OrderSummaryRow
          label="Delivery Charges"
          value={deliveryCharge}
          free={deliveryCharge === 0}
        />

        {showPackaging && (
          <OrderSummaryRow label="Packaging Charges" value={packagingCharge} />
        )}

        {showDiscount && (
          <OrderSummaryRow label="Coupon Discount" value={discount} sign="minus" />
        )}
      </div>

      <Separator className="my-4" />

      <GrandTotalCard value={grandTotal} label="Total Payable" />
    </div>
  );
}

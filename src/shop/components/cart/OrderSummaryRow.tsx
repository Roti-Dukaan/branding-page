"use client";

import { cn } from "@shop/lib/utils";
import { PriceDisplay } from "./PriceDisplay";

interface OrderSummaryRowProps {
  label: string;
  value: number;
  free?: boolean;
  sign?: "none" | "minus";
  muted?: boolean;
  className?: string;
}

export function OrderSummaryRow({
  label,
  value,
  free = false,
  sign = "none",
  muted = true,
  className,
}: OrderSummaryRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2.5", className)}>
      <span className={cn("text-sm", muted ? "text-muted-foreground" : "text-foreground")}>
        {label}
      </span>
      <PriceDisplay
        value={value}
        free={free}
        sign={sign}
        className={cn(
          "text-sm font-medium",
          muted ? "text-muted-foreground" : "text-foreground"
        )}
      />
    </div>
  );
}

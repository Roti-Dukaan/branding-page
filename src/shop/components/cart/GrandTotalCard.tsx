"use client";

import { PriceDisplay } from "./PriceDisplay";
import { cn } from "@shop/lib/utils";

interface GrandTotalCardProps {
  value: number;
  label?: string;
  className?: string;
}

export function GrandTotalCard({
  value,
  label = "Total Payable",
  className,
}: GrandTotalCardProps) {
  return (
    <div className={cn("flex items-baseline justify-between pt-3", className)}>
      <span className="text-base font-semibold text-foreground">{label}</span>
      <PriceDisplay value={value} className="text-2xl font-bold text-primary" />
    </div>
  );
}

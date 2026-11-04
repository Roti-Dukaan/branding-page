"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@shop/lib/utils";

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface PriceDisplayProps {
  value: number;
  /** When true and value is 0, render "FREE" in green instead of ₹0.00. */
  free?: boolean;
  /** Prefix a minus sign (used for discounts). */
  sign?: "none" | "minus";
  className?: string;
}

export function PriceDisplay({
  value,
  free = false,
  sign = "none",
  className,
}: PriceDisplayProps) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatINR(Math.round(v * 100) / 100));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.35, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  if (free && value === 0) {
    return (
      <span className={cn("font-semibold text-green-600", className)}>FREE</span>
    );
  }

  const prefix = sign === "minus" ? "-" : "";

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{text}</motion.span>
    </span>
  );
}

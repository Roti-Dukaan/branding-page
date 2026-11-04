"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@shop/lib/utils";
import { OrderSummaryRow } from "./OrderSummaryRow";

interface TaxBreakdownProps {
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstAmount: number;
  isInterState: boolean;
}

export function TaxBreakdown({
  cgstRate,
  sgstRate,
  cgstAmount,
  sgstAmount,
  igstAmount,
  gstAmount,
  isInterState,
}: TaxBreakdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Collapse tax breakdown" : "Expand tax breakdown"}
        className="flex w-full items-center justify-between gap-4 rounded-md py-2.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span>Tax Breakdown</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-1">
              {isInterState ? (
                <>
                  <OrderSummaryRow
                    label={`IGST (${(cgstRate + sgstRate).toFixed(2)}%)`}
                    value={igstAmount}
                  />
                  <OrderSummaryRow label="GST Total" value={gstAmount} />
                </>
              ) : (
                <>
                  <OrderSummaryRow label={`CGST (${cgstRate.toFixed(2)}%)`} value={cgstAmount} />
                  <OrderSummaryRow label={`SGST (${sgstRate.toFixed(2)}%)`} value={sgstAmount} />
                  <OrderSummaryRow label="GST Total" value={gstAmount} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

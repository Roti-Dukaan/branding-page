"use client";

import { motion } from "motion/react";
import { useCartStore } from "@shop/lib/store";
import { formatPrice } from "@shop/lib/utils";
import { ProductDetails } from "@shop/lib/types";

interface PriceSummaryProps {
  price: number;
  quantity: number;
}

export default function PriceSummary({ price, quantity }: PriceSummaryProps) {
  const items = useCartStore((s) => s.items);
  const deliveryCharge = 0;
  const total = price * quantity + deliveryCharge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-muted/30 rounded-xl p-5 border border-border space-y-3"
    >
      <h3 className="text-sm font-bold text-foreground">Price Summary</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Item Price</span>
          <span className="font-medium text-foreground">
            {formatPrice(price)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-medium text-foreground">{quantity}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {formatPrice(price * quantity)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Delivery Charges</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Total</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

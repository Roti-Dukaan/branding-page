"use client";

import { Minus, Plus } from "lucide-react";
import { useQuickViewStore } from "@shop/lib/stores/quick-view-store";
import { motion } from "motion/react";

export default function QuantitySelector() {
  const quantity = useQuickViewStore((s) => s.quantity);
  const setQuantity = useQuickViewStore((s) => s.setQuantity);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Quantity
      </span>
      <div className="flex items-center border border-border rounded-xl overflow-hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </motion.button>
        <motion.span
          key={quantity}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-10 text-center text-sm font-bold"
        >
          {quantity}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(quantity + 1)}
          className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

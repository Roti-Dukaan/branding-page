"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@shop/lib/store";
import { MenuItem, MenuItemVariant } from "@shop/lib/types";
import { cn } from "@shop/lib/utils";
import { Price } from "@shop/components/ui/price";
import { cartLineId } from "@shop/lib/cart-line-id";
import { defaultVariant, variantUnitPrice } from "@shop/lib/menu-variants";
import { FoodVariantSelector } from "@shop/components/menu/FoodVariantSelector";

interface AddToCartButtonProps {
  item: MenuItem;
  className?: string;
  showPrice?: boolean;
}

export default function AddToCartButton({ item, className, showPrice = true }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const variants = item.variants ?? [];
  const initialVariant = useMemo(() => defaultVariant(variants), [variants]);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(initialVariant);
  const [pickerOpen, setPickerOpen] = useState(false);
  const lineId = cartLineId(item.id, selectedVariant?.id);
  const quantity = useCartStore((s) => {
    if (variants.length === 0) {
      return s.items.find((i) => i.id === item.id)?.quantity || 0;
    }
    return s.items
      .filter((i) => i.foodItemId === item.id)
      .reduce((sum, line) => sum + line.quantity, 0);
  });
  const lineQuantity = useCartStore((s) => s.items.find((i) => i.id === lineId)?.quantity || 0);
  const unitPrice = selectedVariant ? variantUnitPrice(selectedVariant) : item.price;

  const handleAdd = () => {
    if (variants.length > 0 && !selectedVariant) {
      setPickerOpen(true);
      return;
    }
    if (variants.length > 0) {
      setPickerOpen(true);
      return;
    }
    addItem(item, 1);
  };

  const confirmVariantAdd = () => {
    if (!selectedVariant) return;
    addItem(item, 1, selectedVariant);
    setPickerOpen(false);
  };

  const handleIncrement = () => {
    if (variants.length > 0) {
      if (!selectedVariant) {
        setPickerOpen(true);
        return;
      }
      updateQuantity(lineId, lineQuantity + 1);
      return;
    }
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (variants.length > 0) {
      if (!selectedVariant || lineQuantity <= 0) return;
      updateQuantity(lineId, lineQuantity <= 1 ? 0 : lineQuantity - 1);
      return;
    }
    if (quantity <= 1) {
      updateQuantity(item.id, 0);
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {pickerOpen && variants.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <FoodVariantSelector
            variants={variants}
            selectedId={selectedVariant?.id}
            onSelect={setSelectedVariant}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmVariantAdd}
              disabled={!selectedVariant}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        {showPrice && (
          <Price value={unitPrice} className="text-sm font-bold text-foreground shrink-0" />
        )}
        <AnimatePresence mode="wait">
          {quantity === 0 ? (
            <motion.button
              key="add-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {variants.length > 0 ? "CHOOSE" : "ADD"}
            </motion.button>
          ) : (
            <motion.div
              key="quantity-controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center bg-primary rounded-xl overflow-hidden shadow-sm h-8"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer shrink-0"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <motion.span
                key={quantity}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-1 text-center text-sm font-bold text-white min-w-[2rem]"
              >
                {quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer shrink-0"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

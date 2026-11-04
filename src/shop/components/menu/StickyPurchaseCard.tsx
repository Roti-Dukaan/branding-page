"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Minus, Plus, Zap, Truck } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { useCartStore } from "@shop/lib/store";
import { ProductDetails } from "@shop/lib/types";
import { formatPrice } from "@shop/lib/utils";
import { FoodVariantSelector } from "./FoodVariantSelector";
import { cartLineId } from "@shop/lib/cart-line-id";
import { defaultVariant, variantUnitPrice } from "@shop/lib/menu-variants";
import type { MenuItemVariant } from "@shop/lib/types";

interface StickyPurchaseCardProps {
  product: ProductDetails;
}

export default function StickyPurchaseCard({
  product,
}: StickyPurchaseCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const variants = product.variants ?? [];
  const initialVariant = useMemo(
    () => defaultVariant(variants),
    [variants]
  );
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    initialVariant
  );
  const lineId = cartLineId(product.id, selectedVariant?.id);
  const quantity = useCartStore((s) => s.items.find((i) => i.id === lineId)?.quantity || 0);
  const unitPrice = selectedVariant ? variantUnitPrice(selectedVariant) : product.price;
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) return;
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 250));
    addItem(product, 1, selectedVariant);
    setIsAdding(false);
  };

  const handleIncrement = () => {
    updateQuantity(lineId, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      updateQuantity(lineId, 0);
    } else {
      updateQuantity(lineId, quantity - 1);
    }
  };

  return (
    <>
      {/* Desktop - Inline card */}
      <div className="hidden lg:block">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          {variants.length > 0 && (
            <FoodVariantSelector
              variants={variants}
              selectedId={selectedVariant?.id}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Delivery estimate */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            <span>Estimated delivery: <span className="font-semibold text-foreground">35–45 min</span></span>
          </div>

          {/* Price display - only when items in cart */}
          {quantity > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(unitPrice * quantity)}
              </span>
              {quantity > 1 && (
                <span className="text-sm text-muted-foreground">
                  ({formatPrice(unitPrice)} × {quantity})
                </span>
              )}
            </div>
          )}

          {/* Add to cart / Quantity controls */}
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                {isAdding ? "Adding..." : "ADD TO CART"}
              </motion.button>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-sm">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecrement}
                    className="w-11 h-11 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-10 text-center text-sm font-bold text-white"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncrement}
                    className="w-11 h-11 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile - Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm min-h-[48px]"
              >
                <ShoppingBag className="h-4 w-4" />
                {isAdding ? "Adding..." : "ADD"}
              </motion.button>
            ) : (
              <motion.div
                key="controls-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 flex-1"
              >
                <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={handleDecrement}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <motion.span
                    key={quantity}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-8 text-center text-sm font-bold text-white"
                  >
                    {quantity}
                  </motion.span>
                  <button
                    onClick={handleIncrement}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-primary/80 transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-base font-bold text-foreground">
                  {formatPrice(product.price * quantity)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

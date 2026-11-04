"use client";

import { cn, formatPrice } from "@shop/lib/utils";
import type { MenuItemVariant } from "@shop/lib/types";

interface FoodVariantSelectorProps {
  variants: MenuItemVariant[];
  selectedId?: string;
  onSelect: (variant: MenuItemVariant) => void;
  className?: string;
}

export function FoodVariantSelector({
  variants,
  selectedId,
  onSelect,
  className,
}: FoodVariantSelectorProps) {
  if (!variants.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold text-foreground">Choose variant</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              )}
            >
              <span className="font-semibold">{variant.name}</span>
              <span className="ml-2 text-muted-foreground">
                {formatPrice(variant.displayPrice ?? variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

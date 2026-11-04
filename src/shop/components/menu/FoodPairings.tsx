"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@shop/components/ui/button";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartStore } from "@shop/lib/store";
import { MenuItem } from "@shop/lib/types";
import Image from "next/image";

interface Pairing {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FoodPairingsProps {
  pairings: Pairing[];
}

export default function FoodPairings({ pairings }: FoodPairingsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuickAdd = (item: Pairing) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: true,
        category: "",
        description: item.name,
      } as MenuItem,
      1
    );
    setQuantities((q) => ({ ...q, [item.id]: 1 }));
  };

  const handleIncrement = (item: Pairing) => {
    const next = (quantities[item.id] || 0) + 1;
    setQuantities((q) => ({ ...q, [item.id]: next }));
    updateQuantity(item.id, next);
  };

  const handleDecrement = (item: Pairing) => {
    const current = quantities[item.id] || 1;
    const next = Math.max(0, current - 1);
    setQuantities((q) => ({ ...q, [item.id]: next }));
    if (next === 0) {
      useCartStore.getState().removeItem(item.id);
    } else {
      updateQuantity(item.id, next);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Best Paired With
      </h4>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {pairings.map((pair, index) => {
          const qty = quantities[pair.id] || 0;
          return (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl p-2 min-w-[200px]"
            >
              <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={pair.image}
                  alt={pair.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {pair.name}
                </p>
                <p className="text-xs font-bold text-primary">
                  ₹{pair.price}
                </p>
              </div>
              {qty === 0 ? (
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => handleQuickAdd(pair)}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 rounded-md"
                    onClick={() => handleDecrement(pair)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-bold w-4 text-center">{qty}</span>
                  <Button
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={() => handleIncrement(pair)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

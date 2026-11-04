"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@shop/lib/store";
import { useQuickViewStore } from "@shop/lib/stores/quick-view-store";
import { formatPrice } from "@shop/lib/utils";
import QuantitySelector from "./QuantitySelector";
import DeliveryInfoCard from "./DeliveryInfoCard";
import ShareButton from "@shop/components/ui/ShareButton";
import Image from "next/image";
import type { ApiProduct } from "@shop/lib/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FoodQuickViewModal() {
  const { selectedItem, isOpen, close, quantity } = useQuickViewStore();
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [details, setDetails] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedItem || !isOpen) {
      setDetails(null);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/v1/products/${selectedItem.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDetails(data?.data || null))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [selectedItem, isOpen]);

  const handleAddToCart = async () => {
    if (!selectedItem) return;
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 400));
    addItem(selectedItem, quantity);
    setIsAdding(false);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="!max-w-none md:!max-w-[1100px] lg:!max-w-[1100px] !h-[95vh] !overflow-hidden !p-0 !rounded-2xl sm:!rounded-3xl w-[calc(100%-2rem)]">
        <AnimatePresence mode="wait">
          {selectedItem && loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : selectedItem && details ? (
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col h-[95vh]"
            >
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-64 sm:h-72 md:h-auto md:min-h-[520px] bg-muted/30 shrink-0">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-5 h-5 border-2 ${
                        selectedItem.isVeg ? "border-green-600" : "border-red-600"
                      } flex items-center justify-center p-[2px] bg-white rounded-sm shadow-sm`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedItem.isVeg ? "bg-green-600" : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <ShareButton itemName={selectedItem.name} itemSlug={selectedItem.slug} />
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <div className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto overscroll-y-contain scroll-smooth scrollbar-thin">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-foreground leading-tight">
                        {selectedItem.name}
                      </DialogTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(selectedItem.price)}
                        </span>
                      </div>
                    </DialogHeader>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {details.description || details.shortDescription || "No description available."}
                      </p>
                    </div>

                    <DeliveryInfoCard />

                    <div className="flex items-center justify-between pt-2">
                      <QuantitySelector />
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                          Total
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(selectedItem.price * quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border p-4 sm:p-6 flex items-center justify-between gap-3 shrink-0 bg-background">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        Total
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {formatPrice(selectedItem.price * quantity)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={close}
                        className="text-xs font-semibold"
                      >
                        Continue Browsing
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="text-xs font-semibold"
                      >
                        {isAdding ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="mr-1.5 inline-block"
                          >
                            ⟳
                          </motion.span>
                        ) : (
                          <ShoppingBag className="h-4 w-4 mr-1.5" />
                        )}
                        {isAdding ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Select an item to preview.
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

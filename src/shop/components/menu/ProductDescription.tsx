"use client";

import { motion } from "motion/react";
import { ProductDetails } from "@shop/lib/types";

interface ProductDescriptionProps {
  product: ProductDetails;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-4"
    >
      {/* About This Dish */}
      <div className="bg-card rounded-xl border border-border/60 p-4">
        <h2 className="text-sm font-bold text-foreground mb-2">
          About This Dish
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.longDescription}
        </p>
      </div>

      {/* Highlights row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <h3 className="text-xs font-bold text-primary mb-1">
            Why Customers Love It
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Made with fresh, high-quality ingredients and traditional recipes.
            Each dish is prepared with care to bring you the authentic taste of
            homemade food.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-xs font-bold text-green-800 mb-1">
            Freshness Promise
          </h3>
          <p className="text-xs text-green-700 leading-relaxed">
            Prepared fresh after your order. No preservatives, no pre-cooked
            food. Made with love, just like homemade.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

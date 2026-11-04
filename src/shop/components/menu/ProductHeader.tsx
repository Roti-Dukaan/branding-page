"use client";

import { motion } from "motion/react";
import { Clock, Users, TrendingUp } from "lucide-react";
import { ProductDetails } from "@shop/lib/types";
import { formatPrice } from "@shop/lib/utils";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";

interface ProductHeaderProps {
  product: ProductDetails;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="space-y-3"
    >
      {/* Top row: Name + Price + Rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {product.category}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Info pills row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-100">
          <Clock className="h-3 w-3" />
          {product.preparationTime}
        </div>
        <div className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
          <Users className="h-3 w-3" />
          {product.servings}
        </div>
        <div className="inline-flex items-center gap-1.5 bg-cream-deep text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-100">
          <TrendingUp className="h-3 w-3" />
          {product.mockOrders}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {product.shortDescription}
      </p>

      {/* Availability + Add to cart */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              product.availability === "available"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              product.availability === "available"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {product.availability === "available" ? "In stock" : "Unavailable"}
          </span>
        </div>
        <AddToCartButton item={product} showPrice={false} />
      </div>
    </motion.div>
  );
}

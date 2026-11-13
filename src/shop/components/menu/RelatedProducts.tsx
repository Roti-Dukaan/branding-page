"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CatalogImage } from "@shop/components/ui/CatalogImage";
import { ProductDetails } from "@shop/lib/types";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";

interface RelatedProductsProps {
  products: ProductDetails[];
  currentSlug: string;
}

export default function RelatedProducts({
  products,
  currentSlug,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-foreground">
          You May Also Like
        </h2>
        <Link
          href="/menu"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.slice(0, 4).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <Link href={`/menu/${product.slug}/view`}>
              <div className="relative h-36 overflow-hidden">
                <CatalogImage
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute top-2 left-2">
                  <div
                    className={`w-4 h-4 border-[1.5px] flex items-center justify-center p-[2px] bg-white rounded-sm ${
                      product.isVeg ? "border-green-600" : "border-red-600"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        product.isVeg ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-3 pb-0">
              <Link href={`/menu/${product.slug}/view`}>
                <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
            </div>

            <div className="px-3 pb-3 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                ₹{product.price}
              </span>
              <AddToCartButton item={product} showPrice={false} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

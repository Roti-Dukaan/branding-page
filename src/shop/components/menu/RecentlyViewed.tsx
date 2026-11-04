"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, getProductBySlug, resolveImageUrl } from "@shop/lib/product-utils";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";
import type { ApiProduct } from "@shop/lib/types/api";

interface RecentlyViewedProps {
  currentSlug: string;
}

export default function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    const slugs = getRecentlyViewed();
    const filtered = slugs.filter((s) => s !== currentSlug);
    if (filtered.length === 0) return;

    Promise.all(filtered.map((s) => getProductBySlug(s)))
      .then((results) => {
        setProducts(results.filter((p): p is ApiProduct => p !== null).slice(0, 6));
      })
      .catch(() => setProducts([]));
  }, [currentSlug]);

  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-5">
        Recently Viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="min-w-[170px] max-w-[170px] bg-card rounded-xl border border-border overflow-hidden shrink-0 group hover:shadow-md transition-shadow"
          >
            <Link href={`/menu/${product.slug}/view`}>
              <div className="relative h-24 overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="170px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <div
                    className={`w-3.5 h-3.5 border-[1.5px] flex items-center justify-center p-[1.5px] bg-white rounded-sm ${
                      product.isVeg ? "border-green-600" : "border-red-600"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.isVeg ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-2.5 pb-0">
              <Link href={`/menu/${product.slug}/view`}>
                <h3 className="text-xs font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
            </div>

            <div className="px-2.5 pb-2.5 pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                ₹{product.discountPrice || product.price}
              </span>
              <AddToCartButton
                item={{
                  id: product.id,
                  name: product.name,
                  price: product.discountPrice || product.price,
                  image: product.imageUrl ? resolveImageUrl(product.imageUrl) : "",
                  isVeg: product.isVeg,
                  description: product.shortDescription || "",
                  category: "",
                }}
                showPrice={false}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

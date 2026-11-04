"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { PairingItem, MenuItem } from "@shop/lib/types";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";

interface PairWithSectionProps {
  pairings: PairingItem[];
  currentProductSlug: string;
}

export default function PairWithSection({
  pairings,
  currentProductSlug,
}: PairWithSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-4">
      <h2 className="text-sm font-bold text-foreground mb-3">
        Best Paired With
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
        {pairings.map((pairing, index) => (
          <motion.div
            key={pairing.id}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="min-w-[170px] max-w-[170px] bg-background rounded-xl border border-border/60 overflow-hidden shrink-0 group hover:shadow-sm transition-shadow"
          >
            <Link href={`/menu/${pairing.slug}/view`}>
              <div className="relative h-24 overflow-hidden">
                <Image
                  src={pairing.image}
                  alt={pairing.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-400"
                  sizes="170px"
                />
                <div
                  className={`absolute top-1.5 left-1.5 w-4 h-4 border-[1.5px] flex items-center justify-center p-[1.5px] bg-white rounded-sm ${
                    pairing.isVeg ? "border-green-600" : "border-red-600"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      pairing.isVeg ? "bg-green-600" : "bg-red-600"
                    }`}
                  />
                </div>
              </div>
            </Link>

            <div className="p-2.5 space-y-1.5">
              <Link href={`/menu/${pairing.slug}/view`}>
                <h3 className="text-xs font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {pairing.name}
                </h3>
              </Link>
              <AddToCartButton
                item={
                  {
                    id: pairing.id,
                    name: pairing.name,
                    price: pairing.price,
                    image: pairing.image,
                    isVeg: pairing.isVeg,
                    category: "",
                    description: pairing.name,
                  } as MenuItem
                }
                showPrice={false}
                className="w-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

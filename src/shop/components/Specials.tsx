"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { formatPrice } from "@shop/lib/utils";
import { useFeaturedFoods } from "@shop/hooks/api/use-menu";
import { resolveImageUrl } from "@shop/lib/product-utils";

const BADGE_STYLES: Record<string, string> = {
  "Chef Special": "bg-cream-deep0/10 text-amber-700 border-amber-200",
  Popular: "bg-blue-500/10 text-blue-700 border-blue-200",
  "Best Seller": "bg-green-500/10 text-green-700 border-green-200",
};

export default function Specials() {
  const { data: specials = [], isLoading } = useFeaturedFoods();

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Chef&apos;s Picks
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Today&apos;s Specials
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (specials.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Chef&apos;s Picks
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Today&apos;s Specials
            </h2>
            <p className="text-muted-foreground text-base">
              Handpicked favorites that our customers can&apos;t stop ordering.
              Fresh, flavorful, and made just for you.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {specials.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-56 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-full bg-cream-deep0/10 text-amber-700 border-amber-200`}
                    >
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div
                      className={`w-5 h-5 border-2 ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      } flex items-center justify-center p-[2px] bg-white rounded-sm`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.isVeg ? "bg-green-600" : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {item.shortDescription || "Delicious homemade dish made with love."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(item.price)}
                    </span>
                    <Link href={`/menu/${item.slug}/view`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                        Order Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

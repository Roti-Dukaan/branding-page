"use client";

import { motion } from "motion/react";
import { Leaf, Flame, Heart, Truck, Shield, Repeat } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { WHY_CHOOSE_US } from "@shop/lib/data";

const ICON_MAP: Record<string, React.ElementType> = {
  Leaf,
  Flame,
  Heart,
  Truck,
  Shield,
  Repeat,
};

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Why Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Why Choose Roti Dukaan
            </h2>
            <p className="text-muted-foreground text-base">
              We&apos;re committed to delivering the taste of home, fresh to your
              doorstep. Here&apos;s what makes us different.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || Leaf;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

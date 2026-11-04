"use client";

import { motion } from "motion/react";
import { UtensilsCrossed, CreditCard, ChefHat, Truck } from "lucide-react";
import { HOW_IT_WORKS } from "@shop/lib/data";

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed,
  CreditCard,
  ChefHat,
  Truck,
};

export default function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base">
              Getting delicious homemade food delivered is as easy as 1-2-3-4.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="absolute top-12 left-[15%] right-[15%] h-[2px] bg-border hidden lg:block" />

          {HOW_IT_WORKS.map((step, index) => {
            const Icon = ICON_MAP[step.icon] || UtensilsCrossed;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-flex mb-6">
                  <div className="h-24 w-24 rounded-2xl bg-background border-2 border-primary/20 flex items-center justify-center relative z-10 bg-card">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold z-20">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Flame, Home, ShieldCheck, Heart, Sun } from "lucide-react";

const PROMISES = [
  {
    icon: Flame,
    title: "Freshly Cooked",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Home,
    title: "Homemade",
    color: "text-amber-500",
    bgColor: "bg-cream-deep",
  },
  {
    icon: ShieldCheck,
    title: "No Preservatives",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Heart,
    title: "Healthy Ingredients",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Sun,
    title: "Made Daily",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
];

export default function CustomerPromise() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {PROMISES.map((promise, index) => {
        const Icon = promise.icon;
        return (
          <motion.div
            key={promise.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={`${promise.bgColor} rounded-xl p-4 text-center border border-border/30`}
          >
            <Icon className={`h-5 w-5 ${promise.color} mx-auto mb-1.5`} />
            <h3 className="text-xs font-bold text-foreground">
              {promise.title}
            </h3>
          </motion.div>
        );
      })}
    </div>
  );
}

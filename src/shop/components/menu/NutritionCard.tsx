"use client";

import { motion } from "motion/react";
import { Flame, Beef, Wheat, Droplets, Leaf, Scale } from "lucide-react";
import { NutritionInfo } from "@shop/lib/types";

interface NutritionCardProps {
  nutrition: NutritionInfo;
}

const nutritionItems = [
  {
    key: "calories",
    label: "Calories",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    key: "protein",
    label: "Protein",
    icon: Beef,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    key: "carbs",
    label: "Carbs",
    icon: Wheat,
    color: "text-amber-500",
    bgColor: "bg-cream-deep",
  },
  {
    key: "fat",
    label: "Fat",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    key: "fiber",
    label: "Fiber",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export default function NutritionCard({ nutrition }: NutritionCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">
          Nutrition Information
        </h2>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Scale className="h-3 w-3" />
          {nutrition.servingSize}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {nutritionItems.map((item, index) => {
          const Icon = item.icon;
          const value = nutrition[item.key as keyof NutritionInfo];
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`${item.bgColor} rounded-lg p-2.5 text-center`}
            >
              <Icon className={`h-4 w-4 ${item.color} mx-auto mb-1`} />
              <p className="text-xs font-bold text-foreground">{String(value)}</p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

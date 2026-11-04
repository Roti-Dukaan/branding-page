"use client";

import { motion } from "motion/react";
import {
  Wheat,
  Leaf,
  Heart,
  Beef,
  Home,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { HealthTag } from "@shop/lib/types";

interface HealthTagsProps {
  healthTags: HealthTag[];
}

const TAG_CONFIG: Record<
  HealthTag,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  "high-fiber": {
    label: "High Fiber",
    icon: Wheat,
    color: "text-amber-700",
    bgColor: "bg-cream-deep",
    borderColor: "border-amber-200",
  },
  "gluten-free": {
    label: "Gluten-Free",
    icon: ShieldCheck,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  healthy: {
    label: "Healthy",
    icon: Heart,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  "protein-rich": {
    label: "Protein Rich",
    icon: Beef,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  homemade: {
    label: "Homemade",
    icon: Home,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  "fresh-daily": {
    label: "Fresh Daily",
    icon: Sun,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  "no-preservatives": {
    label: "No Preservatives",
    icon: Leaf,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
};

export default function HealthTags({ healthTags }: HealthTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {healthTags.map((tag, index) => {
        const config = TAG_CONFIG[tag];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bgColor} ${config.color} ${config.borderColor}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </motion.div>
        );
      })}
    </div>
  );
}

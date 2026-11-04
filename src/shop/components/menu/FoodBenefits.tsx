"use client";

import { Badge } from "@shop/components/ui/badge";

interface FoodBenefitsProps {
  benefits: string[];
}

export default function FoodBenefits({ benefits }: FoodBenefitsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {benefits.map((benefit) => (
        <Badge
          key={benefit}
          variant="secondary"
          className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10"
        >
          {benefit}
        </Badge>
      ))}
    </div>
  );
}

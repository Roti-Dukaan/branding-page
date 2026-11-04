"use client";

import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { cn } from "@shop/lib/utils";
import type { SubscriptionPackage } from "../types/package";
import {
  cardPriceAmount,
  cardPriceSuffix,
  cardSubtitle,
  durationChipLabels,
  heroImage,
  showStartsFromPrice,
} from "../utils/package-display";

type SubscriptionPlanCardProps = {
  package: SubscriptionPackage;
  onTap: () => void;
};

export function SubscriptionPlanCard({ package: pkg, onTap }: SubscriptionPlanCardProps) {
  const badge = pkg.badge?.trim();
  const chips = durationChipLabels(pkg);
  const startsFrom = showStartsFromPrice(pkg);
  const image = heroImage(pkg);
  const suffix = cardPriceSuffix(pkg);

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-lg",
        badge && "ring-2 ring-primary shadow-lg shadow-primary/10",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary/10">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={pkg.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="size-10 text-primary/60" />
          </div>
        )}
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {cardSubtitle(pkg)}
          </p>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((label) => (
              <span
                key={label}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-4">
          <div>
            {startsFrom && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Starts from
              </p>
            )}
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {cardPriceAmount(pkg)}
              </span>
              {suffix ? <span className="pb-1 text-sm text-muted-foreground">{suffix}</span> : null}
            </div>
          </div>

          <Button className="w-full" onClick={onTap}>
            View Plan
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

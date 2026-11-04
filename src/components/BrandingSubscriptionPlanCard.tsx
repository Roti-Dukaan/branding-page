"use client";

import { ArrowRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import type { SubscriptionPackage } from "@shop/features/subscriptions/types/package";
import {
  cardPriceAmount,
  cardPriceSuffix,
  cardSubtitle,
  durationChipLabels,
  heroImage,
  showStartsFromPrice,
} from "@shop/features/subscriptions/utils/package-display";

type Props = {
  package: SubscriptionPackage;
  href: string;
};

/** Same typography as shop plan cards; colours come from customer-web theme tokens. */
export function BrandingSubscriptionPlanCard({ package: pkg, href }: Props) {
  const badge = pkg.badge?.trim();
  const chips = durationChipLabels(pkg);
  const startsFrom = showStartsFromPrice(pkg);
  const image = heroImage(pkg);
  const suffix = cardPriceSuffix(pkg);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sand/70 bg-white/90 shadow-[0_20px_40px_-28px_rgba(74,37,18,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(74,37,18,0.5)]">
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
          <span className="absolute left-3 top-3 rounded-full bg-saffron px-3 py-1 text-[11px] font-semibold text-cream shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {cardSubtitle(pkg)}
          </p>
        </div>

        {chips.length > 0 ? (
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
        ) : null}

        <div className="mt-auto space-y-4">
          <div>
            {startsFrom ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Starts from
              </p>
            ) : null}
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {cardPriceAmount(pkg)}
              </span>
              {suffix ? (
                <span className="pb-1 text-sm text-muted-foreground">{suffix}</span>
              ) : null}
            </div>
          </div>

          <Link
            href={href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-6px_rgba(31,90,46,0.55)] transition hover:opacity-95"
          >
            View Plan
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

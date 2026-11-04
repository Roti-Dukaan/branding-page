"use client";

import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { Badge } from "@shop/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { subscriptionsApi } from "../services/subscriptions.api";
import { PlanDescription } from "./PlanDescription";
import type { SubscriptionPlan } from "../types/subscription";
import { PLAN_TYPE_LABELS } from "../types/subscription";
import type { PackageCategory } from "../types/package";

const CATEGORY_LABELS: Record<string, string> = {
  ROTI: "Rotis",
  CURRY: "Curries",
  ADDON: "Add-ons",
};

interface PlanMenuDialogProps {
  plan: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanMenuDialog({ plan, open, onOpenChange }: PlanMenuDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<PackageCategory[]>([]);

  useEffect(() => {
    if (!open || !plan) {
      setCategories([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    subscriptionsApi
      .getPackageById(plan.id)
      .then((detail) => {
        if (cancelled) return;
        setCategories((detail.categories ?? []).filter((c) => c.active !== false));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load menu for this plan.");
        setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, plan]);

  const cycle = plan ? PLAN_TYPE_LABELS[plan.billingCycle ?? plan.type] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UtensilsCrossed className="size-4 text-primary" />
            {plan?.name ?? "Plan menu"}
          </DialogTitle>
          {plan?.description?.trim() ? (
            <PlanDescription
              description={plan.description}
              className="text-sm text-muted-foreground"
            />
          ) : (
            <DialogDescription>
              {`Included menu items for this ${cycle.toLowerCase()} plan.`}
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading menu…
          </div>
        ) : error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Menu items for this plan will appear here once configured by our team.
          </p>
        ) : (
          <ul className="space-y-4">
            {categories.map((cat) => {
              const label =
                cat.categoryName ??
                (cat.category ? CATEGORY_LABELS[cat.category] : undefined) ??
                cat.category ??
                "Category";
              const items = (cat.menuItems ?? [])
                .map((link) => link.menuItem?.name)
                .filter(Boolean) as string[];

              return (
                <li key={cat.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{label}</p>
                    {cat.includedQuantityPerDelivery != null && cat.includedQuantityPerDelivery > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Up to {cat.maximumQuantityPerDelivery ?? cat.includedQuantityPerDelivery} / delivery
                      </span>
                    )}
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {items.map((name) => (
                        <Badge key={name} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Menu items will be added for this category soon.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

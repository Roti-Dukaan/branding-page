"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { toast } from "@shop/lib/toast";
import { subscriptionsApi } from "../services/subscriptions.api";
import type { PlanMealSlot, WeeklyMenuOverride } from "../types/package";
import {
  buildInitialMenuDraft,
  categoryLabelFor,
  categoryMaxTotal,
  effectiveMaxChoices,
  groupMenuOptions,
  maxQtyForItem,
  remainingCategoryQty,
  sanitizeDraftForSave,
  type MenuOption,
} from "../utils/menu-selection-utils";
import { weeklyMenuOverrideFromDraft } from "../utils/weekly-menu-override";

function QuantityStepper({
  value,
  min,
  max,
  onDecrease,
  onIncrease,
}: {
  value: number;
  min: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        disabled={value <= min}
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[1.25rem] px-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        disabled={value >= max}
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function formatDayTitle(dayKey: string) {
  const key = dayKey.trim().toLowerCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export interface PackagePreviewMenuDialogProps {
  packageId: string;
  dayKey: string;
  mealSlot: PlanMealSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingOverride?: WeeklyMenuOverride | null;
  onSaved: (override: WeeklyMenuOverride) => void;
}

export function PackagePreviewMenuDialog({
  packageId,
  dayKey,
  mealSlot,
  open,
  onOpenChange,
  existingOverride,
  onSaved,
}: PackagePreviewMenuDialogProps) {
  const [loading, setLoading] = useState(false);
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [categoryHints, setCategoryHints] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setMenuOptions([]);
      setDraft({});
      setCategoryHints({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    subscriptionsApi
      .getPackagePreviewMenu(packageId, dayKey, mealSlot.id)
      .then((preview) => {
        if (cancelled) return;
        const options = (preview.menuOptions ?? []) as MenuOption[];
        setMenuOptions(options);
        const fromOverride = existingOverride?.items ?? [];
        const initial = buildInitialMenuDraft(
          options,
          fromOverride.length
            ? fromOverride.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
            : (preview.selectedItems ?? []).map((i) => ({
                menuItemId: i.menuItemId,
                quantity: i.quantity,
              })),
        );
        setDraft(initial);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load meal options.");
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, packageId, dayKey, mealSlot.id, existingOverride, onOpenChange]);

  const grouped = useMemo(() => groupMenuOptions(menuOptions), [menuOptions]);

  const showCategoryLimit = (catKey: string, options: MenuOption[], reason: "quantity" | "choices") => {
    const maxTotal = categoryMaxTotal(options);
    const label = categoryLabelFor(catKey, options);
    const message =
      reason === "choices"
        ? `You can only choose up to ${effectiveMaxChoices(options)} ${label.toLowerCase()} items.`
        : `Maximum ${maxTotal} for ${label}.`;
    setCategoryHints((prev) => ({ ...prev, [catKey]: message }));
  };

  const toggleItem = (option: MenuOption, categoryOptions: MenuOption[], catKey: string) => {
    setDraft((prev) => {
      const current = { ...prev };
      if (current[option.menuItemId]) {
        setCategoryHints((h) => {
          const next = { ...h };
          delete next[catKey];
          return next;
        });
        delete current[option.menuItemId];
        return current;
      }

      const maxChoices = effectiveMaxChoices(categoryOptions);
      const picked = categoryOptions.filter((o) => current[o.menuItemId] > 0);
      if (picked.length >= maxChoices) {
        showCategoryLimit(catKey, categoryOptions, "choices");
        return prev;
      }

      const remaining = remainingCategoryQty(current, categoryOptions);
      if (remaining <= 0) {
        showCategoryLimit(catKey, categoryOptions, "quantity");
        return prev;
      }

      setCategoryHints((h) => {
        const next = { ...h };
        delete next[catKey];
        return next;
      });
      current[option.menuItemId] = Math.min(option.includedQuantityPerDelivery || 1, remaining);
      return current;
    });
  };

  const selectSingle = (option: MenuOption, catKey: string) => {
    setCategoryHints((h) => {
      const next = { ...h };
      delete next[catKey];
      return next;
    });
    const key = catKey;
    setDraft((prev) => {
      const current = { ...prev };
      const options = grouped.byCat.get(key) ?? [];
      for (const opt of options) delete current[opt.menuItemId];
      current[option.menuItemId] = Math.min(
        option.includedQuantityPerDelivery || 1,
        categoryMaxTotal(options),
      );
      return current;
    });
  };

  const setQty = (menuItemId: string, qty: number, options: MenuOption[], catKey: string) => {
    setDraft((prev) => {
      const current = prev[menuItemId] ?? 1;
      const maxForItem = maxQtyForItem(prev, options, menuItemId);
      if (qty > current && qty > maxForItem) {
        showCategoryLimit(catKey, options, "quantity");
        return prev;
      }
      setCategoryHints((h) => {
        const next = { ...h };
        delete next[catKey];
        return next;
      });
      return { ...prev, [menuItemId]: Math.max(1, Math.min(maxForItem, qty)) };
    });
  };

  const handleSave = () => {
    const sanitized = sanitizeDraftForSave(draft, menuOptions);
    if (!Object.keys(sanitized).length) {
      toast.error("Pick at least one item.");
      return;
    }
    const namesById = Object.fromEntries(menuOptions.map((o) => [o.menuItemId, o.name]));
    const override = weeklyMenuOverrideFromDraft(dayKey, mealSlot.id, sanitized, namesById);
    onSaved(override);
    onOpenChange(false);
  };

  const mealTitle = mealSlot.mealType?.trim() || mealSlot.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle>Customize weekly meal</DialogTitle>
          <DialogDescription>
            {formatDayTitle(dayKey)} • {mealTitle} • Repeats every week
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !menuOptions.length ? (
            <p className="text-sm text-muted-foreground">No menu items available for this meal.</p>
          ) : (
            <div className="space-y-4">
              {grouped.categoryKeys.map((catKey) => {
                const options = grouped.byCat.get(catKey) ?? [];
                if (!options.length) return null;
                const allowMultiple = options.some((o) => o.allowsMultipleItemSelection);
                const maxTotal = categoryMaxTotal(options);
                const hint = categoryHints[catKey];

                return (
                  <div key={catKey} className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {categoryLabelFor(catKey, options)}
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {allowMultiple ? `(up to ${maxTotal})` : "(choose one)"}
                      </span>
                    </p>
                    {hint ? <p className="text-xs text-amber-700">{hint}</p> : null}
                    <div className="space-y-1">
                      {options.map((opt) => {
                        const pickedInCategory = options.filter((o) => draft[o.menuItemId] > 0);
                        const selectedIdInCategory = allowMultiple
                          ? undefined
                          : pickedInCategory[pickedInCategory.length - 1]?.menuItemId;
                        const selected = allowMultiple
                          ? Boolean(draft[opt.menuItemId])
                          : selectedIdInCategory === opt.menuItemId;
                        const qty = draft[opt.menuItemId] ?? 1;
                        const maxForItem = maxQtyForItem(draft, options, opt.menuItemId);

                        return (
                          <div
                            key={opt.menuItemId}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                          >
                            <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-sm">
                              <input
                                type={allowMultiple ? "checkbox" : "radio"}
                                name={allowMultiple ? undefined : `preview-${catKey}`}
                                checked={selected}
                                onChange={() => {
                                  if (allowMultiple) toggleItem(opt, options, catKey);
                                  else selectSingle(opt, catKey);
                                }}
                                className="size-4 accent-primary"
                              />
                              <span className="font-medium">{opt.name}</span>
                            </label>
                            {selected && allowMultiple && maxForItem > 1 ? (
                              <QuantityStepper
                                value={qty}
                                min={1}
                                max={maxForItem}
                                onDecrease={() => setQty(opt.menuItemId, qty - 1, options, catKey)}
                                onIncrease={() => setQty(opt.menuItemId, qty + 1, options, catKey)}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-5 py-4 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={loading || !menuOptions.length} onClick={handleSave}>
            Save for every {formatDayTitle(dayKey)}
            <ChevronRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

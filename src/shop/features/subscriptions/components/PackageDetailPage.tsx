"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { cn } from "@shop/lib/utils";
import { subscriptionsApi } from "../services/subscriptions.api";
import type {
  MealSlotCatalogue,
  MealSlotQuote,
  PackageCategory,
  PlanMealSlot,
  SubscriptionPackage,
  WeeklyScheduleDay,
  WeeklySchedulePreview,
} from "../types/package";
import {
  asNumber,
  cardSubtitle,
  categoryImage,
  defaultDurationOption,
  formatIndianPrice,
  formatPlanMealCount,
  heroImage,
  matchingBundleId,
  readCheckoutDraft,
  saveCheckoutDraft,
} from "../utils/package-display";
import { PackagePreviewMenuDialog } from "./PackagePreviewMenuDialog";
import type { WeeklyMenuOverride } from "../types/package";
import {
  weeklyMenuOverrideKey,
  weeklyMenuOverrideSummary,
  weeklyMenuOverridesList,
} from "../utils/weekly-menu-override";

function FoodThumb({ src, className }: { src: string | null; className?: string }) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center bg-primary/10 text-primary", className)}>
        <UtensilsCrossed className="size-5" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={cn("object-cover", className)} />
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function itemsForSlot(day: WeeklyScheduleDay, slot: PlanMealSlot, singleMeal: boolean) {
  if (!day.deliveryEnabled) return [];
  const slotName = slot.name.trim().toLowerCase();
  const mealType = slot.mealType.trim().toLowerCase();
  return day.items.filter((item) => {
    const option = (item.mealOption ?? "").trim().toLowerCase();
    if (!option) return singleMeal;
    return (
      option === slotName ||
      option === mealType ||
      slotName.includes(option) ||
      option.includes(slotName)
    );
  });
}

function mealSummary(
  optionDays: number,
  selectedMealSlotIds: string[],
  mealSlots: PlanMealSlot[],
) {
  const active = selectedMealSlotIds.length
    ? mealSlots.filter((s) => selectedMealSlotIds.includes(s.id))
    : mealSlots;
  if (active.length === 0) return "";
  if (active.length === 1) {
    const name = active[0].name.toLowerCase();
    return `${optionDays} ${name}${optionDays === 1 ? "" : "s"} • ${optionDays} meals`;
  }
  const parts = active
    .map((slot) => `${optionDays} ${slot.name.toLowerCase()}${optionDays === 1 ? "" : "s"}`)
    .join(" + ");
  return `${parts} • ${optionDays * active.length} meals`;
}

export function PackageDetailPage({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [pkg, setPkg] = useState<SubscriptionPackage | null>(null);
  const [catalogue, setCatalogue] = useState<MealSlotCatalogue>({ mealSlots: [], bundles: [] });
  const [schedule, setSchedule] = useState<WeeklySchedulePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [selectedDurationOptionId, setSelectedDurationOptionId] = useState<string | undefined>();
  const [selectedMealSlotIds, setSelectedMealSlotIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [planDetailsExpanded, setPlanDetailsExpanded] = useState(false);
  const [quote, setQuote] = useState<MealSlotQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [weeklyMenuOverrides, setWeeklyMenuOverrides] = useState<Record<string, WeeklyMenuOverride>>({});
  const [customizeTarget, setCustomizeTarget] = useState<{
    dayKey: string;
    slot: PlanMealSlot;
  } | null>(null);

  useEffect(() => {
    const draft = readCheckoutDraft(packageId);
    if (draft?.weeklyMenuOverrides?.length) {
      const map: Record<string, WeeklyMenuOverride> = {};
      for (const override of draft.weeklyMenuOverrides) {
        map[weeklyMenuOverrideKey(override.day, override.mealSlotId)] = override;
      }
      setWeeklyMenuOverrides(map);
    }
  }, [packageId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      subscriptionsApi.getPackageById(packageId),
      subscriptionsApi.getMealCatalogue(packageId).catch(() => ({ mealSlots: [], bundles: [] })),
    ])
      .then(([detail, cat]) => {
        if (cancelled) return;
        setPkg(detail);
        setCatalogue(cat);
        const defaultDuration = defaultDurationOption(detail);
        setSelectedDurationOptionId(defaultDuration?.id);
        const defaultBundle = cat.bundles[0];
        const initialSlots =
          defaultBundle?.mealSlotIds ?? cat.mealSlots.map((slot) => slot.id);
        setSelectedMealSlotIds(initialSlots);
        const activeCats = (detail.categories ?? []).filter((c) => c.active !== false);
        setSelectedCategoryIds(activeCats.map((c) => c.id));
      })
      .catch(() => {
        if (!cancelled) setPkg(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    setScheduleLoading(true);
    subscriptionsApi
      .getWeeklySchedule(packageId)
      .then((preview) => {
        if (!cancelled) setSchedule(preview);
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [packageId]);

  const requestQuote = useCallback(
    (mealSlotIds: string[], durationOptionId?: string, bundleId?: string | null) => {
      if (mealSlotIds.length === 0) {
        setQuote(null);
        return;
      }
      setQuoting(true);
      subscriptionsApi
        .quoteMealSlots({
          packageId,
          mealSlotIds,
          bundleId,
          durationOptionId,
        })
        .then((result) => setQuote(result))
        .catch(() => setQuote(null))
        .finally(() => setQuoting(false));
    },
    [packageId],
  );

  useEffect(() => {
    if (!pkg) return;
    if (catalogue.mealSlots.length === 0) return;
    if (selectedMealSlotIds.length === 0) return;
    requestQuote(
      selectedMealSlotIds,
      selectedDurationOptionId,
      matchingBundleId(catalogue.bundles, selectedMealSlotIds),
    );
  }, [
    pkg,
    catalogue.mealSlots.length,
    catalogue.bundles,
    selectedMealSlotIds,
    selectedDurationOptionId,
    requestQuote,
  ]);

  const activeCategories = useMemo(
    () => (pkg?.categories ?? []).filter((c) => c.active !== false),
    [pkg],
  );
  const usesCategoryPricing = activeCategories.length > 0;
  const canChooseCategories = pkg?.allowCustomerCategorySelection === true;

  const selectedDuration = useMemo(() => {
    const options = pkg?.durationOptions ?? [];
    return (
      options.find((o) => o.id === selectedDurationOptionId) ??
      defaultDurationOption(pkg ?? { id: "", name: "" })
    );
  }, [pkg, selectedDurationOptionId]);

  const priceText = useMemo(() => {
    if (quoting && !quote) return "…";
    if (quote?.finalPrice != null) return `₹${formatIndianPrice(quote.finalPrice)}`;
    const fallback = asNumber(pkg?.finalPrice) || asNumber(pkg?.startingFromPrice);
    return fallback > 0 ? `₹${formatIndianPrice(fallback)}` : pkg?.priceLabel ?? "";
  }, [quoting, quote, pkg]);

  const footerSubtitle = useMemo(() => {
    const durationLabel = selectedDuration?.label || (pkg ? `${pkg.validityDays ?? 30} Days` : "");
    const slots = catalogue.mealSlots.filter((s) => selectedMealSlotIds.includes(s.id));
    if (slots.length === 0) return durationLabel;
    if (slots.length === 1) return `${durationLabel} • ${slots[0].name}`;
    return `${durationLabel} • ${slots.map((s) => s.name).join(" + ")}`;
  }, [selectedDuration, pkg, catalogue.mealSlots, selectedMealSlotIds]);

  const blockedByMealSlot = catalogue.mealSlots.length > 0 && selectedMealSlotIds.length === 0;

  const toggleMealSlot = (slotId: string) => {
    setSelectedMealSlotIds((prev) => {
      if (prev.includes(slotId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== slotId);
      }
      return [...prev, slotId];
    });
  };

  const toggleCategory = (categoryId: string) => {
    if (!canChooseCategories) return;
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const continueCheckout = () => {
    if (!pkg) return;
    const selectedSet = new Set(selectedMealSlotIds);
    const deliverySlotIds = catalogue.mealSlots
      .filter((slot) => selectedSet.has(slot.id))
      .map((slot) => slot.deliverySlotId)
      .filter(Boolean);
    saveCheckoutDraft({
      packageId: pkg.id,
      mealSlotIds: selectedMealSlotIds,
      deliverySlotIds: [...new Set(deliverySlotIds)],
      categoryIds: selectedCategoryIds,
      bundleId: matchingBundleId(catalogue.bundles, selectedMealSlotIds),
      durationOptionId: selectedDurationOptionId ?? null,
      quotedPrice: quote?.finalPrice ?? (asNumber(pkg.finalPrice) || asNumber(pkg.startingFromPrice)),
      weeklyMenuOverrides: weeklyMenuOverridesList(weeklyMenuOverrides),
    });
    router.push(`/subscriptions/checkout?planId=${pkg.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Plan not found.</p>
        <Link href="/subscriptions" className="mt-4 inline-flex text-sm font-semibold text-primary">
          Back to plans
        </Link>
      </div>
    );
  }

  const days = schedule?.days ?? [];
  const selectedDay = days[Math.min(selectedDayIndex, Math.max(days.length - 1, 0))];
  const activeSlots = selectedMealSlotIds.length
    ? catalogue.mealSlots.filter((s) => selectedMealSlotIds.includes(s.id))
    : catalogue.mealSlots;
  const deliveryWindows = (activeSlots.length ? activeSlots : catalogue.mealSlots)
    .map((s) => s.deliveryWindow?.trim())
    .filter(Boolean);
  const deliveryCountLabel = formatPlanMealCount(
    selectedDuration?.days ?? pkg.deliveriesPerCycle ?? pkg.validityDays ?? 30,
  );
  const image = heroImage(pkg);
  const durationOptions = pkg.durationOptions ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/subscriptions"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to plans
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] md:items-center">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-primary/10">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={pkg.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UtensilsCrossed className="size-12 text-primary/60" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              {pkg.badge?.trim() ? (
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {pkg.badge}
                </span>
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{pkg.name}</h1>
              <p className="text-base leading-relaxed text-muted-foreground">{cardSubtitle(pkg)}</p>
            </div>
          </div>

          {catalogue.mealSlots.length > 0 && (
            <section>
              <SectionTitle title="Choose your meals" hint="Pick one or more meals per day." />
              <div className="grid gap-3 sm:grid-cols-2">
                {catalogue.mealSlots.map((slot) => {
                  const selected = selectedMealSlotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleMealSlot(slot.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      {selected ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{slot.name}</p>
                        {slot.deliveryWindow ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{slot.deliveryWindow}</p>
                        ) : null}
                        {slot.basePrice > 0 ? (
                          <p className="mt-2 text-sm font-semibold text-primary">
                            ₹{Math.round(slot.basePrice)} per meal
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {durationOptions.length > 0 && (
            <section>
              <SectionTitle title="Choose duration" />
              <div className="grid gap-3 sm:grid-cols-3">
                {durationOptions.map((option) => {
                  const selected = option.id === selectedDurationOptionId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedDurationOptionId(option.id)}
                      className={cn(
                        "rounded-xl border bg-card p-4 text-center transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="font-semibold text-foreground">
                        {option.label || `${option.days} Days`}
                      </p>
                      {(option.discountPercent ?? 0) > 0 ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                          {option.discountPercent}% off
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {selectedDuration ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {mealSummary(selectedDuration.days, selectedMealSlotIds, catalogue.mealSlots)}
                </p>
              ) : null}
            </section>
          )}

          <section>
            <SectionTitle title="Weekly menu" hint="Repeats weekly" />
            {scheduleLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : !selectedDay ? (
              <p className="rounded-lg border border-amber-200 bg-cream-deep px-3 py-2 text-sm text-amber-800">
                Weekly menu preview is not available right now.
              </p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {days.map((day, index) => {
                    const selected = index === selectedDayIndex;
                    return (
                      <button
                        key={day.day}
                        type="button"
                        onClick={() => setSelectedDayIndex(index)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {day.dayLabel.trim().slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <Card className="overflow-hidden p-0">
                  <CardContent className="divide-y divide-border p-0">
                    {activeSlots.map((slot) => {
                      const items = itemsForSlot(selectedDay, slot, activeSlots.length <= 1);
                      const overrideKey = weeklyMenuOverrideKey(selectedDay.day, slot.id);
                      const override = weeklyMenuOverrides[overrideKey];
                      const summary =
                        override && override.items.length
                          ? weeklyMenuOverrideSummary(override)
                          : items.length
                            ? items.map((item) => item.name).join(" + ")
                            : "No delivery scheduled";
                      const thumb = items.map((item) => item.imageUrl).find((url) => !!url) ?? null;
                      const mealLabel = (slot.mealType || slot.name).toUpperCase();
                      const canCustomize = selectedDay.deliveryEnabled;
                      return (
                        <div key={slot.id} className="flex items-center gap-4 p-4">
                          <FoodThumb src={thumb} className="size-14 rounded-lg" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {mealLabel}
                            </p>
                            <p
                              className={cn(
                                "mt-0.5 text-sm font-medium",
                                items.length || override ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {summary}
                            </p>
                          </div>
                          {canCustomize ? (
                            <button
                              type="button"
                              onClick={() =>
                                setCustomizeTarget({ dayKey: selectedDay.day, slot })
                              }
                              className="inline-flex shrink-0 items-center text-sm font-semibold text-primary hover:underline"
                            >
                              Change
                              <ChevronRight className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </>
            )}
          </section>

          <section>
            <Card className="overflow-hidden p-0">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => setPlanDetailsExpanded((v) => !v)}
              >
                <span className="font-semibold text-foreground">Plan details</span>
                {planDetailsExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
              {planDetailsExpanded && (
                <div className="space-y-2 border-t border-border px-5 py-4 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Meals:</span> {deliveryCountLabel}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Delivery windows:</span>{" "}
                    {deliveryWindows.length ? deliveryWindows.join(" • ") : "Flexible"}
                  </p>
                  {pkg.skipEnabled ? (
                    <p>
                      <span className="font-medium text-foreground">Skips:</span>{" "}
                      {pkg.skipLimitDisplay || "Available"}
                    </p>
                  ) : null}
                </div>
              )}
            </Card>
          </section>

          {usesCategoryPricing && canChooseCategories && (
            <section>
              <SectionTitle title="Menu categories" />
              <div className="space-y-3">
                {activeCategories.map((category: PackageCategory) => {
                  const selected = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <FoodThumb src={categoryImage(category)} className="size-14 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">
                          {category.categoryName ?? category.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Choose from live menu at customization
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{Math.round(category.categoryPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Your plan</p>
                <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">{footerSubtitle}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-4xl font-bold tracking-tight text-foreground">{priceText}</p>
                {quote && (quote.savingsAmount ?? 0) > 0 ? (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    You save ₹{formatIndianPrice(quote.savingsAmount ?? 0)}
                  </p>
                ) : null}
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={blockedByMealSlot || quoting}
                onClick={continueCheckout}
              >
                {quoting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Next: start date, address and payment.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {customizeTarget && pkg ? (
        <PackagePreviewMenuDialog
          packageId={pkg.id}
          dayKey={customizeTarget.dayKey}
          mealSlot={customizeTarget.slot}
          open={!!customizeTarget}
          onOpenChange={(open) => {
            if (!open) setCustomizeTarget(null);
          }}
          existingOverride={
            weeklyMenuOverrides[
              weeklyMenuOverrideKey(customizeTarget.dayKey, customizeTarget.slot.id)
            ] ?? null
          }
          onSaved={(override) => {
            setWeeklyMenuOverrides((prev) => ({
              ...prev,
              [weeklyMenuOverrideKey(override.day, override.mealSlotId)]: override,
            }));
            setCustomizeTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

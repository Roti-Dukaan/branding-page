"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock, Minus, Plus, Save, SkipForward } from "lucide-react";
import { cn } from "@shop/lib/utils";
import { toast } from "@shop/lib/toast";
import { Button } from "@shop/components/ui/button";
import { DatePicker } from "@shop/components/ui/date-picker";
import { subscriptionsApi } from "../services/subscriptions.api";
import { useSubscriptionActions } from "../hooks/useSubscriptions";
import {
  canSkipDelivery,
} from "../utils/delivery-calendar";
import type { SubscriptionDeliveryStatus } from "../types/subscription";
import { DeliveryStatusBadge } from "./StatusBadge";
import { MenuSelectionIndicator } from "./MenuSelectionIndicator";
import { formatDeliverySlotLabel } from "@shop/lib/delivery-slot-display";
import { SelectionCutoffBanner } from "./SelectionCutoffCountdown";
import {
  calendarDateToKey,
  dateKeyFromIso,
  formatDisplayDate,
  toDateKey,
} from "@shop/lib/date";

type MenuOption = {
  menuItemId: string;
  name: string;
  category: string;
  categoryLabel?: string;
  includedQuantityPerDelivery: number;
  maximumQuantityPerDelivery: number;
  allowsMultipleItemSelection?: boolean;
  maximumChoicesPerDelivery?: number | null;
};

type DeliverySummary = {
  deliveryId: string | null;
  deliveryDate: string;
  status: SubscriptionDeliveryStatus;
  slot: { id: string; name: string; startTime: string; endTime: string } | null;
  selectionStatus: string;
  selectionDeadline: string;
  selectionLocked: boolean;
  selectionLockedLabel: string | null;
};

type UpcomingDelivery = Omit<DeliverySummary, "deliveryId"> & {
  deliveryId: string;
  selectedItems: Array<{
    menuItemId: string;
    menuItemNameSnapshot: string;
    category: string;
    quantity: number;
  }>;
  menuOptions: MenuOption[];
};

const CATEGORY_ORDER = ["ROTI", "CURRY", "ADDON"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  ROTI: "Rotis",
  CURRY: "Curries",
  ADDON: "Add-ons",
};

function normalizeCategoryKey(category: string | undefined | null): string {
  const v = (category ?? "OTHER").trim().toUpperCase();
  if (v === "ROTI" || v === "ROTIS") return "ROTI";
  if (v === "CURRY" || v === "CURRIES") return "CURRY";
  if (v === "ADDON" || v === "ADD-ON" || v === "ADDONS" || v === "ADD-ONS") return "ADDON";
  return v.replace(/[^A-Z0-9]+/g, "_");
}

function buildInitialDraft(row: UpcomingDelivery): Record<string, number> {
  const menuOptions = row.menuOptions ?? [];
  const byCat = new Map<string, MenuOption[]>();
  for (const opt of menuOptions) {
    const key = normalizeCategoryKey(opt.category);
    const list = byCat.get(key) ?? [];
    list.push(opt);
    byCat.set(key, list);
  }

  if (row.selectedItems?.length) {
    const saved: Record<string, number> = {};
    for (const item of row.selectedItems) {
      saved[item.menuItemId] = item.quantity;
    }
    return sanitizeDraftForSave(saved, menuOptions);
  }

  const draft: Record<string, number> = {};
  for (const options of byCat.values()) {
    const opt = options[0];
    if (!opt || opt.includedQuantityPerDelivery <= 0) continue;
    const maxTotal = categoryMaxTotal(options);
    draft[opt.menuItemId] = Math.min(opt.includedQuantityPerDelivery, maxTotal);
  }
  return sanitizeDraftForSave(draft, menuOptions);
}

function categoryMaxTotal(options: MenuOption[]): number {
  const included = Math.max(1, options[0]?.includedQuantityPerDelivery ?? 1);
  const raw = options[0]?.maximumQuantityPerDelivery ?? included;
  if (raw >= 100) {
    return included;
  }
  return Math.max(1, Math.min(raw, included));
}

function effectiveMaxChoices(options: MenuOption[]): number {
  const raw = options[0]?.maximumChoicesPerDelivery ?? 1;
  const maxTotal = categoryMaxTotal(options);
  if (raw >= 100) {
    return Math.min(options.length, maxTotal);
  }
  return Math.min(raw, maxTotal);
}

function maxQtyForItem(
  draft: Record<string, number>,
  options: MenuOption[],
  menuItemId: string,
): number {
  const maxTotal = categoryMaxTotal(options);
  const usedByOthers = options.reduce((sum, opt) => {
    if (opt.menuItemId === menuItemId) return sum;
    return sum + (draft[opt.menuItemId] ?? 0);
  }, 0);
  return Math.max(1, maxTotal - usedByOthers);
}

function remainingCategoryQty(
  draft: Record<string, number>,
  options: MenuOption[],
): number {
  const maxTotal = categoryMaxTotal(options);
  const used = options.reduce((sum, opt) => sum + (draft[opt.menuItemId] ?? 0), 0);
  return Math.max(0, maxTotal - used);
}

function sanitizeDraftForSave(
  draft: Record<string, number>,
  menuOptions: MenuOption[],
): Record<string, number> {
  const byCat = new Map<string, MenuOption[]>();
  for (const opt of menuOptions) {
    const key = normalizeCategoryKey(opt.category);
    const list = byCat.get(key) ?? [];
    list.push(opt);
    byCat.set(key, list);
  }

  const sanitized: Record<string, number> = {};
  for (const options of byCat.values()) {
    const allowMultiple = options.some((o) => o.allowsMultipleItemSelection);
    const maxChoices = effectiveMaxChoices(options);
    const maxTotal = categoryMaxTotal(options);
    const picked = options.filter((o) => draft[o.menuItemId] > 0);

    if (!allowMultiple || maxChoices <= 1) {
      const choice = picked[picked.length - 1];
      if (choice) {
        sanitized[choice.menuItemId] = Math.min(draft[choice.menuItemId], maxTotal);
      }
      continue;
    }

    let remaining = maxTotal;
    for (const opt of picked.slice(0, maxChoices)) {
      if (remaining <= 0) break;
      const qty = Math.min(draft[opt.menuItemId], remaining);
      if (qty > 0) {
        sanitized[opt.menuItemId] = qty;
        remaining -= qty;
      }
    }
  }
  return sanitized;
}

function categoryLabelFor(key: string, options: MenuOption[]): string {
  const fromOption = options.find((o) => normalizeCategoryKey(o.category) === key)?.categoryLabel;
  if (fromOption?.trim()) return fromOption;
  return CATEGORY_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortCategoryKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
    const bi = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function pickDefaultDateKey(rows: DeliverySummary[]): string | null {
  if (!rows.length) return null;
  const editable = rows.find((r) => !r.selectionLocked);
  return dateKeyFromIso((editable ?? rows[0]).deliveryDate);
}

function categoryHintKey(deliveryId: string, catKey: string): string {
  return `${deliveryId}:${catKey}`;
}

function QuantityStepper({
  value,
  min,
  max,
  disabled,
  onDecrease,
  onIncrease,
}: {
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[1.25rem] px-1 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DailyMenuPanel({ subscriptionId }: { subscriptionId: string }) {
  const actions = useSubscriptionActions();
  const [indexRows, setIndexRows] = useState<DeliverySummary[]>([]);
  const [detailRows, setDetailRows] = useState<UpcomingDelivery[]>([]);
  const detailCacheRef = useRef<Record<string, UpcomingDelivery[]>>({});
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, number>>>({});
  const [categoryHints, setCategoryHints] = useState<Record<string, string>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const loadIndex = useCallback(async () => {
    setLoadingIndex(true);
    try {
      const data = await subscriptionsApi.getUpcomingDeliveries(subscriptionId);
      setIndexRows(data);
      setSelectedDateKey((current) => {
        if (current && data.some((d) => dateKeyFromIso(d.deliveryDate) === current)) return current;
        return pickDefaultDateKey(data);
      });
    } catch {
      toast.error("Could not load upcoming meals");
    } finally {
      setLoadingIndex(false);
    }
  }, [subscriptionId]);

  const fetchDateDetail = useCallback(
    async (dateKey: string, force = false) => {
      const cached = detailCacheRef.current[dateKey];
      if (!force && cached?.length) {
        setDetailRows(cached);
        return;
      }

      setLoadingDetail(true);
      try {
        const data = await subscriptionsApi.getUpcomingDeliveries(subscriptionId, dateKey);
        detailCacheRef.current[dateKey] = data;
        setDetailRows(data);
        setDrafts((prev) => {
          const next = { ...prev };
          for (const d of data) {
            next[d.deliveryId] = buildInitialDraft(d);
          }
          return next;
        });
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? "Could not load menu for this date";
        toast.error(String(message));
        setDetailRows([]);
      } finally {
        setLoadingDetail(false);
      }
    },
    [subscriptionId],
  );

  useEffect(() => {
    detailCacheRef.current = {};
    setDetailRows([]);
    setDrafts({});
    setCategoryHints({});
    setSelectedDateKey(null);
    setSelectedDeliveryId(null);
    setSelectedSlotId(null);
    void loadIndex();
  }, [loadIndex]);

  useEffect(() => {
    if (!selectedDateKey) return;
    void fetchDateDetail(selectedDateKey);
  }, [selectedDateKey, fetchDateDetail]);

  const deliveryDateKeys = useMemo(
    () => new Set(indexRows.map((r) => dateKeyFromIso(r.deliveryDate))),
    [indexRows],
  );

  const uniqueDateKeys = useMemo(() => {
    const keys = [...new Set(indexRows.map((r) => dateKeyFromIso(r.deliveryDate)))];
    keys.sort();
    return keys;
  }, [indexRows]);

  const selectedDateIndex = selectedDateKey
    ? uniqueDateKeys.indexOf(selectedDateKey)
    : -1;

  const deliveriesForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return detailRows.filter((r) => dateKeyFromIso(r.deliveryDate) === selectedDateKey);
  }, [detailRows, selectedDateKey]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    const fromDetail = detailRows.filter((r) => dateKeyFromIso(r.deliveryDate) === selectedDateKey);
    if (fromDetail.length) return fromDetail;
    return indexRows.filter((r) => dateKeyFromIso(r.deliveryDate) === selectedDateKey);
  }, [detailRows, indexRows, selectedDateKey]);

  useEffect(() => {
    if (!deliveriesForSelectedDate.length) {
      setSelectedDeliveryId(null);
      return;
    }

    setSelectedDeliveryId((current) => {
      if (current && deliveriesForSelectedDate.some((d) => d.deliveryId === current)) {
        return current;
      }

      if (selectedSlotId) {
        const bySlot = deliveriesForSelectedDate.find(
          (d) => d.slot?.id === selectedSlotId && d.deliveryId,
        );
        if (bySlot?.deliveryId) return bySlot.deliveryId;
      }

      const editable = deliveriesForSelectedDate.find((d) => !d.selectionLocked && d.deliveryId);
      const fallback = deliveriesForSelectedDate.find((d) => d.deliveryId);
      return (editable ?? fallback)?.deliveryId ?? null;
    });
  }, [deliveriesForSelectedDate, selectedSlotId]);

  const selectedGrouped = useMemo(() => {
    const row = detailRows.find((r) => r.deliveryId === selectedDeliveryId);
    if (!row) return null;
    const byCat = new Map<string, MenuOption[]>();
    for (const opt of row.menuOptions ?? []) {
      const key = normalizeCategoryKey(opt.category);
      const list = byCat.get(key) ?? [];
      list.push(opt);
      byCat.set(key, list);
    }
    const categoryKeys = sortCategoryKeys([...byCat.keys()]);
    return { row, byCat, categoryKeys };
  }, [detailRows, selectedDeliveryId]);

  const showCategoryLimit = (
    deliveryId: string,
    catKey: string,
    options: MenuOption[],
    reason: "quantity" | "choices",
  ) => {
    const maxTotal = categoryMaxTotal(options);
    const label = categoryLabelFor(catKey, options);
    const message =
      reason === "choices"
        ? `You can only choose up to ${effectiveMaxChoices(options)} ${label.toLowerCase()} items. Remove one to add another.`
        : `You have reached the maximum quantity of ${maxTotal} for ${label}. Remove or reduce another item to add more.`;
    setCategoryHints((prev) => ({
      ...prev,
      [categoryHintKey(deliveryId, catKey)]: message,
    }));
  };

  const clearCategoryHint = (deliveryId: string, catKey: string) => {
    setCategoryHints((prev) => {
      const key = categoryHintKey(deliveryId, catKey);
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleItem = (
    deliveryId: string,
    option: MenuOption,
    categoryOptions: MenuOption[],
    catKey: string,
  ) => {
    setDrafts((prev) => {
      const current = { ...(prev[deliveryId] ?? {}) };
      if (current[option.menuItemId]) {
        clearCategoryHint(deliveryId, catKey);
        delete current[option.menuItemId];
        return { ...prev, [deliveryId]: current };
      }

      const maxChoices = effectiveMaxChoices(categoryOptions);
      const picked = categoryOptions.filter((o) => current[o.menuItemId] > 0);
      if (picked.length >= maxChoices) {
        showCategoryLimit(deliveryId, catKey, categoryOptions, "choices");
        return prev;
      }

      const remaining = remainingCategoryQty(current, categoryOptions);
      if (remaining <= 0) {
        showCategoryLimit(deliveryId, catKey, categoryOptions, "quantity");
        return prev;
      }

      clearCategoryHint(deliveryId, catKey);
      current[option.menuItemId] = Math.min(
        option.includedQuantityPerDelivery || 1,
        remaining,
      );
      return { ...prev, [deliveryId]: current };
    });
  };

  const selectSingle = (deliveryId: string, option: MenuOption, catKey: string) => {
    clearCategoryHint(deliveryId, catKey);
    const key = normalizeCategoryKey(option.category);
    setDrafts((prev) => {
      const current = { ...(prev[deliveryId] ?? {}) };
      const row = detailRows.find((r) => r.deliveryId === deliveryId);
      for (const opt of row?.menuOptions ?? []) {
        if (normalizeCategoryKey(opt.category) === key) {
          delete current[opt.menuItemId];
        }
      }
      current[option.menuItemId] = Math.min(
        option.includedQuantityPerDelivery || 1,
        categoryMaxTotal(row?.menuOptions?.filter(
          (o) => normalizeCategoryKey(o.category) === key,
        ) ?? []),
      );
      return { ...prev, [deliveryId]: current };
    });
  };

  const setQty = (
    deliveryId: string,
    menuItemId: string,
    qty: number,
    options: MenuOption[],
    catKey: string,
  ) => {
    const currentDraft = drafts[deliveryId] ?? {};
    const current = currentDraft[menuItemId] ?? 1;
    const maxForItem = maxQtyForItem(currentDraft, options, menuItemId);

    if (qty > current && qty > maxForItem) {
      showCategoryLimit(deliveryId, catKey, options, "quantity");
      return;
    }

    clearCategoryHint(deliveryId, catKey);
    const clamped = Math.max(1, Math.min(maxForItem, qty));
    setDrafts((prev) => ({
      ...prev,
      [deliveryId]: { ...(prev[deliveryId] ?? {}), [menuItemId]: clamped },
    }));
  };

  const adjustQty = (
    deliveryId: string,
    menuItemId: string,
    delta: number,
    options: MenuOption[],
    catKey: string,
  ) => {
    const current = drafts[deliveryId]?.[menuItemId] ?? 1;
    setQty(deliveryId, menuItemId, current + delta, options, catKey);
  };

  const save = async (deliveryId: string) => {
    const row = detailRows.find((r) => r.deliveryId === deliveryId);
    const rawDraft = drafts[deliveryId] ?? {};
    const draft = sanitizeDraftForSave(rawDraft, row?.menuOptions ?? []);
    const items = Object.entries(draft).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }));
    setSavingId(deliveryId);
    try {
      await subscriptionsApi.saveDeliveryMenu(subscriptionId, deliveryId, items);
      toast.success("Menu selection saved");
      if (selectedDateKey) {
        delete detailCacheRef.current[selectedDateKey];
        await fetchDateDetail(selectedDateKey, true);
      }
      await loadIndex();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not save menu selection";
      toast.error(String(message));
    } finally {
      setSavingId(null);
    }
  };

  const handleSkip = async () => {
    if (!selectedDateKey || !selectedGrouped) return;
    try {
      await actions.skip.mutateAsync({ id: subscriptionId, deliveryDate: selectedDateKey });
      toast.success(`Meal skipped for ${formatDisplayDate(selectedDateKey)}`);
      detailCacheRef.current = {};
      await loadIndex();
      await fetchDateDetail(selectedDateKey, true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not skip this meal";
      toast.error(String(message));
    }
  };

  if (loadingIndex) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading meal dates…
      </div>
    );
  }

  if (!indexRows.length) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No upcoming meals yet. Daily menu selection appears after your subscription is activated.
      </p>
    );
  }

  const selectedRow = selectedGrouped?.row;
  const locked = selectedRow?.selectionLocked ?? false;
  const draft = selectedRow ? (drafts[selectedRow.deliveryId] ?? {}) : {};
  const hasMenuOptions = (selectedRow?.menuOptions?.length ?? 0) > 0;
  const skippable = selectedRow ? canSkipDelivery(selectedRow.status) : false;

  const activeDeliveryContext =
    selectedRow
    ?? slotsForSelectedDate.find((d) => d.deliveryId === selectedDeliveryId)
    ?? slotsForSelectedDate.find((d) => d.slot?.id === selectedSlotId)
    ?? slotsForSelectedDate[0]
    ?? null;

  const activeDeadline = activeDeliveryContext?.selectionDeadline ?? null;
  const activeLocked = activeDeliveryContext?.selectionLocked ?? false;

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Daily menu</span>
        {!activeDeadline ? (
          <>
            {" · "}
            Select a date to see your menu selection cutoff.
          </>
        ) : null}
      </p>

      <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <DatePicker
            id="daily-menu-date-filter"
            value={selectedDateKey}
            onChange={(key) => key && setSelectedDateKey(key)}
            disabled={(date) => !deliveryDateKeys.has(calendarDateToKey(date))}
            placeholder="Select meal date"
            displayFormat="picker"
            showFooterActions
            showStatusLegend={false}
            ariaLabel="Filter daily menu by meal date"
            className="sm:max-w-[200px]"
          />
          {uniqueDateKeys.length > 1 && selectedDateIndex >= 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedDateIndex + 1} of {uniqueDateKeys.length} meal dates
            </p>
          )}
        </div>

        {slotsForSelectedDate.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {slotsForSelectedDate.map((d) => {
              const slotId = d.slot?.id ?? null;
              const isActive = d.deliveryId
                ? d.deliveryId === selectedDeliveryId
                : slotId != null && slotId === selectedSlotId;

              return (
                <button
                  key={d.deliveryId ?? slotId ?? d.deliveryDate}
                  type="button"
                  onClick={() => {
                    if (slotId) setSelectedSlotId(slotId);
                    if (d.deliveryId) {
                      setSelectedDeliveryId(d.deliveryId);
                      return;
                    }
                    if (selectedDateKey) {
                      void fetchDateDetail(selectedDateKey, true);
                    }
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted/60"
                  }`}
                >
                  {d.slot?.name ?? "Delivery"}
                </button>
              );
            })}
          </div>
        )}

        {activeDeadline && (loadingDetail || !selectedGrouped) && (
          <SelectionCutoffBanner
            deadlineIso={activeDeadline}
            locked={activeLocked}
          />
        )}

        {loadingDetail ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading menu…
          </div>
        ) : selectedGrouped && selectedRow ? (
          <>
            <div className="space-y-2 border-t border-border/60 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                  <span>
                    {selectedRow.slot
                      ? `${selectedRow.slot.name} (${formatDeliverySlotLabel(selectedRow.slot.startTime, selectedRow.slot.endTime)})`
                      : "Delivery slot"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DeliveryStatusBadge status={selectedRow.status} />
                  {locked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                </div>
              </div>

              <SelectionCutoffBanner
                deadlineIso={selectedRow.selectionDeadline}
                locked={locked}
              />
            </div>

            {!hasMenuOptions ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                No menu items are available for this subscription yet. Please contact support or ask
                your branch to link menu items to your subscription package.
              </p>
            ) : (
              selectedGrouped.categoryKeys.map((catKey) => {
                const options = selectedGrouped.byCat.get(catKey) ?? [];
                if (!options.length) return null;
                const allowMultiple = options.some((o) => o.allowsMultipleItemSelection);
                const maxTotal = categoryMaxTotal(options);
                const categoryHint = categoryHints[categoryHintKey(selectedRow.deliveryId, catKey)];

                return (
                  <div key={catKey} className="space-y-1.5">
                    <p className="text-sm font-semibold">
                      {categoryLabelFor(catKey, options)}
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {allowMultiple ? `(up to ${maxTotal})` : "(choose one)"}
                      </span>
                    </p>
                    <div className="space-y-1">
                      {options.map((opt) => {
                        const pickedInCategory = options.filter((o) => draft[o.menuItemId] > 0);
                        const selectedIdInCategory = allowMultiple
                          ? undefined
                          : pickedInCategory[pickedInCategory.length - 1]?.menuItemId;
                        const selected = allowMultiple
                          ? Boolean(draft[opt.menuItemId])
                          : selectedIdInCategory === opt.menuItemId;
                        const inputType = allowMultiple ? "checkbox" : "radio";
                        const maxForItem = maxQtyForItem(draft, options, opt.menuItemId);
                        const qty = draft[opt.menuItemId] ?? 1;

                        return (
                          <div
                            key={opt.menuItemId}
                            className="flex items-center justify-between gap-3 rounded-lg bg-background px-2.5 py-1.5"
                          >
                            <label
                              className={cn(
                                "flex flex-1 items-center gap-2.5 text-sm",
                                locked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                              )}
                            >
                              <input
                                type={inputType}
                                name={allowMultiple ? undefined : `${selectedRow.deliveryId}-${catKey}`}
                                disabled={locked}
                                checked={selected}
                                className="sr-only"
                                onChange={() =>
                                  allowMultiple
                                    ? toggleItem(selectedRow.deliveryId, opt, options, catKey)
                                    : selectSingle(selectedRow.deliveryId, opt, catKey)
                                }
                              />
                              <MenuSelectionIndicator selected={selected} />
                              <span>{opt.name}</span>
                            </label>
                            {selected && (
                              <QuantityStepper
                                value={qty}
                                min={1}
                                max={maxForItem}
                                disabled={locked}
                                onDecrease={() =>
                                  adjustQty(selectedRow.deliveryId, opt.menuItemId, -1, options, catKey)
                                }
                                onIncrease={() =>
                                  adjustQty(selectedRow.deliveryId, opt.menuItemId, 1, options, catKey)
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {categoryHint && (
                      <p className="rounded-md bg-cream-deep px-2.5 py-1.5 text-xs text-amber-800">
                        {categoryHint}
                      </p>
                    )}
                  </div>
                );
              })
            )}

            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
              {!locked && hasMenuOptions && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => save(selectedRow.deliveryId)}
                  disabled={savingId === selectedRow.deliveryId}
                >
                  {savingId === selectedRow.deliveryId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save selection
                </Button>
              )}
              {skippable && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actions.skip.isPending}
                  onClick={handleSkip}
                >
                  {actions.skip.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SkipForward className="mr-2 h-4 w-4" />
                  )}
                  Skip meal
                </Button>
              )}
            </div>

            {selectedRow.status === "SKIPPED" && (
              <p className="text-xs text-muted-foreground">This meal has been skipped.</p>
            )}
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Pick a date to choose your menu.
          </p>
        )}
      </div>
    </div>
  );
}

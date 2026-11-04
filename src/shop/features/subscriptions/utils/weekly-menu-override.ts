import type { WeeklyMenuOverride, WeeklyMenuSelectionItem } from "../types/package";

export function weeklyMenuOverrideKey(day: string, mealSlotId: string) {
  return `${day.trim().toLowerCase()}:${mealSlotId}`;
}

export function weeklyMenuOverrideSummary(override: WeeklyMenuOverride): string {
  return override.items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const label = item.name?.trim() || "Item";
      return item.quantity > 1 ? `${label} x${item.quantity}` : label;
    })
    .join(" + ");
}

export function weeklyMenuOverrideFromDraft(
  dayKey: string,
  mealSlotId: string,
  draft: Record<string, number>,
  namesById: Record<string, string>,
): WeeklyMenuOverride {
  const items: WeeklyMenuSelectionItem[] = Object.entries(draft)
    .filter(([, qty]) => qty > 0)
    .map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
      name: namesById[menuItemId],
    }));
  return {
    day: dayKey.trim().toLowerCase(),
    mealSlotId,
    items,
  };
}

export function weeklyMenuOverridesList(map: Record<string, WeeklyMenuOverride>): WeeklyMenuOverride[] {
  return Object.values(map).filter((o) => o.items.some((i) => i.quantity > 0));
}

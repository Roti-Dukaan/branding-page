export type MenuOption = {
  menuItemId: string;
  name: string;
  category: string;
  categoryLabel?: string;
  includedQuantityPerDelivery: number;
  maximumQuantityPerDelivery: number;
  allowsMultipleItemSelection?: boolean;
  maximumChoicesPerDelivery?: number | null;
};

const CATEGORY_ORDER = ["ROTI", "CURRY", "ADDON"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  ROTI: "Rotis",
  CURRY: "Curries",
  ADDON: "Add-ons",
};

export function normalizeCategoryKey(category: string | undefined | null): string {
  const v = (category ?? "OTHER").trim().toUpperCase();
  if (v === "ROTI" || v === "ROTIS") return "ROTI";
  if (v === "CURRY" || v === "CURRIES") return "CURRY";
  if (v === "ADDON" || v === "ADD-ON" || v === "ADDONS" || v === "ADD-ONS") return "ADDON";
  return v.replace(/[^A-Z0-9]+/g, "_");
}

export function categoryMaxTotal(options: MenuOption[]): number {
  const included = Math.max(1, options[0]?.includedQuantityPerDelivery ?? 1);
  const raw = options[0]?.maximumQuantityPerDelivery ?? included;
  if (raw >= 100) return included;
  return Math.max(1, Math.min(raw, included));
}

export function effectiveMaxChoices(options: MenuOption[]): number {
  const raw = options[0]?.maximumChoicesPerDelivery ?? 1;
  const maxTotal = categoryMaxTotal(options);
  if (raw >= 100) return Math.min(options.length, maxTotal);
  return Math.min(raw, maxTotal);
}

export function maxQtyForItem(
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

export function remainingCategoryQty(draft: Record<string, number>, options: MenuOption[]): number {
  const maxTotal = categoryMaxTotal(options);
  const used = options.reduce((sum, opt) => sum + (draft[opt.menuItemId] ?? 0), 0);
  return Math.max(0, maxTotal - used);
}

export function sanitizeDraftForSave(
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

export function buildInitialMenuDraft(
  menuOptions: MenuOption[],
  selectedItems: Array<{ menuItemId: string; quantity: number }>,
): Record<string, number> {
  if (selectedItems.length) {
    const saved: Record<string, number> = {};
    for (const item of selectedItems) {
      saved[item.menuItemId] = item.quantity;
    }
    return sanitizeDraftForSave(saved, menuOptions);
  }

  const byCat = new Map<string, MenuOption[]>();
  for (const opt of menuOptions) {
    const key = normalizeCategoryKey(opt.category);
    const list = byCat.get(key) ?? [];
    list.push(opt);
    byCat.set(key, list);
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

export function categoryLabelFor(key: string, options: MenuOption[]): string {
  const fromOption = options.find((o) => normalizeCategoryKey(o.category) === key)?.categoryLabel;
  if (fromOption?.trim()) return fromOption;
  return CATEGORY_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sortCategoryKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
    const bi = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function groupMenuOptions(menuOptions: MenuOption[]) {
  const byCat = new Map<string, MenuOption[]>();
  for (const opt of menuOptions) {
    const key = normalizeCategoryKey(opt.category);
    const list = byCat.get(key) ?? [];
    list.push(opt);
    byCat.set(key, list);
  }
  return { byCat, categoryKeys: sortCategoryKeys([...byCat.keys()]) };
}

import type {
  AllowedFoodItem,
  PackageCategory,
  SubscriptionCheckoutDraft,
  SubscriptionDurationOption,
  SubscriptionPackage,
} from "../types/package";
import type { SubscriptionPlan } from "../types/subscription";

const DRAFT_KEY = "rd-subscription-checkout-draft";

/** User-facing plan unit label (replaces “deliveries” in checkout and plan detail). */
export function formatPlanMealCount(count: number): string {
  const n = Math.max(0, Math.round(count));
  return `${n} ${n === 1 ? "meal" : "meals"}`;
}

export function formatIndianPrice(value: number) {
  const rounded = Math.round(value);
  const raw = String(rounded);
  if (raw.length <= 3) return raw;
  const lastThree = raw.slice(-3);
  let rest = raw.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(",")},${lastThree}`;
}

export function asNumber(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(n) ? n : 0;
}

export function packageDurationDays(pkg: SubscriptionPackage) {
  if (pkg.validityDays && pkg.validityDays > 0) return pkg.validityDays;
  return String(pkg.billingCycle ?? pkg.type).toUpperCase() === "WEEKLY" ? 7 : 30;
}

export function cardDurationOptions(pkg: SubscriptionPackage): SubscriptionDurationOption[] {
  if (pkg.durationOptions && pkg.durationOptions.length > 0) return pkg.durationOptions;
  const days = packageDurationDays(pkg);
  if (days > 0) {
    return [{ id: "default", days, label: `${days} Days`, isDefault: true }];
  }
  return [];
}

export function shortestDurationOption(pkg: SubscriptionPackage) {
  const options = cardDurationOptions(pkg);
  if (options.length === 0) return null;
  return options.reduce((a, b) => (a.days <= b.days ? a : b));
}

export function defaultDurationOption(pkg: SubscriptionPackage) {
  const options = pkg.durationOptions ?? [];
  return options.find((o) => o.isDefault) ?? options[0] ?? null;
}

export function cardQuoteDeliveryCount(pkg: SubscriptionPackage) {
  const option = shortestDurationOption(pkg);
  if (option && option.days > 0) return option.days;
  return pkg.validityDays ?? packageDurationDays(pkg);
}

export function showStartsFromPrice(pkg: SubscriptionPackage) {
  return !!pkg.hasMealSlotPricing || cardDurationOptions(pkg).length > 1;
}

export function cardStartingCyclePrice(pkg: SubscriptionPackage) {
  const start = asNumber(pkg.startingFromPrice);
  if (!pkg.hasMealSlotPricing || start <= 0) return null;
  return start * cardQuoteDeliveryCount(pkg);
}

export function cardPriceAmount(pkg: SubscriptionPackage) {
  const cyclePrice = cardStartingCyclePrice(pkg);
  if (cyclePrice && cyclePrice > 0) return `₹${formatIndianPrice(cyclePrice)}`;

  const start = asNumber(pkg.startingFromPrice);
  const final = asNumber(pkg.finalPrice);
  const price = start > 0 ? start : final > 0 ? final : null;
  if (price == null) {
    let label = (pkg.priceLabel ?? "").trim();
    if (label.toLowerCase().startsWith("from ")) label = label.slice(5).trim();
    return label;
  }
  return `₹${formatIndianPrice(price)}`;
}

export function cardPriceSuffix(pkg: SubscriptionPackage) {
  if (showStartsFromPrice(pkg)) return "";
  const option = defaultDurationOption(pkg) ?? shortestDurationOption(pkg);
  const days = option?.days ?? pkg.validityDays ?? packageDurationDays(pkg);
  return `/ ${days} days`;
}

export function cardSubtitle(pkg: SubscriptionPackage) {
  const desc = pkg.description?.trim();
  if (desc && desc.toLowerCase() !== pkg.name.trim().toLowerCase()) return desc;
  return "Fresh, homestyle meals";
}

export function heroImage(pkg: SubscriptionPackage) {
  if (pkg.planImageUrl) return pkg.planImageUrl;
  const fromFood = (pkg.allowedFoodItems ?? [])
    .map((item: AllowedFoodItem) => item.foodItem?.imageUrl ?? item.imageUrl)
    .find((url) => !!url);
  if (fromFood) return fromFood;
  for (const category of pkg.categories ?? []) {
    for (const item of category.menuItems ?? []) {
      const url = item.menuItem?.image ?? item.imageUrl;
      if (url) return url;
    }
  }
  return null;
}

export function durationChipLabels(pkg: SubscriptionPackage) {
  return cardDurationOptions(pkg).map((option) =>
    option.label?.trim() ? option.label : `${option.days} Days`,
  );
}

export function packageAsPlan(pkg: SubscriptionPackage): SubscriptionPlan {
  const cycle = (String(pkg.billingCycle ?? pkg.type ?? "MONTHLY").toUpperCase() === "WEEKLY"
    ? "WEEKLY"
    : "MONTHLY") as SubscriptionPlan["type"];
  const finalPrice = asNumber(pkg.finalPrice) || asNumber(pkg.startingFromPrice);
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    type: cycle,
    billingCycle: cycle,
    price: finalPrice,
    originalPrice: asNumber(pkg.originalPrice) || finalPrice,
    finalPrice,
    savingsAmount: 0,
    validityDays: pkg.validityDays ?? packageDurationDays(pkg),
    deliveriesPerCycle: pkg.deliveriesPerCycle ?? packageDurationDays(pkg),
    isActive: true,
    displayOrder: 0,
    badge: pkg.badge,
  };
}

export function saveCheckoutDraft(draft: SubscriptionCheckoutDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readCheckoutDraft(packageId: string): SubscriptionCheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as SubscriptionCheckoutDraft;
    if (draft.packageId !== packageId) return null;
    return draft;
  } catch {
    return null;
  }
}

export function matchingBundleId(
  bundles: Array<{ id: string; mealSlotIds: string[] }>,
  mealSlotIds: string[],
) {
  const selected = [...mealSlotIds].sort();
  for (const bundle of bundles) {
    const ids = [...bundle.mealSlotIds].sort();
    if (ids.length === selected.length && ids.every((id) => selected.includes(id))) {
      return bundle.id;
    }
  }
  return null;
}

export function categoryImage(category: PackageCategory) {
  for (const item of category.menuItems ?? []) {
    const url = item.menuItem?.image ?? item.imageUrl;
    if (url) return url;
  }
  return null;
}

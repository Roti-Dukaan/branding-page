import type { ApiProduct, ApiCategory } from "./types/api";
import { resolveFoodType, type FoodType } from "@shop/components/ui/VegIndicator";
export { resolveImageUrl, isCatalogCdnUrl, shouldUnoptimizeImage } from "./catalog-image";

/** Build category pill labels for menu filters, excluding blank/duplicate names. */
export function getCategoryFilterNames(
  categories: Pick<ApiCategory, "name">[]
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const category of categories) {
    const name = category.name?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return ["All", ...names];
}

// The Food Item price is the Base Price only. The backend PricingService is the
// single source of truth for the full breakdown (subtotal, GST split, delivery,
// packaging, discount, grand total), so the UI reads `price` as the base price
// and never recomputes tax/delivery client-side.
/** Display label for how many people a dish serves (e.g. "Serves 1"). */
export function formatServingsLabel(servingSize?: string | null): string {
  const raw = servingSize?.trim();
  if (!raw) return "Serves 1";

  const servesMatch = raw.match(/serves?\s*([\d]+(?:\s*-\s*[\d]+)?)/i);
  if (servesMatch) return `Serves ${servesMatch[1].replace(/\s+/g, "")}`;

  const plateMatch = raw.match(/(\d+(?:\s*-\s*\d+)?)\s*plate/i);
  if (plateMatch) return `Serves ${plateMatch[1].replace(/\s+/g, "")}`;

  const leadingNumber = raw.match(/^(\d+(?:\s*-\s*\d+)?)/);
  if (leadingNumber) return `Serves ${leadingNumber[1].replace(/\s+/g, "")}`;

  return "Serves 1";
}

export function normalizeProduct(p: ApiProduct): ApiProduct {
  const discount =
    p.discountPrice != null && Number(p.discountPrice) > 0
      ? Number(p.discountPrice)
      : null;
  const base = Number(p.basePrice ?? p.price ?? 0);
  const saleBase = discount ?? base;
  const price = Number(p.displayPrice ?? saleBase ?? 0);
  const foodType: FoodType = resolveFoodType(p.foodType, p.isVeg);
  return {
    ...p,
    price: Number.isFinite(price) ? price : 0,
    basePrice: Number.isFinite(base) ? base : 0,
    discountPrice: discount,
    listDisplayPrice:
      p.listDisplayPrice != null && Number(p.listDisplayPrice) > price + 0.009
        ? Number(p.listDisplayPrice)
        : null,
    gstPercentage: Number(p.gstPercentage) || 0,
    foodType,
    isVeg: foodType === "VEG",
  };
}

export function addToRecentlyViewed(slug: string) {
  try {
    const key = "roti-dukaan-recently-viewed";
    const raw = localStorage.getItem(key);
    const slugs: string[] = raw ? JSON.parse(raw) : [];
    const updated = [slug, ...slugs.filter((s) => s !== slug)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(): string[] {
  try {
    const key = "roti-dukaan-recently-viewed";
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/menu/items/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.data || null;
    return product ? normalizeProduct(product) : null;
  } catch {
    return null;
  }
}

export async function getProductsByCategory(
  categoryName: string,
  categories: ApiCategory[],
  products: ApiProduct[]
): Promise<ApiProduct[]> {
  const cat = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (!cat) return [];
  return products.filter((p) => p.categoryId === cat.id && p.isAvailable);
}

export function getRelatedProducts(
  currentSlug: string,
  allProducts: ApiProduct[],
  categories: ApiCategory[],
  limit = 4
): ApiProduct[] {
  const current = allProducts.find((p) => p.slug === currentSlug);
  if (!current) return [];

  const related = allProducts
    .filter((p) => p.slug !== currentSlug && p.isAvailable && p.categoryId === current.categoryId)
    .slice(0, limit);

  if (related.length < limit) {
    const extras = allProducts
      .filter(
        (p) =>
          p.slug !== currentSlug &&
          p.isAvailable &&
          !related.some((r) => r.slug === p.slug)
      )
      .slice(0, limit - related.length);
    related.push(...extras);
  }

  return related;
}

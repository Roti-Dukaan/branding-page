const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.rotidukaan.com";

export type MenuItemShare = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  displayPrice?: number;
  price?: number;
  isVeg?: boolean;
};

export type SubscriptionPackageShare = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function fetchMenuItemBySlug(
  slug: string,
): Promise<MenuItemShare | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/menu/items/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data;
    if (!item?.slug) return null;
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription,
      imageUrl: resolveImageUrl(item.imageUrl),
      displayPrice: item.displayPrice ?? item.basePrice,
      price: item.basePrice,
      isVeg: item.isVeg,
    };
  } catch {
    return null;
  }
}

export async function fetchSubscriptionPackageById(
  id: string,
): Promise<SubscriptionPackageShare | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/subscriptions/packages`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : json.data?.items;
    if (!Array.isArray(list)) return null;
    const pkg = list.find((p: { id?: string }) => p.id === id);
    if (!pkg) return null;
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description ?? pkg.shortDescription,
      imageUrl: resolveImageUrl(pkg.imageUrl ?? pkg.coverImageUrl),
    };
  } catch {
    return null;
  }
}

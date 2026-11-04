import { productApi } from "@shop/lib/api/menu.api";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFoodItemUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function resolveFoodItemId(idOrSlug: string): Promise<string> {
  if (isFoodItemUuid(idOrSlug)) {
    return idOrSlug;
  }

  const response = await productApi.getBySlug(idOrSlug);
  const id = response.data?.id;
  if (!id) {
    throw new Error(`Food item "${idOrSlug}" not found`);
  }
  return id;
}

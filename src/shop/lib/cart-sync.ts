import { apiClient } from "@shop/lib/api/client";
import { isFoodItemUuid, resolveFoodItemId } from "@shop/lib/food-item-id";
import type { CartItem } from "@shop/lib/types";
import { parseCartLineId, remoteCartLineKey } from "@shop/lib/cart-line-id";

const SYNC_FRESH_MS = 120_000;
const DEBOUNCE_MS = 400;

const foodItemIdCache = new Map<string, string>();

let lastSyncedSignature = "";
let lastSyncedAt = 0;
let inflightSync: Promise<void> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function computeCartSignature(items: CartItem[]): string {
  return items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join("|");
}

function isFreshSync(signature: string): boolean {
  return (
    signature === lastSyncedSignature &&
    lastSyncedAt > 0 &&
    Date.now() - lastSyncedAt < SYNC_FRESH_MS
  );
}

export function invalidateCartSync(): void {
  lastSyncedSignature = "";
  lastSyncedAt = 0;
}

export function isCartSynced(items: CartItem[]): boolean {
  if (!items.length) return true;
  return isFreshSync(computeCartSignature(items));
}

async function resolveCartLines(items: CartItem[]) {
  return Promise.all(
    items.map(async (item) => {
      const parsed = parseCartLineId(item.id);
      let foodItemId = item.foodItemId || parsed.foodItemId;
      const foodItemVariantId = item.foodItemVariantId || parsed.variantId;
      if (!isFoodItemUuid(foodItemId)) {
        const cached = foodItemIdCache.get(foodItemId);
        if (cached) {
          foodItemId = cached;
        } else {
          foodItemId = await resolveFoodItemId(foodItemId);
          foodItemIdCache.set(parsed.foodItemId, foodItemId);
        }
      }
      return {
        foodItemId,
        foodItemVariantId,
        quantity: item.quantity,
        name: item.name || item.id,
      };
    })
  );
}

type BackendCartItem = {
  id: string;
  foodItemId: string;
  foodItemVariantId?: string | null;
  quantity: number;
};

async function performSync(items: CartItem[]): Promise<void> {
  if (!items.length) return;

  const signature = computeCartSignature(items);
  if (isFreshSync(signature)) return;

  const resolved = await resolveCartLines(items);

  let backendItems: BackendCartItem[] = [];
  try {
    const { data } = await apiClient.get("/cart");
    backendItems = data?.data?.items ?? data?.data?.cart?.items ?? [];
  } catch {
    // Server cart may not exist yet.
  }

  const localKey = resolved
    .map((line) => `${remoteCartLineKey(line.foodItemId, line.foodItemVariantId)}:${line.quantity}`)
    .sort()
    .join("|");
  const remoteKey = backendItems
    .map((line) => `${remoteCartLineKey(line.foodItemId, line.foodItemVariantId)}:${line.quantity}`)
    .sort()
    .join("|");

  if (localKey === remoteKey) {
    lastSyncedSignature = signature;
    lastSyncedAt = Date.now();
    return;
  }

  const remoteByLine = new Map(
    backendItems.map((line) => [remoteCartLineKey(line.foodItemId, line.foodItemVariantId), line])
  );
  const localByLine = new Map(
    resolved.map((line) => [remoteCartLineKey(line.foodItemId, line.foodItemVariantId), line])
  );
  const ops: Promise<unknown>[] = [];

  for (const remote of backendItems) {
    const key = remoteCartLineKey(remote.foodItemId, remote.foodItemVariantId);
    if (!localByLine.has(key)) {
      ops.push(apiClient.delete(`/cart/items/${remote.id}`));
    }
  }

  for (const local of resolved) {
    const key = remoteCartLineKey(local.foodItemId, local.foodItemVariantId);
    const remote = remoteByLine.get(key);
    if (!remote) {
      ops.push(
        apiClient.post("/cart/items", {
          foodItemId: local.foodItemId,
          quantity: local.quantity,
          ...(local.foodItemVariantId ? { foodItemVariantId: local.foodItemVariantId } : {}),
        })
      );
    } else if (remote.quantity !== local.quantity) {
      ops.push(apiClient.patch(`/cart/items/${remote.id}`, { quantity: local.quantity }));
    }
  }

  if (ops.length === 0 && backendItems.length === 0 && resolved.length > 0) {
    await Promise.all(
      resolved.map((line) =>
        apiClient.post("/cart/items", {
          foodItemId: line.foodItemId,
          quantity: line.quantity,
          ...(line.foodItemVariantId ? { foodItemVariantId: line.foodItemVariantId } : {}),
        })
      )
    );
  } else {
    await Promise.all(ops);
  }

  lastSyncedSignature = signature;
  lastSyncedAt = Date.now();
}

export async function ensureCartSynced(items: CartItem[], enabled: boolean): Promise<void> {
  if (!enabled || items.length === 0) return;

  const signature = computeCartSignature(items);
  if (isFreshSync(signature)) return;

  if (inflightSync) {
    await inflightSync;
    if (isFreshSync(signature)) return;
  }

  inflightSync = performSync(items).finally(() => {
    inflightSync = null;
  });
  await inflightSync;
}

export function scheduleBackgroundCartSync(items: CartItem[], enabled: boolean): void {
  if (!enabled || items.length === 0) return;

  const signature = computeCartSignature(items);
  if (isFreshSync(signature)) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void ensureCartSynced(items, enabled).catch(() => undefined);
  }, DEBOUNCE_MS);
}

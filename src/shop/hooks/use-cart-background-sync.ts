import { useEffect } from "react";
import { useCartStore } from "@shop/lib/store";
import { ensureCartSynced, scheduleBackgroundCartSync } from "@shop/lib/cart-sync";

/** Keeps the server cart in sync while the user shops (Zepto-style background sync). */
export function useCartBackgroundSync(isAuthenticated: boolean) {
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    scheduleBackgroundCartSync(items, isAuthenticated);
  }, [items, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      void ensureCartSynced(items, true).catch(() => undefined);
    }
  }, [isAuthenticated]);
}

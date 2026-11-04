import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, MenuItem, MenuItemVariant } from "./types";
import { invalidateCartSync } from "./cart-sync";
import { asArray } from "@shop/lib/stores/persist-utils";
import { cartLineId, parseCartLineId } from "./cart-line-id";
import { variantUnitPrice } from "./menu-variants";

function normalizeCartItems(items: unknown): CartItem[] {
  return asArray<CartItem>(items)
    .filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number.isFinite(Number(item.quantity)),
    )
    .map((item) => {
      const parsed = parseCartLineId(item.id);
      return {
        ...item,
        foodItemId: item.foodItemId || parsed.foodItemId,
        foodItemVariantId: item.foodItemVariantId || parsed.variantId,
      };
    });
}

interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, variant?: MenuItemVariant) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: MenuItem, quantity = 1, variant?: MenuItemVariant) => {
        set((state) => {
          const items = normalizeCartItems(state.items);
          const lineId = cartLineId(item.id, variant?.id);
          const unitPrice = variant ? variantUnitPrice(variant) : item.price;
          const displayName =
            variant?.name ? `${item.name} (${variant.name})` : item.name;
          const existing = items.find((i) => i.id === lineId);
          if (existing) {
            return {
              items: items.map((i) =>
                i.id === lineId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...items,
              {
                id: lineId,
                foodItemId: item.id,
                foodItemVariantId: variant?.id,
                variantName: variant?.name,
                name: displayName,
                price: unitPrice,
                image: item.image,
                isVeg: item.isVeg,
                quantity,
                category: item.category,
                gstPercentage: item.gstPercentage,
                gstType: item.gstType,
              },
            ],
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: normalizeCartItems(state.items).filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: normalizeCartItems(state.items).map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        invalidateCartSync();
        set({ items: [] });
      },

      getCartCount: () => {
        return normalizeCartItems(get().items).reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartTotal: () => {
        return normalizeCartItems(get().items).reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "roti-dukaan-cart",
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CartStore>;
        return {
          ...current,
          ...saved,
          items: normalizeCartItems(saved.items),
        };
      },
    }
  )
);

export const useCartCount = () =>
  useCartStore((s) => normalizeCartItems(s.items).reduce((sum, i) => sum + i.quantity, 0));

export const useCartTotal = () =>
  useCartStore((s) =>
    normalizeCartItems(s.items).reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

export const useCartItemQuantity = (id: string) =>
  useCartStore((s) => normalizeCartItems(s.items).find((i) => i.id === id)?.quantity || 0);

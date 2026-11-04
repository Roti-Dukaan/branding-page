import { create } from "zustand";
import { MenuItem } from "@shop/lib/types";

interface QuickViewState {
  selectedItem: MenuItem | null;
  isOpen: boolean;
  quantity: number;
  open: (item: MenuItem) => void;
  close: () => void;
  setQuantity: (quantity: number) => void;
}

export const useQuickViewStore = create<QuickViewState>()((set) => ({
  selectedItem: null,
  isOpen: false,
  quantity: 1,
  open: (item) => set({ selectedItem: item, isOpen: true, quantity: 1 }),
  close: () => set({ selectedItem: null, isOpen: false, quantity: 1 }),
  setQuantity: (quantity) => set({ quantity }),
}));

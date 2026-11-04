import { create } from "zustand";
import { DeliveryAddress } from "@shop/lib/types";
import { getAddresses, createAddress, updateAddress as apiUpdateAddress, deleteAddress as apiDeleteAddress, setDefaultAddress as apiSetDefaultAddress } from "@shop/services/address.service";

interface AddressState {
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
  currentCity: string;
  addressSheetOpen: boolean;
  addressEditorOpen: boolean;
  addressEditorTarget: DeliveryAddress | null;
  loading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<DeliveryAddress, "id">) => Promise<DeliveryAddress>;
  updateAddress: (id: string, address: Partial<DeliveryAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => void;
  clearSelectedAddress: () => void;
  setAddressSheetOpen: (value: boolean) => void;
  openAddressEditor: (address?: DeliveryAddress | null) => void;
  closeAddressEditor: () => void;
  getSelectedAddress: () => DeliveryAddress | null;
}

export const useAddressStore = create<AddressState>()((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  currentCity: "Hyderabad",
  addressSheetOpen: false,
  addressEditorOpen: false,
  addressEditorTarget: null,
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const addresses = await getAddresses();
      set((state) => {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        const selectedAddressId =
          state.selectedAddressId && addresses.some((a) => a.id === state.selectedAddressId)
            ? state.selectedAddressId
            : (defaultAddr?.id || null);
        return { addresses, selectedAddressId };
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load addresses";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  addAddress: async (address) => {
    const created = await createAddress(address);
    set((state) => {
      const addresses = [...state.addresses, created];
      const selectedAddressId =
        addresses.length === 1 ? created.id : state.selectedAddressId;
      return { addresses, selectedAddressId };
    });
    return created;
  },

  updateAddress: async (id, updates) => {
    const updated = await apiUpdateAddress(id, updates);
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr.id === id ? updated : addr
      ),
    }));
  },

  deleteAddress: async (id) => {
    await apiDeleteAddress(id);
    set((state) => {
      const addresses = state.addresses.filter((addr) => addr.id !== id);
      const selectedAddressId =
        state.selectedAddressId === id
          ? addresses[0]?.id || null
          : state.selectedAddressId;
      return { addresses, selectedAddressId };
    });
  },

  setDefaultAddress: async (id) => {
    try {
      await apiSetDefaultAddress(id);
      set((state) => ({
        addresses: state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        })),
        selectedAddressId: id,
      }));
    } catch {
      set((state) => ({
        addresses: state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        })),
        selectedAddressId: id,
      }));
    }
  },

  selectAddress: (id) => {
    set({ selectedAddressId: id });
  },

  clearSelectedAddress: () => {
    set({ selectedAddressId: null });
  },

  setAddressSheetOpen: (value: boolean) => {
    set({ addressSheetOpen: value });
  },

  openAddressEditor: (address = null) => {
    set({ addressEditorOpen: true, addressEditorTarget: address });
  },

  closeAddressEditor: () => {
    set({ addressEditorOpen: false, addressEditorTarget: null });
  },

  getSelectedAddress: () => {
    const state = get();
    return (
      state.addresses.find((addr) => addr.id === state.selectedAddressId) ||
      state.addresses.find((addr) => addr.isDefault) ||
      state.addresses[0] ||
      null
    );
  },
}));

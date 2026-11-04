import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ProfileTab,
  Order,
  FavoriteItem,
  Coupon,
  Notification,
  ProfileSettings,
  UserSubscription,
} from "@shop/features/profile/types";
import { asArray } from "@shop/lib/stores/persist-utils";

interface ProfileState {
  activeTab: ProfileTab;
  selectedOrderId: string | null;
  selectedTicketId: string | null;
  sidebarOpen: boolean;
  orders: Order[];
  favorites: FavoriteItem[];
  coupons: Coupon[];
  notifications: Notification[];
  subscription: UserSubscription | null;
  settings: ProfileSettings;
  setActiveTab: (tab: ProfileTab) => void;
  setSelectedOrderId: (id: string | null) => void;
  setSelectedTicketId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  addFavorite: (menuItemId: string) => void;
  removeFavorite: (menuItemId: string) => void;
  isFavorite: (menuItemId: string) => boolean;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: () => number;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      activeTab: "account",
      selectedOrderId: null,
      selectedTicketId: null,
      sidebarOpen: false,
      orders: [],
      favorites: [],
      coupons: [],
      notifications: [],
      subscription: null,
      settings: {
        darkMode: false,
        orderNotifications: true,
        promotionalNotifications: true,
        subscriptionReminders: true,
      },

      setActiveTab: (tab) => set({ activeTab: tab, selectedOrderId: null }),

      setSelectedOrderId: (id) =>
        set({ selectedOrderId: id, activeTab: "order-detail" }),

      setSelectedTicketId: (id) =>
        set({ selectedTicketId: id, activeTab: "support-detail" }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addFavorite: (menuItemId) =>
        set((state) => {
          const favorites = asArray<FavoriteItem>(state.favorites);
          return {
            favorites: [
              ...favorites,
              { menuItemId, addedAt: new Date().toISOString() },
            ],
          };
        }),

      removeFavorite: (menuItemId) =>
        set((state) => ({
          favorites: asArray<FavoriteItem>(state.favorites).filter(
            (f) => f.menuItemId !== menuItemId
          ),
        })),

      isFavorite: (menuItemId) =>
        asArray<FavoriteItem>(get().favorites).some((f) => f.menuItemId === menuItemId),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: asArray<Notification>(state.notifications).map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      clearNotifications: () =>
        set((state) => ({
          notifications: asArray<Notification>(state.notifications).map((n) => ({
            ...n,
            isRead: true,
          })),
        })),

      unreadCount: () =>
        asArray<Notification>(get().notifications).filter((n) => !n.isRead).length,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "roti-dukaan-profile",
      partialize: (state) => ({
        favorites: state.favorites,
        settings: state.settings,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProfileState>;
        return {
          ...current,
          ...saved,
          favorites: asArray<FavoriteItem>(saved.favorites),
          settings: {
            ...current.settings,
            ...(saved.settings && typeof saved.settings === "object" ? saved.settings : {}),
          },
        };
      },
    }
  )
);

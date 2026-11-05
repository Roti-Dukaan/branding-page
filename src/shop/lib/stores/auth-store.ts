import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pendingCheckout: boolean;
  /** After login: `/cart` for cart checkout; `null` = stay on current page (subscriptions). */
  postLoginRedirect: string | null;
  authDialogOpen: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isReturningCustomer: boolean;
  profileNameDialogOpen: boolean;
  login: (user: User, accessToken: string, refreshToken: string, isNewUser?: boolean) => void;
  logout: () => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User> & Pick<User, "id">) => void;
  setPendingCheckout: (value: boolean) => void;
  setPostLoginRedirect: (value: string | null) => void;
  setAuthDialogOpen: (value: boolean) => void;
  setProfileNameDialogOpen: (value: boolean) => void;
  /** @param returnTo Omit for cart (`/cart`). Pass `null` to remain on the current route after login. */
  openAuthForCheckout: (returnTo?: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      pendingCheckout: false,
      postLoginRedirect: null,
      authDialogOpen: false,
      accessToken: null,
      refreshToken: null,
      isReturningCustomer: false,
      profileNameDialogOpen: false,

      login: (user, accessToken, refreshToken, isNewUser = false) => {
        set({
          user,
          isAuthenticated: true,
          authDialogOpen: false,
          accessToken,
          refreshToken,
          isReturningCustomer: !isNewUser,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          pendingCheckout: false,
          postLoginRedirect: null,
          accessToken: null,
          refreshToken: null,
          isReturningCustomer: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      updateUser: (user) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null,
        }));
      },

      setPendingCheckout: (value: boolean) => {
        set({ pendingCheckout: value });
      },

      setPostLoginRedirect: (value: string | null) => {
        set({ postLoginRedirect: value });
      },

      setAuthDialogOpen: (value: boolean) => {
        set({ authDialogOpen: value });
      },

      setProfileNameDialogOpen: (value: boolean) => {
        set({ profileNameDialogOpen: value });
      },

      openAuthForCheckout: (returnTo?: string | null) => {
        set({
          authDialogOpen: true,
          pendingCheckout: true,
          postLoginRedirect: returnTo === undefined ? "/cart" : returnTo,
        });
      },
    }),
    {
      name: "roti-dukaan-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isReturningCustomer: state.isReturningCustomer,
      }),
      skipHydration: true,
    }
  )
);

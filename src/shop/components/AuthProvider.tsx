"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { getCurrentUser } from "@shop/services/auth.service";
import { sanitizeUserAvatar } from "@shop/lib/user-avatar";
import { userHasProfileName } from "@shop/lib/profile-utils";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setProfileNameDialogOpen = useAuthStore((s) => s.setProfileNameDialogOpen);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    let cancelled = false;

    async function restoreAuth() {
      const raw = localStorage.getItem("roti-dukaan-auth");
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        if (!state?.isAuthenticated || !state?.accessToken) return;

        const user = await getCurrentUser();
        if (!cancelled) {
          const displayName = user.fullName || state.user?.name || "User";
          setUser({
            id: user.id,
            name: displayName,
            phone: user.phone || state.user?.phone || "",
            email: user.email,
            avatar: sanitizeUserAvatar(state.user?.avatar),
          });
          if (!userHasProfileName(
            {
              id: user.id,
              name: displayName,
              phone: user.phone || state.user?.phone || "",
              email: user.email,
            },
            user.fullName,
          )) {
            setProfileNameDialogOpen(true);
          }
        }
      } catch (error) {
        if (cancelled) return;

        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          logout();
        }
      }
    }

    restoreAuth();

    const handleLogout = () => {
      logout();
      router.replace("/");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [setUser, logout, router, setProfileNameDialogOpen]);

  return <>{children}</>;
}

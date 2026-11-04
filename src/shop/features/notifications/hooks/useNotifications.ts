"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type AppNotification } from "../services/notifications.api";
import { useAuthStore } from "@shop/lib/stores/auth-store";

type PrefsInput = {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
};

export function useNotifications() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const list = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(1, 15),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const preferences = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => notificationsApi.getPreferences(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: (prefs: PrefsInput) =>
      notificationsApi.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });

  const notifications: AppNotification[] = list.data?.items ?? [];
  const unreadCount: number = list.data?.unreadCount ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading: list.isLoading,
    refetch: list.refetch,
    preferences: preferences.data ?? null,
    isPreferencesLoading: preferences.isLoading,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
    updatePreferences: (prefs: PrefsInput) =>
      updatePreferences.mutate(prefs),
    isUpdatingPrefs: updatePreferences.isPending,
  };
}

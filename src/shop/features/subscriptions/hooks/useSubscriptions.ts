import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "../services/subscriptions.api";
import type { CustomerSubscription, SubscriptionDelivery } from "../types/subscription";

interface SubscriptionDetailStore {
  selected: CustomerSubscription | null;
  drawerOpen: boolean;
  deliveries: SubscriptionDelivery[];
  loadingDeliveries: boolean;
  setSelected: (sub: CustomerSubscription | null) => void;
  setDrawerOpen: (open: boolean) => void;
  loadDetail: (id: string) => Promise<void>;
}

export const useSubscriptionDetailStore = create<SubscriptionDetailStore>((set) => ({
  selected: null,
  drawerOpen: false,
  deliveries: [],
  loadingDeliveries: false,
  setSelected: (sub) => set({ selected: sub }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  loadDetail: async (id) => {
    set({ loadingDeliveries: true });
    try {
      const [sub, deliveries] = await Promise.all([
        subscriptionsApi.getById(id),
        subscriptionsApi.getDeliveries(id),
      ]);
      set({ selected: sub, deliveries, loadingDeliveries: false });
    } catch {
      set({ loadingDeliveries: false });
    }
  },
}));

export function useMySubscriptions() {
  return useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () => subscriptionsApi.mine(),
    staleTime: 20_000,
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionsApi.listPlans(),
    staleTime: 5 * 60_000,
  });
}

export function useSubscriptionPackages() {
  return useQuery({
    queryKey: ["subscription-packages"],
    queryFn: () => subscriptionsApi.listPackages(),
    staleTime: 5 * 60_000,
  });
}

export function useSubscriptionPackage(packageId: string | null) {
  return useQuery({
    queryKey: ["subscription-package", packageId],
    queryFn: () => subscriptionsApi.getPackageById(packageId!),
    enabled: !!packageId,
    staleTime: 60_000,
  });
}

export function useSubscriptionActions() {
  const queryClient = useQueryClient();
  const setSelected = useSubscriptionDetailStore((s) => s.setSelected);
  const loadDetail = useSubscriptionDetailStore((s) => s.loadDetail);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });

  const refreshDetail = async (id: string, data: CustomerSubscription) => {
    setSelected(data);
    invalidate();
    await loadDetail(id);
  };

  const pause = useMutation({
    mutationFn: ({ id, reason, untilDate }: { id: string; reason?: string; untilDate?: string }) =>
      subscriptionsApi.pause(id, reason, untilDate),
    onSuccess: (data, { id }) => refreshDetail(id, data),
  });

  const resume = useMutation({
    mutationFn: ({ id }: { id: string }) => subscriptionsApi.resume(id),
    onSuccess: (data, { id }) => refreshDetail(id, data),
  });

  const skip = useMutation({
    mutationFn: ({ id, deliveryDate }: { id: string; deliveryDate: string }) =>
      subscriptionsApi.skip(id, deliveryDate),
    onSuccess: (data, { id }) => refreshDetail(id, data),
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => subscriptionsApi.cancel(id, reason),
    onSuccess: (data, { id }) => refreshDetail(id, data),
  });

  const revokeCancel = useMutation({
    mutationFn: ({ id }: { id: string }) => subscriptionsApi.revokeCancel(id),
    onSuccess: (data, { id }) => refreshDetail(id, data),
  });

  return { pause, resume, skip, cancel, revokeCancel };
}

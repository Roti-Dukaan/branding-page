"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ChangeDeliveryAddressInput,
  DeliveryAddress,
  PauseSubscriptionInput,
  SkipDeliveryInput,
} from "../types";

const subscriptionApi = {
  getManagementState: async (): Promise<any> => {
    return { status: "active", nextDelivery: "", remainingDeliveries: 0, endDate: "" };
  },
  getCalendar: async (): Promise<any[]> => [],
  getTimeline: async (): Promise<any[]> => [],
  pause: async (input: PauseSubscriptionInput): Promise<any> => input,
  resume: async (): Promise<any> => ({}),
  skip: async (input: SkipDeliveryInput): Promise<any> => input,
  changeDeliveryAddress: async (_input: ChangeDeliveryAddressInput, _address: DeliveryAddress): Promise<any> => ({}),
};

export function useSubscriptionManagement(subscriptionId: string) {
  return useQuery({
    queryKey: ["subscription-management", subscriptionId],
    queryFn: () => subscriptionApi.getManagementState(),
  });
}

export function useDeliveryCalendar(subscriptionId: string) {
  return useQuery({
    queryKey: ["delivery-calendar", subscriptionId],
    queryFn: () => subscriptionApi.getCalendar(),
  });
}

export function useSubscriptionTimeline(subscriptionId: string) {
  return useQuery({
    queryKey: ["subscription-timeline", subscriptionId],
    queryFn: () => subscriptionApi.getTimeline(),
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: ["subscription-management", id] });
  qc.invalidateQueries({ queryKey: ["delivery-calendar", id] });
  qc.invalidateQueries({ queryKey: ["subscription-timeline", id] });
}

export function usePauseSubscription(subscriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PauseSubscriptionInput) => subscriptionApi.pause(input),
    onSuccess: () => invalidateAll(qc, subscriptionId),
  });
}

export function useResumeSubscription(subscriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.resume(),
    onSuccess: () => invalidateAll(qc, subscriptionId),
  });
}

export function useSkipDelivery(subscriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkipDeliveryInput) => subscriptionApi.skip(input),
    onSuccess: () => invalidateAll(qc, subscriptionId),
  });
}

export function useChangeDeliveryAddress(subscriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { input: ChangeDeliveryAddressInput; address: DeliveryAddress }) =>
      subscriptionApi.changeDeliveryAddress(vars.input, vars.address),
    onSuccess: () => invalidateAll(qc, subscriptionId),
  });
}
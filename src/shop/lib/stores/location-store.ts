"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatDeliveryLocationLabel } from "@shop/lib/geo/format-delivery-location";

export interface DeliveryCheckResult {
  serviceable: boolean;
  distance?: number;
  branchId?: string;
  branchName?: string;
  estimatedTime?: string;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  message?: string;
}

interface LocationStore {
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
  areaName: string | null;
  city: string | null;
  pincode: string | null;
  deliveryAvailable: boolean | null;
  deliveryMessage: string | null;
  branchId: string | null;
  branchName: string | null;
  estimatedTime: string | null;
  deliveryCharge: number;
  distance: number | null;

  setCoordinates: (lat: number, lng: number) => void;
  setAddressDetails: (details: {
    formattedAddress: string;
    areaName: string;
    city: string;
    pincode: string;
  }) => void;
  setDeliveryResult: (result: DeliveryCheckResult) => void;
  clearLocation: () => void;
  isLocationSet: () => boolean;
  getDisplayName: () => string;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      formattedAddress: null,
      areaName: null,
      city: null,
      pincode: null,
      deliveryAvailable: null,
      deliveryMessage: null,
      branchId: null,
      branchName: null,
      estimatedTime: null,
      deliveryCharge: 0,
      distance: null,

      setCoordinates: (lat, lng) => set({ latitude: lat, longitude: lng }),

      setAddressDetails: (details) =>
        set({
          formattedAddress: details.formattedAddress,
          areaName: details.areaName,
          city: details.city,
          pincode: details.pincode,
        }),

      setDeliveryResult: (result) =>
        set({
          deliveryAvailable: result.serviceable,
          deliveryMessage: result.serviceable
            ? null
            : (result.message ?? "Sorry, we don't deliver to this location."),
          branchId: result.branchId ?? null,
          branchName: result.branchName ?? null,
          estimatedTime: result.estimatedTime ?? null,
          deliveryCharge: result.deliveryCharge ?? 0,
          distance: result.distance ?? null,
          ...(result.serviceable
            ? {}
            : {
                branchId: null,
                branchName: null,
                estimatedTime: null,
                deliveryCharge: 0,
                distance: null,
              }),
        }),

      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          formattedAddress: null,
          areaName: null,
          city: null,
          pincode: null,
          deliveryAvailable: null,
          deliveryMessage: null,
          branchId: null,
          branchName: null,
          estimatedTime: null,
          deliveryCharge: 0,
          distance: null,
        }),

      isLocationSet: () => get().latitude !== null && get().longitude !== null,

      getDisplayName: () => {
        const state = get();
        return formatDeliveryLocationLabel({
          areaName: state.areaName,
          city: state.city,
          formattedAddress: state.formattedAddress,
        });
      },
    }),
    {
      name: "roti-dukaan-location",
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        formattedAddress: state.formattedAddress,
        areaName: state.areaName,
        city: state.city,
        pincode: state.pincode,
        deliveryAvailable: state.deliveryAvailable,
        deliveryMessage: state.deliveryMessage,
        branchId: state.branchId,
        branchName: state.branchName,
        estimatedTime: state.estimatedTime,
        deliveryCharge: state.deliveryCharge,
        distance: state.distance,
      }),
    }
  )
);

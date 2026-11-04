"use client";

import { apiClient } from "@shop/lib/api/client";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { reverseGeocode, geocodeAddress as googleGeocodeAddress } from "@shop/lib/google-maps";
import { loadGoogleMaps } from "@shop/lib/google-maps";
import {
  buildAddressGeocodeQueries,
  isPlaceholderCoordinates,
} from "@shop/lib/geo/constants";
import type { DeliveryAddress } from "@shop/lib/types";

export interface DeliveryCheckResponse {
  serviceable: boolean;
  distance?: number;
  branchId?: string;
  branchName?: string;
  estimatedTime?: string;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  message?: string;
}

export const locationService = {
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const requestPosition = (options: PositionOptions) =>
        new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, options);
        });

      requestPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }).catch((error: GeolocationPositionError) => {
        if (error.code === 1) {
          throw error;
        }

        return requestPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        });
      }).then(resolve).catch(reject);
    });
  },

  async checkDelivery(
    latitude: number,
    longitude: number
  ): Promise<DeliveryCheckResponse> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: DeliveryCheckResponse;
    }>("/delivery/check", { latitude, longitude });
    return data.data;
  },

  async verifyAndSave(google: typeof window.google, lat: number, lng: number) {
    const store = useLocationStore.getState();

    store.setCoordinates(lat, lng);

    let addressDetails = {
      formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      areaName: "",
      city: "",
      pincode: "",
    };

    try {
      const geo = await reverseGeocode(google, lat, lng);
      addressDetails = {
        formattedAddress: geo.formattedAddress,
        areaName: geo.areaName,
        city: geo.city || geo.areaName || "",
        pincode: geo.pincode,
      };
    } catch {
      // Use raw coordinates if reverse geocoding fails
    }

    store.setAddressDetails(addressDetails);

    let deliveryResult: DeliveryCheckResponse;
    try {
      deliveryResult = await locationService.checkDelivery(lat, lng);
    } catch (err: any) {
      if (err?.response?.data?.serviceable === false) {
        deliveryResult = err.response.data as DeliveryCheckResponse;
      } else {
        deliveryResult = {
          serviceable: false,
          message: "Unable to verify delivery availability. Please try again.",
        };
      }
    }

    store.setDeliveryResult(deliveryResult);

    if (deliveryResult.serviceable) {
      try {
        await apiClient.patch("/customer/location", {
          latitude: lat,
          longitude: lng,
          formattedAddress: addressDetails.formattedAddress,
        });
      } catch (e: any) {
        console.error("[LocationService] Failed to update customer location/branch:", e?.response?.data || e);
      }
    }

    return { addressDetails, deliveryResult };
  },

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const google = await loadGoogleMaps();
      const res = await googleGeocodeAddress(google, address);
      if (isPlaceholderCoordinates(res.lat, res.lng)) {
        return null;
      }
      return { lat: res.lat, lng: res.lng };
    } catch (error) {
      console.error("[LocationService] Forward geocoding failed:", error);
      return null;
    }
  },

  async geocodeAddressParts(
    parts: Pick<
      DeliveryAddress,
      "house" | "street" | "area" | "city" | "state" | "pincode"
    >,
  ): Promise<{ lat: number; lng: number } | null> {
    for (const query of buildAddressGeocodeQueries({
      house: parts.house,
      street: parts.street,
      area: parts.area,
      city: parts.city,
      state: parts.state,
      pincode: parts.pincode,
    })) {
      const geocoded = await locationService.geocodeAddress(query);
      if (geocoded) {
        return geocoded;
      }
    }

    return null;
  },

  async resolveAddressCoordinates(
    addr: Pick<
      DeliveryAddress,
      "house" | "street" | "area" | "city" | "state" | "pincode" | "lat" | "lng"
    >,
    options?: { forceGeocode?: boolean },
  ): Promise<{ lat: number; lng: number } | null> {
    if (
      !options?.forceGeocode &&
      !isPlaceholderCoordinates(addr.lat, addr.lng)
    ) {
      return { lat: addr.lat!, lng: addr.lng! };
    }

    return locationService.geocodeAddressParts(addr);
  },

  /** Load saved delivery coords + branch from API (overrides stale localStorage). */
  async hydrateFromServer(): Promise<void> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Record<string, unknown> }>(
        "/customer/location",
      );
      const loc = data.data;
      const lat = Number(loc.deliveryLatitude);
      const lng = Number(loc.deliveryLongitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const store = useLocationStore.getState();
      store.setCoordinates(lat, lng);

      const deliveryResult = await locationService.checkDelivery(lat, lng);
      store.setDeliveryResult({
        ...deliveryResult,
        branchId: (loc.branchId as string) ?? deliveryResult.branchId,
        branchName: (loc.branchName as string) ?? deliveryResult.branchName,
      });

      let formattedAddress =
        (typeof loc.formattedAddress === "string" && loc.formattedAddress.trim()) ||
        `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      let areaName = "";
      let city = "";
      let pincode = "";

      try {
        const google = await loadGoogleMaps();
        const geo = await reverseGeocode(google, lat, lng);
        areaName = geo.areaName;
        city = geo.city || geo.areaName || "";
        pincode = geo.pincode;
        if (!loc.formattedAddress) {
          formattedAddress = geo.formattedAddress;
        }
      } catch {
        // Keep server / coordinate fallback
      }

      store.setAddressDetails({ formattedAddress, areaName, city, pincode });
    } catch (error) {
      console.warn("[LocationService] hydrateFromServer failed:", error);
    }
  },

  async syncAddressDelivery(
    addr: Pick<
      DeliveryAddress,
      "id" | "name" | "house" | "street" | "area" | "city" | "state" | "pincode" | "lat" | "lng"
    >,
    options?: { forceGeocode?: boolean },
  ): Promise<{
    lat: number;
    lng: number;
    deliveryResult: DeliveryCheckResponse;
  } | null> {
    const resolved = await locationService.resolveAddressCoordinates(
      addr,
      options,
    );

    if (!resolved) {
      return null;
    }

    const { lat, lng } = resolved;
    const store = useLocationStore.getState();
    store.setCoordinates(lat, lng);

    const deliveryResult = await locationService.checkDelivery(lat, lng);
    store.setDeliveryResult(deliveryResult);

    if (deliveryResult.serviceable) {
      try {
        await apiClient.patch("/customer/location", {
          latitude: lat,
          longitude: lng,
          formattedAddress: addr.name
            ? `${addr.name} - ${addr.house}, ${addr.area || addr.city}`
            : `${addr.house}, ${addr.area || addr.city}`,
        });
      } catch (error) {
        console.error(
          "[LocationService] Failed to update customer location:",
          error,
        );
      }
    }

    return { lat, lng, deliveryResult };
  },
};

export const geocodeAddress = locationService.geocodeAddress;

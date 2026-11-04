"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@shop/lib/api/client";
import { type ApiResponse, type ApiPricingBreakdown } from "@shop/lib/types/api";

export interface PricingItemInput {
  slug?: string;
  foodItemId?: string;
  quantity: number;
}

export interface UseOrderPricingOptions {
  state?: string | null;
  pincode?: string | null;
  packagingCharge?: number;
  discount?: number;
  enabled?: boolean;
}

interface UseOrderPricingResult {
  pricing: ApiPricingBreakdown | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches the full pricing breakdown from the backend PricingService. The UI
 * never calculates tax/delivery/discount itself — it only renders these values.
 */
export function useOrderPricing(
  items: PricingItemInput[],
  options: UseOrderPricingOptions = {}
): UseOrderPricingResult {
  const { state, pincode, packagingCharge, discount, enabled = true } = options;
  const [pricing, setPricing] = useState<ApiPricingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable-ish dependency key so we refetch only on meaningful changes.
  const itemsKey = items
    .map((i) => `${i.slug ?? i.foodItemId}:${i.quantity}`)
    .sort()
    .join("|");
  const optionsKey = JSON.stringify({
    state: state ?? null,
    pincode: pincode ?? null,
    packagingCharge: packagingCharge ?? null,
    discount: discount ?? null,
  });

  useEffect(() => {
    if (!enabled || items.length === 0) {
      setPricing(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiClient
      .post<ApiResponse<ApiPricingBreakdown>>("/pricing/calculate", {
        items: items.map((i) => ({
          slug: i.slug,
          foodItemId: i.foodItemId,
          quantity: i.quantity,
        })),
        state: state ?? undefined,
        pincode: pincode ?? undefined,
        packagingCharge: packagingCharge ?? undefined,
        discount: discount ?? undefined,
      })
      .then((res) => {
        if (cancelled) return;
        if (res.data?.success && res.data.data) {
          setPricing(res.data.data);
        } else {
          setError("Unable to load pricing");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to load pricing");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, optionsKey, enabled]);

  return { pricing, isLoading, error };
}

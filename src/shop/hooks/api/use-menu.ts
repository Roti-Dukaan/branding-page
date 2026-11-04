"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryApi, productApi, branchMenuApi } from "@shop/lib/api/menu.api";
import { normalizeProduct } from "@shop/lib/product-utils";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { asArray } from "@shop/lib/stores/persist-utils";
import type { ApiCategory, ApiProduct, ProductQueryParams } from "@shop/lib/types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.list({ limit: 100, sort: "displayOrder", order: "asc" });
      return (res.data?.items || []) as ApiCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFoods(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ["foods", params],
    queryFn: async () => {
      const res = await productApi.list({ limit: 100, sort: "sort_order", ...params });
      return (res.data?.items || []).map(normalizeProduct) as ApiProduct[];
    },
    staleTime: 60 * 1000,
  });
}

export function useBranchFoods(params?: { categoryId?: string; search?: string }) {
  const branchId = useLocationStore((s) => s.branchId);

  return useQuery({
    queryKey: ["branch-foods", branchId, params],
    queryFn: async () => {
      if (!branchId) return [];
      const res = await branchMenuApi.getMenu(branchId, params);
      return asArray<ApiProduct>(res.data).map(normalizeProduct);
    },
    enabled: !!branchId,
    staleTime: 60 * 1000,
  });
}

export function useBranchCategories() {
  const branchId = useLocationStore((s) => s.branchId);

  return useQuery({
    queryKey: ["branch-categories", branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const res = await branchMenuApi.getCategories(branchId);
      return asArray(res.data);
    },
    enabled: !!branchId,
    staleTime: 60 * 1000,
  });
}

export function useFood(slug: string) {
  return useQuery({
    queryKey: ["food", slug],
    queryFn: async () => {
      const res = await productApi.getBySlug(slug);
      return normalizeProduct(res.data) as ApiProduct;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

export function useFoodsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ["foods-by-category", categorySlug],
    queryFn: async () => {
      const res = await productApi.listByCategory(categorySlug, { limit: 100 });
      return (res.data?.items || []).map(normalizeProduct) as ApiProduct[];
    },
    enabled: !!categorySlug,
    staleTime: 60 * 1000,
  });
}

export function useFeaturedFoods() {
  return useQuery({
    queryKey: ["featured-foods"],
    queryFn: async () => {
      const res = await productApi.list({ limit: 10, featured: true, available: true, sort: "sort_order" });
      return (res.data?.items || []).map(normalizeProduct) as ApiProduct[];
    },
    staleTime: 60 * 1000,
  });
}

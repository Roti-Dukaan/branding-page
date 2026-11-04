"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { MenuItem } from "@shop/lib/types";

export function useMenuItemClick() {
  const router = useRouter();

  return useCallback(
    (item: MenuItem) => {
      const slug = item.slug?.trim() || item.id;
      router.push(`/menu/${slug}/view`);
    },
    [router]
  );
}

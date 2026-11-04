"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@shop/lib/hooks";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { buildProfileUrl } from "../profile-url";
import type { ProfileTab } from "../types";

export function useProfileNavigation() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const activeTab = useProfileStore((s) => s.activeTab);
  const setActiveTab = useProfileStore((s) => s.setActiveTab);
  const setSelectedOrderId = useProfileStore((s) => s.setSelectedOrderId);
  const setSelectedTicketId = useProfileStore((s) => s.setSelectedTicketId);

  const navigateToTab = useCallback(
    (
      tab: ProfileTab,
      options?: {
        orderId?: string | null;
        ticketId?: string | null;
        replace?: boolean;
      },
    ) => {
      if (tab === "order-detail" && options?.orderId) {
        setSelectedOrderId(options.orderId);
      } else if (tab === "support-detail" && options?.ticketId) {
        setSelectedTicketId(options.ticketId);
      } else {
        setActiveTab(tab);
      }

      const url = buildProfileUrl(tab, options, isDesktop);
      const navigate = options?.replace === false ? router.push : router.replace;
      navigate(url, { scroll: false });
    },
    [isDesktop, router, setActiveTab, setSelectedOrderId, setSelectedTicketId],
  );

  return {
    activeTab,
    navigateToTab,
  };
}

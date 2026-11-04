import type { ProfileTab } from "./types";

const REMOVED_TABS = new Set(["payments", "offers", "overview", "notifications", "settings"]);

const VALID_TABS = new Set<ProfileTab>([
  "account",
  "profile",
  "addresses",
  "orders",
  "order-detail",
  "subscriptions",
  "billing",
  "favorites",
  "support",
  "support-new",
  "support-detail",
]);

export function getDefaultProfileTab(isDesktop: boolean): ProfileTab {
  return "profile";
}

export function parseProfileTab(
  tabParam: string | null,
  isDesktop: boolean,
): ProfileTab {
  if (!tabParam || REMOVED_TABS.has(tabParam)) {
    return getDefaultProfileTab(isDesktop);
  }
  if (VALID_TABS.has(tabParam as ProfileTab)) {
    return tabParam as ProfileTab;
  }
  return getDefaultProfileTab(isDesktop);
}

export function buildProfileUrl(
  tab: ProfileTab,
  options?: { orderId?: string | null; ticketId?: string | null },
  isDesktop = true,
): string {
  const defaultTab = getDefaultProfileTab(isDesktop);
  const params = new URLSearchParams();

  if (tab !== defaultTab) {
    params.set("tab", tab);
  }

  if (options?.orderId) {
    params.set("orderId", options.orderId);
  }

  if (options?.ticketId) {
    params.set("ticketId", options.ticketId);
  }

  const query = params.toString();
  return query ? `/profile?${query}` : "/profile";
}

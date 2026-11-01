"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useMediaQuery } from "@shop/lib/hooks";
import { useAuthHydrated } from "@shop/hooks/useAuth";
import { ProfileSidebar } from "@shop/features/profile/components/ProfileSidebar";
import { ProfileAccountHome } from "@shop/features/profile/components/ProfileAccountHome";
import { ProfileEdit } from "@shop/features/profile/components/ProfileEdit";
import { ProfileOrders } from "@shop/features/profile/components/ProfileOrders";
import { ProfileAddresses } from "@shop/features/profile/components/ProfileAddresses";
import AddressSheet from "@shop/components/address/AddressSheet";
import { ProfileOrderDetails } from "@shop/features/profile/components/ProfileOrderDetails";
import { ProfileSubscriptions } from "@shop/features/profile/components/ProfileSubscriptions";
import { ProfileFavorites } from "@shop/features/profile/components/ProfileFavorites";
import { ProfileOffers } from "@shop/features/profile/components/ProfileOffers";
import { ProfileSupport } from "@shop/features/profile/components/ProfileSupport";
import { ProfileSupportNew } from "@shop/features/profile/components/ProfileSupportNew";
import { ProfileSupportDetail } from "@shop/features/profile/components/ProfileSupportDetail";
import { ProfileLogoutDialog } from "@shop/features/profile/components/ProfileLogoutDialog";
import { ProfileBilling } from "@shop/features/profile/components/ProfileBilling";
import { ProfilePayments } from "@shop/features/profile/components/ProfilePayments";
import { useProfileNavigation } from "@shop/features/profile/hooks/useProfileNavigation";
import { parseProfileTab } from "@shop/features/profile/profile-url";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@shop/components/ui/button";

export const dynamic = "force-dynamic";

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authHydrated = useAuthHydrated();
  const { isAuthenticated } = useAuthStore();
  const { activeTab, navigateToTab } = useProfileNavigation();
  const setActiveTab = useProfileStore((s) => s.setActiveTab);
  const setSelectedOrderId = useProfileStore((s) => s.setSelectedOrderId);
  const setSelectedTicketId = useProfileStore((s) => s.setSelectedTicketId);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const highlightOrderId = searchParams.get("orderId");
  const ticketId = searchParams.get("ticketId");

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [authHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;

    const tab = parseProfileTab(searchParams.get("tab"), isDesktop);
    const orderId = searchParams.get("orderId");
    const ticket = searchParams.get("ticketId");

    if (tab === "order-detail" && orderId) {
      setSelectedOrderId(orderId);
      return;
    }

    if (tab === "support-detail" && ticket) {
      setSelectedTicketId(ticket);
      return;
    }

    setActiveTab(tab);
  }, [
    authHydrated,
    isAuthenticated,
    searchParams,
    isDesktop,
    setActiveTab,
    setSelectedOrderId,
    setSelectedTicketId,
  ]);

  const handleMobileBack = () => {
    if (activeTab === "order-detail") {
      navigateToTab("orders");
      return;
    }
    if (activeTab === "support-detail" || activeTab === "support-new") {
      navigateToTab("support");
      return;
    }
    navigateToTab("account");
  };

  const showMobileBack = !isDesktop && activeTab !== "account";

  if (!authHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return isDesktop ? <ProfileEdit /> : <ProfileAccountHome />;
      case "profile":
        return <ProfileEdit />;
      case "addresses":
        return <ProfileAddresses />;
      case "orders":
        return <ProfileOrders highlightOrderId={highlightOrderId} />;
      case "order-detail":
        return <ProfileOrderDetails />;
      case "payments":
        return <ProfilePayments />;
      case "billing":
        return <ProfileBilling />;
      case "subscriptions":
        return <ProfileSubscriptions />;
      case "favorites":
        return <ProfileFavorites />;
      case "offers":
        return <ProfileOffers />;
      case "support":
        return <ProfileSupport />;
      case "support-new":
        return <ProfileSupportNew />;
      case "support-detail":
        return <ProfileSupportDetail />;
      default:
        return isDesktop ? <ProfileEdit /> : <ProfileAccountHome />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {isDesktop && (
          <aside className="w-64 shrink-0">
            <ProfileSidebar />
          </aside>
        )}

        <main className="flex-1 min-w-0">
          {!isDesktop && (
            <div className="mb-4 flex items-center gap-3">
              {showMobileBack ? (
                <Button variant="ghost" size="icon" onClick={handleMobileBack} aria-label="Go back">
                  <ArrowLeft className="size-5" />
                </Button>
              ) : (
                <div className="size-9" aria-hidden />
              )}
              <h1 className="font-heading text-xl font-semibold text-foreground">
                My Account
              </h1>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ProfileLogoutDialog />
      <AddressSheet />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}

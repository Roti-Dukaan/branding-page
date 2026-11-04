"use client";

import type { ReactNode } from "react";
import AuthProvider from "@shop/components/AuthProvider";
import QueryProvider from "@shop/components/providers/query-provider";
import { KitchenStatusProvider } from "@shop/components/kitchen/KitchenStatusProvider";
import { ShopDialogs } from "@/components/ShopDialogs";
import { BrandingFloatingCartBar } from "@/components/BrandingFloatingCartBar";

/** Auth + OTP dialogs for marketing pages (home, contact, policies). */
export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <KitchenStatusProvider>
        <AuthProvider>
          {children}
          <ShopDialogs />
          <BrandingFloatingCartBar />
        </AuthProvider>
      </KitchenStatusProvider>
    </QueryProvider>
  );
}

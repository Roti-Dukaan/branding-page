"use client";

import type { ReactNode } from "react";
import AuthProvider from "@shop/components/AuthProvider";
import QueryProvider from "@shop/components/providers/query-provider";
import { ShopDialogs } from "@/components/ShopDialogs";

/** Auth + OTP dialogs for marketing pages (home, contact, policies). */
export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <ShopDialogs />
      </AuthProvider>
    </QueryProvider>
  );
}

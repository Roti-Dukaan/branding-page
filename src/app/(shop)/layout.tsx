import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { BrandingShopHeader } from "@/components/BrandingShopHeader";
import { Footer } from "@/components/Footer";
import { ShopDialogs } from "@/components/ShopDialogs";
import { BrandingFloatingCartBar } from "@/components/BrandingFloatingCartBar";
import AuthProvider from "@shop/components/AuthProvider";
import QueryProvider from "@shop/components/providers/query-provider";
import { KitchenStatusProvider } from "@shop/components/kitchen/KitchenStatusProvider";
import { Toaster } from "@shop/components/ui/sonner";
import { TooltipProvider } from "@shop/components/ui/tooltip";
import "./customer-globals.css";
import "./shop-branding-overrides.css";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="customer-web min-h-screen flex flex-col bg-cream text-bark overflow-x-clip selection:bg-leaf/15 selection:text-leaf">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <QueryProvider>
            <KitchenStatusProvider>
              <AuthProvider>
                <BrandingShopHeader />
                <ShopDialogs />
                <main className="flex-grow pb-24 pt-20 sm:pb-28">{children}</main>
                <Footer />
                <BrandingFloatingCartBar />
              </AuthProvider>
            </KitchenStatusProvider>
          </QueryProvider>
        </TooltipProvider>
        <Toaster position="top-center" closeButton />
      </ThemeProvider>
    </div>
  );
}

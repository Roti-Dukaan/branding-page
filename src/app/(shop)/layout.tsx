import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { BrandingShopHeader } from "@/components/BrandingShopHeader";
import { Footer } from "@/components/Footer";
import { ShopDialogs } from "@/components/ShopDialogs";
import AuthProvider from "@shop/components/AuthProvider";
import QueryProvider from "@shop/components/providers/query-provider";
import { KitchenStatusProvider } from "@shop/components/kitchen/KitchenStatusProvider";
import { Toaster } from "@shop/components/ui/sonner";
import { TooltipProvider } from "@shop/components/ui/tooltip";
import "./customer-globals.css";
import "./shop-branding-overrides.css";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="customer-web min-h-screen flex flex-col bg-cream text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <QueryProvider>
            <KitchenStatusProvider>
              <AuthProvider>
                <BrandingShopHeader />
                <ShopDialogs />
                <main className="flex-grow pt-20">{children}</main>
                <Footer />
              </AuthProvider>
            </KitchenStatusProvider>
          </QueryProvider>
        </TooltipProvider>
        <Toaster position="top-center" closeButton />
      </ThemeProvider>
    </div>
  );
}

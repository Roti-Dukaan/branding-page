import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { MarketingProviders } from "./MarketingProviders";
import { SitePageHeader } from "./SitePageHeader";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <MarketingProviders>
      <SitePageHeader />
      {children}
      <Footer />
    </MarketingProviders>
  );
}

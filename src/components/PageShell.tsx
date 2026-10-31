import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { SitePageHeader } from "./SitePageHeader";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SitePageHeader />
      {children}
      <Footer />
    </>
  );
}

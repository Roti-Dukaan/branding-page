"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarketingNavLinks } from "./MarketingNavLinks";
import { BrandingMobileNavSheet } from "./BrandingMobileNavSheet";
import { BrandingHeaderDownloadButton } from "./BrandingHeaderDownloadButton";
import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";

export function SitePageHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    if (pathname !== "/" || !href.startsWith("/#")) return;
    event.preventDefault();
    scrollToHomeSection(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sand/80 bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Roti Dukaan home">
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            className="h-12 w-auto drop-shadow-sm sm:h-14"
          />
        </Link>

        <MarketingNavLinks className="flex-1 justify-center" />

        <div className="flex items-center gap-2">
          <BrandingHeaderDownloadButton onNavigate={() => setMobileOpen(false)} />
          <BrandingMobileNavSheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            onNavClick={handleNavClick}
            isNavActive={(href) => isMarketingNavActive(pathname, href)}
          />
        </div>
      </nav>
    </header>
  );
}

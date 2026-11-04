"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { navLinks } from "@/lib/site";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useMounted } from "@shop/lib/hooks";
import { BrandingMobileNavSheet } from "./BrandingMobileNavSheet";
import { BrandingHeaderDownloadButton } from "./BrandingHeaderDownloadButton";

import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";

export function BrandingShopHeader() {
  const pathname = usePathname();
  const mounted = useMounted();
  const { isAuthenticated, setAuthDialogOpen } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    closeMobile();
    if (pathname !== "/" || !href.startsWith("/#")) return;
    event.preventDefault();
    scrollToHomeSection(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-sand/80 bg-cream/95 shadow-[0_6px_24px_-18px_rgba(74,37,18,0.25)] backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Roti Dukaan home">
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            priority
            className="h-11 w-auto drop-shadow-sm sm:h-14"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isMarketingNavActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-display text-[1.05rem] font-medium transition hover:text-leaf ${
                    active ? "font-semibold text-leaf" : "text-bark"
                  }`}
                  onClick={(event) => handleNavClick(event, link.href)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {mounted && !isAuthenticated ? (
            <button
              type="button"
              onClick={() => setAuthDialogOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-sand/80 bg-white px-4 py-2 font-display text-sm font-semibold text-bark transition hover:border-leaf/40 hover:text-leaf sm:inline-flex"
            >
              Sign in
            </button>
          ) : null}
          {mounted && isAuthenticated ? (
            <Link
              href="/profile"
              className="hidden items-center gap-1.5 rounded-full border border-sand/80 bg-white px-4 py-2 font-display text-sm font-semibold text-bark transition hover:border-leaf/40 hover:text-leaf sm:inline-flex"
            >
              <User className="h-4 w-4" strokeWidth={2.2} />
              Account
            </Link>
          ) : null}
          <BrandingHeaderDownloadButton onNavigate={closeMobile} />
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

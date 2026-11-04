"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";
import { BrandingMobileNavSheet } from "./BrandingMobileNavSheet";
import { BrandingHeaderDownloadButton } from "./BrandingHeaderDownloadButton";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    if (pathname !== "/" || !href.startsWith("/#")) return;
    event.preventDefault();
    scrollToHomeSection(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-cream/95 shadow-[0_6px_24px_-18px_rgba(74,37,18,0.6)] backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8">
        <Link
          href="/#home"
          className="flex shrink-0 items-center gap-2 md:ml-0"
          aria-label="Roti Dukaan home"
          onClick={(event) => {
            if (pathname !== "/") return;
            event.preventDefault();
            scrollToHomeSection("/#home");
          }}
        >
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            priority
            className="h-12 w-auto drop-shadow-sm sm:h-14"
          />
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-display text-[1.05rem] font-medium text-bark transition hover:text-leaf"
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

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

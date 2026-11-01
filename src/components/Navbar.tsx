"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";
import { BrandingMobileNavSheet } from "./BrandingMobileNavSheet";

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
          <BrandingMobileNavSheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            onNavClick={handleNavClick}
            isNavActive={(href) => isMarketingNavActive(pathname, href)}
          />
          <Link
            href="/#download"
            className="max-md:hidden inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 font-display text-[0.95rem] font-semibold text-cream shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)] transition hover:-translate-y-0.5 hover:bg-leaf-dark"
          >
            Download App
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}

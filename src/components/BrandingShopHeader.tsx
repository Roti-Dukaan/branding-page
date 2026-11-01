"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User } from "lucide-react";
import { navLinks } from "@/lib/site";
import { useCartCount } from "@shop/lib/store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useMounted } from "@shop/lib/hooks";
import { BrandingMobileNavSheet } from "./BrandingMobileNavSheet";
import { ArrowRight } from "./ui";

import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";

export function BrandingShopHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
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
          <BrandingMobileNavSheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            onNavClick={handleNavClick}
            isNavActive={(href) => isMarketingNavActive(pathname, href)}
          />

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
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand/80 bg-white text-leaf transition hover:border-leaf/40 hover:bg-leaf-soft/50"
            aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/#download"
            className="max-md:hidden inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 font-display text-[0.95rem] font-semibold text-cream shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)] transition hover:-translate-y-0.5 hover:bg-leaf-dark"
          >
            Download App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

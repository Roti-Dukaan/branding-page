"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import {
  Home,
  UtensilsCrossed,
  CalendarClock,
  Mail,
  ShoppingBag,
  Smartphone,
  ChevronRight,
  Menu,
  LogOut,
} from "lucide-react";
import { navLinks } from "@/lib/site";
import { useCartCount } from "@shop/lib/store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { buildProfileUrl } from "@shop/features/profile/profile-url";
import { PROFILE_NAV_ITEMS } from "@shop/features/profile/profile-nav";
import type { ProfileTab } from "@shop/features/profile/types";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@shop/components/ui/sheet";
import { useBrandingChromeStore } from "@/lib/branding-chrome-store";

const NAV_ICONS: Record<string, typeof Home> = {
  "/#home": Home,
  "/menu": UtensilsCrossed,
  "/subscriptions": CalendarClock,
  "/contact": Mail,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  isNavActive: (href: string) => boolean;
};

export function BrandingMobileNavSheet({
  open,
  onOpenChange,
  onNavClick,
  isNavActive,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartCount();
  const { isAuthenticated, user, setAuthDialogOpen } = useAuthStore();
  const activeProfileTab = useProfileStore((s) => s.activeTab);

  const setMobileNavOpen = useBrandingChromeStore((s) => s.setMobileNavOpen);

  useEffect(() => {
    setMobileNavOpen(open);
    return () => setMobileNavOpen(false);
  }, [open, setMobileNavOpen]);

  const handleOpenChange = (next: boolean) => {
    setMobileNavOpen(next);
    onOpenChange(next);
  };

  const close = () => handleOpenChange(false);

  const goToProfileTab = (tab: ProfileTab) => {
    close();
    router.push(buildProfileUrl(tab, undefined, false));
  };

  const isProfileTabActive = (tab: ProfileTab) =>
    pathname.startsWith("/profile") && activeProfileTab === tab;

  const navRowClass = (active: boolean) =>
    `group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left font-display text-[1.02rem] transition ${
      active
        ? "bg-leaf/12 font-semibold text-leaf ring-1 ring-leaf/15"
        : "font-medium text-bark/90 hover:bg-white/80"
    }`;

  const navIconClass = (active: boolean) =>
    `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
      active
        ? "bg-leaf text-cream shadow-sm"
        : "bg-cream-deep/80 text-leaf group-hover:bg-leaf/10"
    }`;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand/80 bg-white text-bark shadow-sm transition hover:border-leaf/40 hover:text-leaf active:scale-95 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" strokeWidth={2.2} />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-[min(100%,22rem)] flex-col gap-0 border-l border-sand/90 bg-cream p-0 text-bark shadow-[-8px_0_40px_rgba(74,37,18,0.12)]"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* Header */}
        <div className="border-b border-sand/70 bg-gradient-to-b from-cream-deep/50 to-cream px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-11 w-11 rounded-full bg-white p-0.5 shadow-sm ring-1 ring-sand/80"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold leading-tight text-bark">
                Roti Dukaan
              </p>
              <p className="truncate text-xs text-bark/60">
                {isAuthenticated && user?.name
                  ? `Hi, ${user.name.split(" ")[0]}`
                  : "Fresh homemade meals"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-widest text-bark/45">
            Explore
          </p>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const active = isNavActive(link.href);
              const Icon = NAV_ICONS[link.href] ?? Home;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => onNavClick(event, link.href)}
                  className={navRowClass(active)}
                >
                  <span className={navIconClass(active)}>
                    <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.2} />
                  </span>
                  <span className="flex-1">{link.label}</span>
                  {active ? (
                    <ChevronRight className="h-4 w-4 text-leaf/70" aria-hidden />
                  ) : null}
                </Link>
              );
            })}

            {isAuthenticated
              ? PROFILE_NAV_ITEMS.map((item) => {
                  const active = isProfileTabActive(item.tab);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => goToProfileTab(item.tab)}
                      className={navRowClass(active)}
                    >
                      <span className={navIconClass(active)}>
                        <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.2} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {active ? (
                        <ChevronRight className="h-4 w-4 text-leaf/70" aria-hidden />
                      ) : null}
                    </button>
                  );
                })
              : null}
          </nav>

          {cartCount > 0 ? (
            <Link
              href="/cart"
              onClick={close}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-saffron/25 bg-saffron/8 px-3 py-3 font-display text-sm font-semibold text-bark transition hover:bg-saffron/12"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron text-white">
                <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex-1">View cart ({cartCount})</span>
              <ChevronRight className="h-4 w-4 text-bark/40" />
            </Link>
          ) : null}

        </div>

        {/* Footer CTAs */}
        <div className="mt-auto space-y-2.5 border-t border-sand/70 bg-cream-deep/30 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                close();
                setAuthDialogOpen(true);
              }}
              className="w-full rounded-2xl bg-leaf py-3.5 font-display text-sm font-semibold text-cream shadow-[0_4px_14px_-4px_rgba(31,90,46,0.55)] transition hover:bg-leaf-dark"
            >
              Sign in with OTP
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                close();
                document.getElementById("profile-logout-trigger")?.click();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-white py-3.5 font-display text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
              Log out
            </button>
          )}
          <Link
            href="/#download"
            onClick={close}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-sand/90 bg-white py-3.5 font-display text-sm font-semibold text-leaf shadow-sm transition hover:border-leaf/30 hover:bg-cream"
          >
            <Smartphone className="h-4 w-4" strokeWidth={2.2} />
            Download App
            <ChevronRight className="h-4 w-4 opacity-60" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

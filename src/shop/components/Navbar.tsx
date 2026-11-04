"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  ShoppingBag,
  User,
  MapPin,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { UserAvatar } from "@shop/components/UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@shop/components/ui/sheet";
import { useCartStore, useCartCount } from "@shop/lib/store";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { buildProfileUrl } from "@shop/features/profile/profile-url";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { formatDeliveryLocationLabel } from "@shop/lib/geo/format-delivery-location";
import { useMounted } from "@shop/lib/hooks";
import { cn } from "@shop/lib/utils";
import AuthDialog from "@shop/components/auth/AuthDialog";
import ProfileNameDialog from "@shop/components/auth/ProfileNameDialog";
import LocationDialog from "@shop/components/location/LocationDialog";
import { locationService } from "@shop/services/location.service";
import { loadGoogleMaps } from "@shop/lib/google-maps";
const BASE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const autoDetectStartedRef = useRef(false);

  const cartCount = useCartCount();
  const { isAuthenticated, user, setAuthDialogOpen } = useAuthStore();
  const router = useRouter();
  const {
    areaName,
    city,
    formattedAddress,
  } = useLocationStore();
  const { addresses, selectedAddressId, fetchAddresses } = useAddressStore();
  const mounted = useMounted();

  const subscriptionLink = isAuthenticated
    ? { href: buildProfileUrl("subscriptions"), label: "My Subscriptions" }
    : { href: "/subscriptions", label: "Subscriptions" };

  const navLinks = [
    BASE_NAV_LINKS[0],
    BASE_NAV_LINKS[1],
    subscriptionLink,
    BASE_NAV_LINKS[2],
    BASE_NAV_LINKS[3],
  ];

  const isNavLinkActive = (href: string) => {
    if (href.startsWith("/profile")) {
      return pathname === "/profile" && searchParams.get("tab") === "subscriptions";
    }
    return pathname === href;
  };

  const selectedAddress = selectedAddressId
    ? addresses.find((address) => address.id === selectedAddressId) ?? null
    : null;

  const locationLabel = mounted
    ? formatDeliveryLocationLabel({
        address: selectedAddress,
        areaName,
        city,
        formattedAddress,
      })
    : "Choose Delivery Location";

  const handleAuthClick = () => {
    setAuthDialogOpen(true);
  };

  const openProfile = (desktop: boolean) => {
    router.push(buildProfileUrl(desktop ? "profile" : "account", undefined, desktop));
  };

  const handleLocationClick = () => {
    setLocationOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      void locationService.hydrateFromServer();
    }
  }, [isAuthenticated, fetchAddresses]);

  useEffect(() => {
    let cancelled = false;

    const runAutoDetect = async () => {
      if (cancelled || autoDetectStartedRef.current) return;
      autoDetectStartedRef.current = true;

      if (isAuthenticated) return;

      if (useLocationStore.getState().isLocationSet()) return;
      if (typeof navigator === "undefined" || !navigator.geolocation) return;

      try {
        const permission = await navigator.permissions
          ?.query({ name: "geolocation" })
          .catch(() => null);

        if (permission?.state === "denied") return;

        const [position, google] = await Promise.all([
          locationService.getCurrentPosition(),
          loadGoogleMaps(),
        ]);

        if (cancelled || useLocationStore.getState().isLocationSet()) return;

        await locationService.verifyAndSave(
          google,
          position.coords.latitude,
          position.coords.longitude,
        );
      } catch {
        // Silent fail on first-visit auto-detect
      }
    };

    if (useLocationStore.persist.hasHydrated()) {
      void runAutoDetect();
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = useLocationStore.persist.onFinishHydration(() => {
      void runAutoDetect();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isAuthenticated]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm transition-all duration-300"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between" suppressHydrationWarning>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/roti_dukaan_logo.png"
                alt="Roti Dukaan"
                width={48}
                height={48}
                priority
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                sizes="48px"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-foreground tracking-tight">
                  Roti Dukaan
                </span>
                <span className="block text-xs text-muted-foreground -mt-0.5">
                  Fresh Homemade Meals
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isNavLinkActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Delivery Location - Desktop */}
              <button
                onClick={handleLocationClick}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Delivery Location
                  </span>
                  <span className="text-xs font-semibold text-foreground leading-tight" suppressHydrationWarning>
                    {locationLabel}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </button>

              {/* Auth - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {isAuthenticated ? (
                  <Link href="/profile" onClick={() => openProfile(true)}>
                    <UserAvatar
                      name={user?.name}
                      phone={user?.phone}
                      avatar={user?.avatar}
                      className="cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                    />
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAuthClick()}
                    className="bg-primary hover:bg-primary/90 text-sm font-medium"
                  >
                    Login
                  </Button>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Cart ({cartCount})</span>
                </Button>
              </Link>

              {/* Mobile Auth Icon */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => openProfile(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={handleAuthClick}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-3/4 pb-safe">
                  <SheetTitle className="text-lg font-bold">
                    Roti Dukaan
                  </SheetTitle>

                  {/* Delivery Location - Mobile (in menu) */}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLocationClick();
                    }}
                    className="mt-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 w-full text-left cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">
                        Delivery Location
                      </span>
                      <span className="text-sm font-semibold text-foreground truncate block" suppressHydrationWarning>
                        {locationLabel}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>

                  <nav className="mt-4 flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isNavLinkActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {!isAuthenticated && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="space-y-2 px-4">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 min-h-[44px]"
                          onClick={() => {
                            setMobileOpen(false);
                            handleAuthClick();
                          }}
                        >
                          Login with OTP
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Global Dialogs */}
      <AuthDialog />
      <ProfileNameDialog />
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </>
  );
}

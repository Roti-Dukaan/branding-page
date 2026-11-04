"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Store } from "lucide-react";
import { useCartCount, useCartTotal } from "@shop/lib/store";
import { useMounted } from "@shop/lib/hooks";
import { formatPrice } from "@shop/lib/utils";
import { useKitchenStatus } from "@shop/components/kitchen/KitchenStatusProvider";
import {
  formatKitchenCountdown,
  formatKitchenReopen,
} from "@shop/lib/kitchen-reopen-display";
import { useBrandingChromeStore } from "@/lib/branding-chrome-store";

const CART_HIDDEN_PATHS = [
  "/cart",
  "/checkout",
  "/subscriptions/checkout",
  "/subscription-checkout",
];

function shouldHideCartBar(pathname: string) {
  return CART_HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Shared width for kitchen strip + cart bar so they stack flush. */
const BOTTOM_BAR_WIDTH =
  "mx-auto w-full max-w-[min(100%,36rem)] sm:max-w-xl";

function BrandingKitchenClosedStrip() {
  const { data, isLoading, acceptingOrders, isMaintenance, isClosed } = useKitchenStatus();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (isLoading || acceptingOrders) return null;

  const reopenAt = data?.scheduledReopenAt;
  const countdown = reopenAt ? formatKitchenCountdown(reopenAt) : null;
  const title = isMaintenance ? "Kitchen under maintenance" : "Kitchen closed";
  const subtitle = reopenAt
    ? `Opens ${formatKitchenReopen(reopenAt)}`
    : isClosed
      ? "Not accepting orders right now"
      : (data?.message?.trim() || "Not accepting orders right now");

  return (
    <div
      className="w-full rounded-2xl bg-[#3D4152] px-4 py-3 font-display text-cream shadow-[0_6px_20px_-8px_rgba(0,0,0,0.45)] sm:px-5"
      role="status"
    >
      <div className="flex items-center gap-3">
        <Store className="size-5 shrink-0 text-white/70" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">{title}</p>
          <p className="truncate text-xs text-white/75">{subtitle}</p>
        </div>
        {countdown ? (
          <span className="shrink-0 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white">
            {countdown}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function BrandingFloatingCartBar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const itemCount = useCartCount();
  const cartTotal = useCartTotal();
  const { acceptingOrders, isLoading: kitchenLoading } = useKitchenStatus();
  const mobileNavOpen = useBrandingChromeStore((s) => s.mobileNavOpen);

  if (mobileNavOpen) {
    return null;
  }

  const showKitchenStrip = mounted && !kitchenLoading && !acceptingOrders;
  const showCartBar =
    mounted && itemCount > 0 && !shouldHideCartBar(pathname);

  if (!showKitchenStrip && !showCartBar) {
    return null;
  }

  const label = `${itemCount} ${itemCount === 1 ? "Item" : "Items"}`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5"
      role="region"
      aria-label="Order status and cart"
    >
      <div className={`pointer-events-auto ${BOTTOM_BAR_WIDTH} space-y-2`}>
        {showKitchenStrip ? <BrandingKitchenClosedStrip /> : null}

        {showCartBar ? (
          <Link
            href="/cart"
            className="flex w-full items-center gap-2.5 rounded-2xl bg-leaf px-4 py-3.5 font-display text-cream shadow-[0_8px_28px_-6px_rgba(31,90,46,0.5)] transition hover:bg-leaf-dark active:scale-[0.98] sm:gap-3 sm:px-5 sm:py-4"
          >
            <span className="shrink-0 rounded-full bg-saffron px-2.5 py-1 text-[11px] font-bold leading-none sm:text-xs">
              {label}
            </span>
            <span className="text-sm font-bold sm:text-base">View Cart</span>
            <span className="ml-auto text-base font-extrabold tracking-tight sm:text-lg">
              {formatPrice(Math.round(cartTotal))}
            </span>
            <ChevronRight className="size-5 shrink-0 opacity-85" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

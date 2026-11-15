"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useMounted } from "@shop/lib/hooks";
import { cn } from "@shop/lib/utils";

const actionClass =
  "hidden items-center gap-1.5 rounded-full border border-sand/80 bg-white px-4 py-2 font-display text-sm font-semibold text-bark transition hover:border-leaf/40 hover:text-leaf sm:inline-flex cursor-pointer";

/** Sign in / Account — desktop header (mobile uses BrandingMobileNavSheet). */
export function BrandingHeaderAuthActions({ className }: { className?: string }) {
  const mounted = useMounted();
  const { isAuthenticated, setAuthDialogOpen } = useAuthStore();

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Link href="/profile" className={cn(actionClass, className)}>
        <User className="h-4 w-4" strokeWidth={2.2} />
        Account
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAuthDialogOpen(true)}
      className={cn(actionClass, className)}
    >
      Sign in
    </button>
  );
}

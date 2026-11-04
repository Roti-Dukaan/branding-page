"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { cn } from "@shop/lib/utils";
import { useAuth } from "@shop/hooks/useAuth";

export function ProfileLogoutDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await logout();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        id="profile-logout-trigger"
        type="button"
        className="hidden"
        onClick={() => setOpen(true)}
        aria-hidden
      />
      <Dialog open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
        <DialogContent
          showCloseButton={!submitting}
          className="gap-0 overflow-hidden rounded-3xl border border-sand/80 bg-cream p-0 shadow-[0_24px_60px_-28px_rgba(74,37,18,0.45)] sm:max-w-[22rem]"
        >
          <DialogHeader className="space-y-3 px-6 pt-6 pb-2 text-left">
            <div
              className="flex size-12 items-center justify-center rounded-2xl bg-leaf-soft text-leaf"
              aria-hidden
            >
              <LogOut className="size-5" strokeWidth={2.2} />
            </div>
            <DialogTitle className="font-display text-xl font-bold leading-snug text-bark">
              Log out?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-bark/70">
              You&apos;ll need to sign in again to place orders and manage your account.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-sand/60 bg-white/70 px-4 py-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setOpen(false)}
              className={cn(
                "w-full rounded-2xl border border-sand/90 bg-white py-3.5 font-display text-sm font-semibold text-bark",
                "transition hover:border-leaf/35 hover:bg-cream disabled:opacity-60",
              )}
            >
              Stay signed in
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleLogout()}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/90",
                "bg-red-50 py-3.5 font-display text-sm font-semibold text-red-700",
                "transition hover:bg-red-100 disabled:opacity-60",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Logging out…
                </>
              ) : (
                <>
                  <LogOut className="size-4" strokeWidth={2.2} />
                  Log out
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@shop/components/ui/sheet";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { UserAvatar } from "@shop/components/UserAvatar";
import { Separator } from "@shop/components/ui/separator";
import { cn } from "@shop/lib/utils";
import { LogOut } from "lucide-react";
import { PROFILE_NAV_ITEMS } from "../profile-nav";
import type { ProfileTab } from "../types";
import { useProfileNavigation } from "../hooks/useProfileNavigation";

interface ProfileMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileMobileNav({ open, onOpenChange }: ProfileMobileNavProps) {
  const { activeTab, navigateToTab } = useProfileNavigation();
  const { user } = useAuthStore();

  const handleNav = (tab: ProfileTab) => {
    navigateToTab(tab);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Content side="left">
        <SheetHeader>
          <SheetTitle className="font-heading">My Account</SheetTitle>
        </SheetHeader>

        {/* User Info */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name} phone={user?.phone} avatar={user?.avatar} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold text-foreground">
                {user?.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.phone}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {PROFILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNav(item.tab)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}

          <Separator className="my-2" />

          <button
            onClick={() => {
              onOpenChange(false);
              document.getElementById("profile-logout-trigger")?.click();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4 shrink-0" />
            Logout
          </button>
        </nav>
      </Content>
    </Sheet>
  );
}

function Content({
  side,
  children,
}: {
  side: "left";
  children: React.ReactNode;
}) {
  return (
    <SheetContent side={side} className="w-72 p-0">
      {children}
    </SheetContent>
  );
}

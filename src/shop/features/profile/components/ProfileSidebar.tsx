"use client";

import { useAuthStore } from "@shop/lib/stores/auth-store";
import { UserAvatar } from "@shop/components/UserAvatar";
import { Separator } from "@shop/components/ui/separator";
import { cn } from "@shop/lib/utils";
import { LogOut } from "lucide-react";
import { PROFILE_NAV_ITEMS } from "../profile-nav";
import { useProfileNavigation } from "../hooks/useProfileNavigation";

export function ProfileSidebar() {
  const { activeTab, navigateToTab } = useProfileNavigation();
  const { user } = useAuthStore();

  return (
    <div className="sticky top-24 flex flex-col">
      {/* User Card */}
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Member since Jul 2026
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-3 rounded-xl bg-card p-2 ring-1 ring-foreground/10">
        {PROFILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => navigateToTab(item.tab)}
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
            document.getElementById("profile-logout-trigger")?.click();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </nav>
    </div>
  );
}

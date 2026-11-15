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
      <div className="rounded-2xl border border-sand/80 bg-white/90 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.name} phone={user?.phone} avatar={user?.avatar} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-bark">
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
      <nav className="mt-3 rounded-2xl border border-sand/80 bg-white/90 p-2 shadow-sm">
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
                  ? "bg-leaf-soft font-semibold text-leaf"
                  : "text-bark/70 hover:bg-cream-deep/80 hover:text-bark"
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

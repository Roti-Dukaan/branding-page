"use client";

import * as React from "react";
import { Bell, CheckCheck, Truck, Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@shop/components/ui/popover";
import { Button } from "@shop/components/ui/button";
import { useNotifications } from "../hooks/useNotifications";
import { useAuthStore } from "@shop/lib/stores/auth-store";

function iconForType(type: string) {
  if (type.startsWith("DELIVERY")) return Truck;
  return Info;
}

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) return null;

  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    refetch,
  } = useNotifications();

  const [open, setOpen] = React.useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) refetch();
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications ({unreadCount})</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up!
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconForType(n.type);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                        n.isRead ? "" : "bg-primary/5"
                      }`}
                    >
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

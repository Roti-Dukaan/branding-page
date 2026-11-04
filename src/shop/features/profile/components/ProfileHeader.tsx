"use client";

import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { MENU_ITEMS } from "@shop/lib/data";
import { Card, CardContent } from "@shop/components/ui/card";
import { UserAvatar } from "@shop/components/UserAvatar";
import { Badge } from "@shop/components/ui/badge";
import { Button } from "@shop/components/ui/button";
import { Separator } from "@shop/components/ui/separator";
import {
  ShoppingBag,
  CreditCard,
  Heart,
  MapPin,
  ArrowRight,
  Flame,
} from "lucide-react";

export function ProfileHeader() {
  const { user } = useAuthStore();
  const { addresses } = useAddressStore();
  const { favorites, subscription, orders } = useProfileStore();

  const favoriteItems = favorites
    .map((f) => MENU_ITEMS.find((m) => m.id === f.menuItemId))
    .filter(Boolean);

  const topFavorite = favoriteItems[0];

  const stats = [
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: orders.length.toString(),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: CreditCard,
      label: "Active Subscription",
      value: subscription ? subscription.planName : "None",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Heart,
      label: "Favorite Meal",
      value: topFavorite?.name || "None",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: MapPin,
      label: "Saved Addresses",
      value: addresses.length.toString(),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 ring-1 ring-foreground/10">
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.name} phone={user?.phone} avatar={user?.avatar} size="lg" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Hello, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ready for another healthy homemade meal?
            </p>
          </div>
        </div>
        <Flame className="absolute top-4 right-4 size-16 text-primary/10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} size="sm">
              <CardContent className="flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

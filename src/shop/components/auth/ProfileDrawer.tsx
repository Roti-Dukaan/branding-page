"use client";

import Link from "next/link";
import {
  User,
  MapPin,
  Package,
  CreditCard,
  LogOut,
  ChevronRight,
  Home,
  Briefcase,
  MapPinned,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@shop/components/ui/sheet";
import { UserAvatar } from "@shop/components/UserAvatar";
import { Badge } from "@shop/components/ui/badge";
import { Button } from "@shop/components/ui/button";
import { Separator } from "@shop/components/ui/separator";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { buildProfileUrl } from "@shop/features/profile/profile-url";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useAuth } from "@shop/hooks/useAuth";

const addressTypeIcons = {
  home: Home,
  work: Briefcase,
  other: MapPinned,
};

export default function ProfileDrawer() {
  const { user } = useAuthStore();
  const { addresses, addressSheetOpen, setAddressSheetOpen } = useAddressStore();
  const { logout } = useAuth();

  if (!user) return null;

  return (
    <Sheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen}>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-lg font-bold">My Profile</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.name}
              phone={user.phone}
              avatar={user.avatar}
              size="lg"
              className="ring-2 ring-primary/20"
            />
            <div>
              <h3 className="font-bold text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
              {user.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Saved Addresses */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">
              Saved Addresses
            </h4>
            {addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved addresses yet.
              </p>
            ) : (
              <div className="space-y-2">
                {addresses.slice(0, 3).map((addr) => {
                   const Icon = addressTypeIcons[addr.addressType] || Home;
                  return (
                    <div
                      key={addr.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground capitalize">
                          {addr.addressType}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {addr.house}, {addr.area || addr.street || addr.city}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-[9px] shrink-0">
                          Default
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Subscription */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Subscription Plan</span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              None
            </Badge>
          </div>

          {/* Recent Orders */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">
              Recent Orders
            </h4>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No orders yet. Start ordering!
              </p>
            </div>
          </div>

          <Separator />

          {/* Quick Links */}
          <div className="space-y-1">
            <Link
              href={buildProfileUrl("subscriptions")}
              onClick={() => setAddressSheetOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              My Subscriptions
              <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
            </Link>
          </div>

          <Separator />

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={async () => {
              await logout();
              setAddressSheetOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

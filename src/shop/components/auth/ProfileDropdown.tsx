"use client";

import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Gift,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shop/components/ui/dropdown-menu";
import { UserAvatar } from "@shop/components/UserAvatar";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { useAuth } from "@shop/hooks/useAuth";

export default function ProfileDropdown() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const goTo = (path: string) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <UserAvatar
          name={user.name}
          phone={user.phone}
          avatar={user.avatar}
          className="cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
          <div className="flex items-center gap-3 py-1">
            <UserAvatar name={user.name} phone={user.phone} avatar={user.avatar} size="sm" />
            <div>
              <p className="font-semibold text-sm text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.phone}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <User className="h-4 w-4" />
            My Profile
          </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <Package className="h-4 w-4" />
            My Orders
          </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <Heart className="h-4 w-4" />
            Favorites
          </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <Gift className="h-4 w-4" />
            Offers & Coupons
          </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <Bell className="h-4 w-4" />
            Notifications
          </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => goTo("/profile")}>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

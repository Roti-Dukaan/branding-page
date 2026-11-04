import {
  User,
  MapPin,
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  Heart,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import type { ProfileTab } from "./types";

export const PROFILE_NAV_ITEMS: {
  tab: ProfileTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { tab: "profile", label: "My Profile", icon: User },
  { tab: "addresses", label: "Saved Addresses", icon: MapPin },
  { tab: "orders", label: "My Orders", icon: ShoppingBag },
  { tab: "subscriptions", label: "My Subscriptions", icon: UtensilsCrossed },
  { tab: "billing", label: "Billing", icon: CreditCard },
  { tab: "favorites", label: "Favorites", icon: Heart },
  { tab: "support", label: "Help & Support", icon: LifeBuoy },
];

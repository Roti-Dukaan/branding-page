import type { User } from "@shop/lib/types";

/** Whether the customer has a real display name (not phone fallback). */
export function userHasProfileName(user: User | null, fullName?: string | null): boolean {
  if (fullName?.trim()) return true;
  if (!user?.name?.trim()) return false;
  const name = user.name.trim();
  if (name === "User") return false;
  if (user.phone && name === user.phone) return false;
  return true;
}

/** Default receiver name from profile for address forms. */
export function defaultReceiverName(user: User | null): string {
  if (!user?.name?.trim()) return "";
  const name = user.name.trim();
  if (name === "User" || (user.phone && name === user.phone)) return "";
  return name;
}

/** Default receiver phone from profile for address forms. */
export function defaultReceiverPhone(user: User | null): string {
  return user?.phone?.trim() || "";
}

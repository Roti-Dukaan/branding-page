/** Strip auto-generated Dicebear avatars that can look gendered. */
export function sanitizeUserAvatar(avatar?: string | null): string | undefined {
  if (!avatar) return undefined;
  if (avatar.includes("dicebear.com") && avatar.includes("avataaars")) return undefined;
  return avatar;
}

export function isCustomUserAvatar(avatar?: string | null): avatar is string {
  return Boolean(sanitizeUserAvatar(avatar));
}

export function getUserInitials(name?: string | null, phone?: string | null): string {
  const fromName = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (fromName && fromName.length >= 2 && !/^\d+$/.test(fromName)) {
    return fromName;
  }

  const digits = phone?.replace(/\D/g, "").slice(-2);
  return digits || "U";
}

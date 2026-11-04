"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@shop/components/ui/avatar";
import { cn } from "@shop/lib/utils";
import { isCustomUserAvatar } from "@shop/lib/user-avatar";

type UserAvatarProps = {
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
  fallbackClassName?: string;
};

const ICON_SIZE: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "size-3",
  default: "size-4",
  lg: "size-5",
};

/** Gender-neutral profile avatar — custom upload only, otherwise a plain user icon. */
export function UserAvatar({
  name,
  phone,
  avatar,
  size = "default",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const customAvatar = isCustomUserAvatar(avatar) ? avatar : undefined;
  const label = name?.trim() || phone || "User";

  return (
    <Avatar size={size} className={className}>
      {customAvatar ? <AvatarImage src={customAvatar} alt={label} /> : null}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary",
          fallbackClassName,
        )}
      >
        <User className={ICON_SIZE[size]} aria-hidden />
        <span className="sr-only">{label}</span>
      </AvatarFallback>
    </Avatar>
  );
}

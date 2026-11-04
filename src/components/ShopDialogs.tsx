"use client";

import AuthDialog from "@shop/components/auth/AuthDialog";
import ProfileNameDialog from "@shop/components/auth/ProfileNameDialog";
import { ProfileLogoutDialog } from "@shop/features/profile/components/ProfileLogoutDialog";

/** OTP login modals — stay on the current page (no /login redirect). */
export function ShopDialogs() {
  return (
    <>
      <AuthDialog />
      <ProfileNameDialog />
      <ProfileLogoutDialog />
    </>
  );
}

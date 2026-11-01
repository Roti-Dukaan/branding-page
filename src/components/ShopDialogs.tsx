"use client";

import AuthDialog from "@shop/components/auth/AuthDialog";
import ProfileNameDialog from "@shop/components/auth/ProfileNameDialog";

/** OTP login modals — stay on the current page (no /login redirect). */
export function ShopDialogs() {
  return (
    <>
      <AuthDialog />
      <ProfileNameDialog />
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import { SmartDownloadPillButton } from "./SmartDownloadPillButton";

/** Matches hero `Order Now` pill sizing (see Hero.tsx + PillButton). */
export function BrandingHeaderDownloadButton({
  onNavigate,
  children,
}: {
  onNavigate?: () => void;
  children?: ReactNode;
}) {
  return (
    <SmartDownloadPillButton
      onNavigate={onNavigate}
      className="shrink-0 gap-1.5! whitespace-nowrap px-5! py-2! text-[0.95rem]! shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)]! [&_svg]:h-3.5! [&_svg]:w-3.5!"
    >
      {children ?? "Download App"}
    </SmartDownloadPillButton>
  );
}

"use client";

import type { ReactNode } from "react";
import { useSmartDownloadHref } from "@/hooks/useSmartDownloadHref";
import { ArrowRight } from "./ui";

export function SmartDownloadPillButton({
  children,
  className = "",
  onNavigate,
}: {
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const href = useSmartDownloadHref();
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 font-display text-base font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(31,90,46,0.6)] transition hover:-translate-y-0.5 hover:bg-leaf-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ${className}`}
      {...(isExternal ? { rel: "noopener noreferrer" } : {})}
      onClick={() => onNavigate?.()}
    >
      {children}
      <ArrowRight />
    </a>
  );
}

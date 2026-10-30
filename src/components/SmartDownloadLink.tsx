"use client";

import type { ReactNode } from "react";
import { useSmartDownloadHref } from "@/hooks/useSmartDownloadHref";

type SmartDownloadLinkProps = {
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export function SmartDownloadLink({ children, className = "", onNavigate }: SmartDownloadLinkProps) {
  const href = useSmartDownloadHref();
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      {...(isExternal ? { rel: "noopener noreferrer" } : {})}
      onClick={() => onNavigate?.()}
    >
      {children}
    </a>
  );
}

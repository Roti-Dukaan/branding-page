"use client";

import { useEffect, useRef } from "react";
import { androidAppIntentUrl, customSchemeUrl } from "@/lib/app-open-links";

type Props = {
  /** App route path, e.g. `/menu/brown-rice` */
  path: string;
};

function isMobileUa(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

/**
 * On mobile, attempt to open the native app immediately (Swiggy-style).
 * Browsers that block auto-nav still show the share landing + Open in app button.
 */
export function OpenInAppAutoRedirect({ path }: Props) {
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current || !isMobileUa()) return;
    tried.current = true;

    const httpsPath = path.startsWith("/") ? path : `/${path}`;
    const target = isAndroid()
      ? androidAppIntentUrl(httpsPath)
      : customSchemeUrl(httpsPath);

    const t = window.setTimeout(() => {
      window.location.href = target;
    }, 80);

    return () => window.clearTimeout(t);
  }, [path]);

  return null;
}

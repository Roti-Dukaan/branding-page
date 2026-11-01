"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll to `#section` after landing on `/` (Next.js client nav often skips native hash scroll). */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash;
    if (!hash) return;

    const scrollToTarget = () => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const id = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

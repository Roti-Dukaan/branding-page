"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import { isMarketingNavActive, scrollToHomeSection } from "@/lib/nav-utils";

export function MarketingNavLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ul className={`hidden items-center gap-8 md:flex ${className}`.trim()}>
      {navLinks.map((link) => {
        const active = isMarketingNavActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`font-display text-[1.05rem] font-medium transition hover:text-leaf ${
                active ? "font-semibold text-leaf" : "text-bark"
              }`}
              onClick={(event) => {
                if (pathname !== "/" || !link.href.startsWith("/#")) return;
                event.preventDefault();
                scrollToHomeSection(link.href);
              }}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

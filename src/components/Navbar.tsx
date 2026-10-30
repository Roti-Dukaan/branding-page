"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import { SmartDownloadPillButton } from "./SmartDownloadPillButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-cream/95 shadow-[0_6px_24px_-18px_rgba(74,37,18,0.6)] backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-6 sm:px-8">
        <Link href="#home" className="ml-5 flex shrink-0 items-center gap-2 md:ml-0" aria-label="Roti Dukaan home">
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            priority
            className="h-14 w-auto drop-shadow-sm"
          />
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-display text-[1.05rem] font-medium text-bark transition hover:text-leaf"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <SmartDownloadPillButton className="max-md:gap-1.5! max-md:px-3! max-md:py-1.5! max-md:text-xs! max-md:shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)] md:px-5! md:py-2.5! md:text-[0.95rem]! max-md:[&_svg]:h-3.5 max-md:[&_svg]:w-3.5">
          Download App
        </SmartDownloadPillButton>
      </nav>
    </header>
  );
}

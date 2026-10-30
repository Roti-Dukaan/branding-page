"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import { SmartDownloadPillButton } from "./SmartDownloadPillButton";

export function Navbar() {
  const [open, setOpen] = useState(false);
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
        scrolled || open
          ? "bg-cream/95 shadow-[0_6px_24px_-18px_rgba(74,37,18,0.6)] backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-8">
        <Link href="#home" className="flex shrink-0 items-center gap-2" aria-label="Roti Dukaan home">
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            priority
            className="h-11 w-auto drop-shadow-sm sm:h-14"
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

        <div className="hidden md:block">
          <SmartDownloadPillButton className="px-5 py-2.5 text-[0.95rem]">
            Download App
          </SmartDownloadPillButton>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <SmartDownloadPillButton className="gap-1 px-3 py-2 text-xs font-semibold shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)] [&_svg]:h-3.5 [&_svg]:w-3.5">
            Download App
          </SmartDownloadPillButton>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-bark"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-sand/70 bg-cream px-5 pb-6 md:hidden">
          <ul className="flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-lg font-medium text-bark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

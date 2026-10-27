import Link from "next/link";
import type { ReactNode } from "react";

export function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export function PillButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 font-display text-base font-semibold text-cream shadow-[0_6px_16px_-6px_rgba(31,90,46,0.6)] transition hover:-translate-y-0.5 hover:bg-leaf-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ${className}`}
    >
      {children}
      <ArrowRight />
    </Link>
  );
}

export function Eyebrow({
  children,
  tone = "leaf",
}: {
  children: ReactNode;
  tone?: "leaf" | "light";
}) {
  const [text, rule] =
    tone === "light" ? ["text-[#f6d79a]", "bg-[#f6d79a]/60"] : ["text-leaf", "bg-leaf/50"];
  return (
    <p
      className={`flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.2em] ${text}`}
    >
      <span className={`h-px w-8 ${rule}`} aria-hidden />
      {children}
      <span className={`h-px w-8 ${rule}`} aria-hidden />
    </p>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  align?: "center" | "left";
}) {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : "items-center text-center lg:items-start lg:text-left";
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl font-bold leading-tight text-bark sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
    </div>
  );
}

export function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 16"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M3 12C55 3 120 1 197 5"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

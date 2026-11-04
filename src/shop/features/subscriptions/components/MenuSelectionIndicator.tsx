"use client";

import { Check } from "lucide-react";
import { cn } from "@shop/lib/utils";

/** Circular menu picker control — filled primary with white ring + check when selected. */
export function MenuSelectionIndicator({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
        selected
          ? "bg-primary"
          : "border-2 border-muted-foreground/35 bg-background",
        className,
      )}
    >
      {selected ? (
        <>
          <span className="absolute inset-[3px] rounded-full border border-white/95" />
          <Check className="relative z-10 size-3 stroke-[3] text-white" />
        </>
      ) : null}
    </span>
  );
}

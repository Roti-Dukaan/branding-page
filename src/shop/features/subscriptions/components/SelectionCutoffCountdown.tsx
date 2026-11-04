"use client";

import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { cn } from "@shop/lib/utils";
import { formatTimestamp } from "@shop/lib/date";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useSelectionCountdown(deadlineIso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadlineIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);

  const deadlineMs = deadlineIso ? new Date(deadlineIso).getTime() : NaN;
  const valid = Number.isFinite(deadlineMs);
  const msLeft = valid ? Math.max(0, deadlineMs - now) : 0;
  const expired = valid && msLeft <= 0;

  return {
    msLeft,
    expired,
    countdownLabel: valid ? formatCountdown(msLeft) : null,
    deadlineLabel: valid ? formatTimestamp(deadlineIso!) : null,
  };
}

export function SelectionCutoffBanner({
  deadlineIso,
  locked,
  compact = false,
  className,
}: {
  deadlineIso: string | null | undefined;
  locked?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { countdownLabel, deadlineLabel, expired, msLeft } = useSelectionCountdown(deadlineIso);
  const isLocked = locked || expired;

  if (!deadlineLabel) return null;

  const urgent = !isLocked && msLeft > 0 && msLeft <= 2 * 60 * 60 * 1000;

  if (compact) {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}>
        <span>Cutoff {deadlineLabel}</span>
        {!isLocked && countdownLabel ? (
          <>
            <span aria-hidden>·</span>
            <span className={cn("font-semibold tabular-nums text-foreground", urgent && "text-amber-700")}>
              {countdownLabel} left
            </span>
          </>
        ) : null}
        {isLocked ? (
          <>
            <span aria-hidden>·</span>
            <span className="font-medium">Locked</span>
          </>
        ) : null}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm",
        isLocked
          ? "border-border bg-muted/50 text-muted-foreground"
          : urgent
            ? "border-amber-200 bg-cream-deep text-amber-950"
            : "border-primary/20 bg-primary/5 text-foreground",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {isLocked ? (
          <Lock className="size-4 shrink-0" />
        ) : (
          <Clock className="size-4 shrink-0 text-primary" />
        )}
        <div className="min-w-0">
          <p className="font-medium">{isLocked ? "Selection locked" : "Selection closes"}</p>
          <p className="text-xs opacity-80">
            {isLocked ? `Cutoff was ${deadlineLabel}` : deadlineLabel}
          </p>
        </div>
      </div>
      {!isLocked && countdownLabel ? (
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">Time left</p>
          <p
            className={cn(
              "text-lg font-bold tabular-nums leading-tight",
              urgent && "text-amber-800",
            )}
          >
            {countdownLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}

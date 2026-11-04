/** Customer-facing reopen labels (aligned with mobile app). */

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function formatShortDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d);
}

/** "today at 8:00 AM", "tomorrow at 8:00 AM", or "on 2 Nov at 8:00 AM". */
export function formatKitchenReopen(reopenAtIso: string, now = new Date()): string {
  const reopenAt = new Date(reopenAtIso);
  if (Number.isNaN(reopenAt.getTime())) return "soon";

  const diffDays = startOfDay(reopenAt).getTime() - startOfDay(now).getTime();
  const dayDiff = Math.round(diffDays / (24 * 60 * 60 * 1000));
  const time = formatTime(reopenAt);

  if (dayDiff <= 0) return `today at ${time}`;
  if (dayDiff === 1) return `tomorrow at ${time}`;
  return `on ${formatShortDate(reopenAt)} at ${time}`;
}

/** "in 45 min", "in 1h 48m"; null when reopen is more than 24h away or already past. */
export function formatKitchenCountdown(reopenAtIso: string, now = new Date()): string | null {
  const reopenAt = new Date(reopenAtIso);
  if (Number.isNaN(reopenAt.getTime())) return null;

  const diffMs = reopenAt.getTime() - now.getTime();
  if (diffMs <= 0 || diffMs > 24 * 60 * 60 * 1000) return null;

  const minutes = Math.max(1, Math.ceil(diffMs / 60_000));
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

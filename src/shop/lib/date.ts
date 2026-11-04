// Lightweight date helpers (no external date library dependency).

/** Matches backend subscription-dates.util IST handling. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD from a calendar cell's local wall-date components. */
export function calendarDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIst(date: Date, days: number): string {
  const start = new Date(date.getTime() + IST_OFFSET_MS);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + days);
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, "0");
  const d = String(start.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function tomorrowDateKey(): string {
  return addDaysIst(new Date(), 1);
}

/** YYYY-MM-DD in IST from ISO timestamps or date-only strings. */
export function dateKeyFromIso(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const date = new Date(trimmed);
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseCalendarDate(input: string): Date {
  const key = dateKeyFromIso(input);
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return fromDateKey(key);
  }
  return new Date(input);
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return result;
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function diffInDays(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

const IST_TIMEZONE = "Asia/Kolkata";

const DISPLAY_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: IST_TIMEZONE,
});

export function formatDisplayDate(input: Date | string): string {
  if (typeof input === "string") {
    const key = dateKeyFromIso(input);
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      const [y, m, d] = key.split("-").map(Number);
      return DISPLAY_FORMAT.format(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
    }
  }
  const date = typeof input === "string" ? new Date(input) : input;
  return DISPLAY_FORMAT.format(date);
}

/** DD-MM-YYYY for compact date filter inputs. */
export function formatPickerDate(input: Date | string): string {
  const date = typeof input === "string" ? parseCalendarDate(input) : input;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const LONG_FORMAT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: IST_TIMEZONE,
});

export function formatLongDate(input: Date | string): string {
  const date = typeof input === "string" ? parseCalendarDate(input) : input;
  return LONG_FORMAT.format(date);
}

const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: IST_TIMEZONE,
});

export function formatTime(date: Date): string {
  return TIME_FORMAT.format(date);
}

const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: IST_TIMEZONE,
});

export function formatTimestamp(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return TIMESTAMP_FORMAT.format(date);
}

/** date-fns format tokens — 12-hour clock with AM/PM */
export const FNS_DATE_TIME = "MMM d, h:mm a";
export const FNS_DATE_TIME_YEAR = "MMM d, yyyy h:mm a";
export const FNS_TIME = "h:mm a";

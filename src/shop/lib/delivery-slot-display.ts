export type DeliverySlotTime = {
  id: string;
  startTime: string;
  endTime: string;
};

export type SlotDayPeriod = "MORNING" | "AFTERNOON" | "EVENING";

const PERIOD_ORDER: SlotDayPeriod[] = ["MORNING", "AFTERNOON", "EVENING"];

export const SLOT_PERIOD_META: Record<
  SlotDayPeriod,
  { label: string }
> = {
  MORNING: { label: "Morning" },
  AFTERNOON: { label: "Afternoon" },
  EVENING: { label: "Evening" },
};

function parseTime24(time: string): number {
  const [hours] = time.split(":").map(Number);
  return hours;
}

/** Format "HH:MM" or "HH:MM:SS" as "6:00 AM". */
export function formatDeliverySlotTime(time: string): string {
  const [hRaw, mRaw] = time.split(":");
  const h = parseInt(hRaw, 10);
  const m = parseInt(mRaw ?? "0", 10);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function parseTimeParts(time: string): { hour12: number; minute: number; period: "AM" | "PM" } | null {
  const [hRaw, mRaw] = time.split(":");
  const h = parseInt(hRaw, 10);
  const m = parseInt(mRaw ?? "0", 10);
  if (Number.isNaN(h)) return null;
  return {
    hour12: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    period: h >= 12 ? "PM" : "AM",
  };
}

function formatCompactTimePart(
  parts: { hour12: number; minute: number; period: "AM" | "PM" },
  showPeriod: boolean,
): string {
  const clock = parts.minute === 0 ? `${parts.hour12}` : `${parts.hour12}:${String(parts.minute).padStart(2, "0")}`;
  return showPeriod ? `${clock}${parts.period}` : clock;
}

/** e.g. 07:00–10:00 → "7AM-10AM", 11:00–14:00 → "11AM-2PM" */
export function formatDeliverySlotLabelCompact(startTime: string, endTime: string): string {
  const start = parseTimeParts(startTime);
  const end = parseTimeParts(endTime);
  if (!start || !end) return formatDeliverySlotLabel(startTime, endTime);

  return `${formatCompactTimePart(start, true)}-${formatCompactTimePart(end, true)}`;
}

/** e.g. 06:00 + 07:00 → "6:00 AM – 7:00 AM", 11:00 + 12:00 → "11:00 AM – 12:00 PM" */
export function formatDeliverySlotLabel(startTime: string, endTime: string): string {
  return `${formatDeliverySlotTime(startTime)} – ${formatDeliverySlotTime(endTime)}`;
}

export function getSlotDayPeriod(startTime: string, endTime?: string): SlotDayPeriod {
  const startHour = parseTime24(startTime);
  const endHour = endTime ? parseTime24(endTime) : startHour;
  const midHour = (startHour + endHour) / 2;
  if (midHour < 12) return "MORNING";
  if (midHour < 17) return "AFTERNOON";
  return "EVENING";
}

export function groupDeliverySlotsByPeriod<T extends DeliverySlotTime>(
  slots: T[],
): { period: SlotDayPeriod; slots: T[] }[] {
  const buckets = new Map<SlotDayPeriod, T[]>();
  for (const period of PERIOD_ORDER) {
    buckets.set(period, []);
  }

  const sorted = [...slots].sort((a, b) => {
    const aKey = a.startTime.localeCompare(b.startTime);
    return aKey !== 0 ? aKey : a.endTime.localeCompare(b.endTime);
  });

  for (const slot of sorted) {
    buckets.get(getSlotDayPeriod(slot.startTime, slot.endTime))!.push(slot);
  }

  return PERIOD_ORDER.map((period) => ({
    period,
    slots: buckets.get(period)!,
  }));
}

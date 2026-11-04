"use client";

import { Sunrise, Sun, Moon } from "lucide-react";
import { Skeleton } from "@shop/components/ui/skeleton";
import { cn } from "@shop/lib/utils";
import {
  formatDeliverySlotLabelCompact,
  groupDeliverySlotsByPeriod,
  SLOT_PERIOD_META,
  type DeliverySlotTime,
  type SlotDayPeriod,
} from "@shop/lib/delivery-slot-display";

const PERIOD_ICONS: Record<SlotDayPeriod, React.ElementType> = {
  MORNING: Sunrise,
  AFTERNOON: Sun,
  EVENING: Moon,
};

type DeliverySlotPickerProps<T extends DeliverySlotTime> = {
  slots: T[];
  selectedSlotId?: string | null;
  selectedSlotIds?: string[];
  multiple?: boolean;
  onSelect: (slot: T) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export function DeliverySlotPicker<T extends DeliverySlotTime>({
  slots,
  selectedSlotId,
  selectedSlotIds = [],
  multiple = false,
  onSelect,
  loading = false,
  error = null,
  emptyMessage = "No slots available",
}: DeliverySlotPickerProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {(["MORNING", "AFTERNOON", "EVENING"] as SlotDayPeriod[]).map((period) => (
          <div key={period} className="space-y-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <div className="grid grid-cols-3 gap-1.5">
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-[11px] text-destructive">{error}</p>;
  }

  if (slots.length === 0) {
    return <p className="text-[11px] text-muted-foreground">{emptyMessage}</p>;
  }

  const groups = groupDeliverySlotsByPeriod(slots);

  return (
    <div className="space-y-3">
      {groups.map(({ period, slots: periodSlots }) => {
        const Icon = PERIOD_ICONS[period];
        const { label } = SLOT_PERIOD_META[period];

        return (
          <div key={period} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            </div>
            {periodSlots.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-center text-[10px] text-muted-foreground">
                No slots
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {periodSlots.map((slot) => {
                  const isSelected = multiple
                    ? selectedSlotIds.includes(slot.id)
                    : selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelect(slot)}
                      className={cn(
                        "min-w-0 rounded-lg border px-0.5 py-1.5 text-[9px] font-semibold leading-none transition-all",
                        "bg-background shadow-sm text-center whitespace-nowrap",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/40",
                      )}
                    >
                      {formatDeliverySlotLabelCompact(slot.startTime, slot.endTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

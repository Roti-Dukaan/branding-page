"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@shop/lib/utils";
import {
  addMonths,
  calendarDateToKey,
  daysInMonth,
  fromDateKey,
  isSameDay,
  startOfMonth,
  toDateKey,
} from "@shop/lib/date";
import type { SubscriptionDeliveryStatus } from "@shop/features/profile/types";

const STATUS_DOT: Record<SubscriptionDeliveryStatus, string> = {
  scheduled: "bg-emerald-500",
  paused: "bg-gray-400",
  delivered: "bg-blue-500",
  cancelled: "bg-red-500",
  skipped: "bg-orange-500",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarProps {
  className?: string;
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  disabledMatcher?: (date: Date) => boolean;
  deliveryStatuses?: Record<string, SubscriptionDeliveryStatus>;
  showStatusLegend?: boolean;
  weekdayStyle?: "responsive" | "short";
  "aria-label"?: string;
}

export function Calendar({
  className,
  selected,
  onSelect,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  disabledMatcher,
  deliveryStatuses,
  showStatusLegend = true,
  weekdayStyle = "responsive",
  ...props
}: CalendarProps) {
  const todayKey = toDateKey(new Date());
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    defaultMonth ?? controlledMonth ?? fromDateKey(todayKey)
  );
  const month = controlledMonth ?? internalMonth;

  const setMonth = (date: Date) => {
    setInternalMonth(date);
    onMonthChange?.(date);
  };

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = startOfMonth(month).getDay();
  const totalDays = daysInMonth(month);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className={cn("w-full min-w-0 max-w-full select-none", className)}
      role="application"
      aria-label={props["aria-label"] ?? "Calendar"}
    >
      <div className="flex items-center justify-between px-0.5 pb-2 sm:px-1">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div
          className="truncate px-1 text-center text-xs font-medium text-foreground sm:text-sm"
          aria-live="polite"
        >
          {MONTHS[m]} {year}
        </div>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className="pb-1 text-[10px] font-medium text-muted-foreground sm:text-xs"
            aria-hidden="true"
          >
            {weekdayStyle === "short" ? (
              WEEKDAYS_SHORT[i]
            ) : (
              <>
                <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                <span className="hidden sm:inline">{day}</span>
              </>
            )}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} aria-hidden="true" />;

          const key = calendarDateToKey(date);
          const status = deliveryStatuses?.[key];
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = key === todayKey;
          const disabled = disabledMatcher?.(date) ?? false;
          const deliveriesSkipped = status === "skipped";

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-label={key}
              aria-pressed={isSelected}
              onClick={() => !disabled && onSelect?.(date)}
              className={cn(
                "relative flex aspect-square min-h-0 min-w-0 flex-col items-center justify-center rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
                disabled
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "cursor-pointer hover:bg-muted",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                !isSelected && isToday && "font-bold text-primary"
              )}
            >
              <span>{date.getDate()}</span>
              {status && (
                <span
                  className={cn(
                    "absolute bottom-1 size-1.5 rounded-full",
                    STATUS_DOT[status]
                  )}
                  aria-hidden="true"
                />
              )}
              {deliveriesSkipped && (
                <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-orange-400/60" />
              )}
            </button>
          );
        })}
      </div>

      {deliveryStatuses && showStatusLegend && (
        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-border/60 pt-3 sm:flex sm:flex-wrap sm:gap-x-3">
          <Legend color="bg-emerald-500" label="Scheduled" />
          <Legend color="bg-gray-400" label="Paused" />
          <Legend color="bg-blue-500" label="Delivered" />
          <Legend color="bg-red-500" label="Cancelled" />
          <Legend color="bg-orange-500" label="Skipped" />
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className={cn("size-2 rounded-full", color)} aria-hidden="true" />
      {label}
    </span>
  );
}

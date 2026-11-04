"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@shop/lib/utils";
import {
  calendarDateToKey,
  formatDisplayDate,
  formatPickerDate,
  fromDateKey,
  isBefore,
  startOfDay,
  toDateKey,
} from "@shop/lib/date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shop/components/ui/popover";
import { Button } from "@shop/components/ui/button";
import { Calendar, type CalendarProps } from "@shop/components/ui/calendar";

export interface DatePickerProps {
  id?: string;
  value?: string | null; // yyyy-mm-dd
  onChange?: (key: string) => void;
  minDate?: Date;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  deliveryStatuses?: CalendarProps["deliveryStatuses"];
  /** "picker" = DD-MM-YYYY filter style; "display" = long formatted date */
  displayFormat?: "picker" | "display";
  showStatusLegend?: boolean;
  showFooterActions?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  minDate,
  placeholder = "Select date",
  disabled,
  deliveryStatuses,
  displayFormat = "display",
  showStatusLegend,
  showFooterActions = false,
  ariaLabel,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? fromDateKey(value) : undefined;
  const todayKey = toDateKey(new Date());

  const disabledMatcher = (date: Date) => {
    if (disabled?.(date)) return true;
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    return false;
  };

  const formattedValue = value
    ? displayFormat === "picker"
      ? formatPickerDate(value)
      : formatDisplayDate(value)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-label={ariaLabel ?? placeholder}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        {formattedValue ? (
          <span className="truncate">{formattedValue}</span>
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          selected={selected}
          deliveryStatuses={deliveryStatuses}
          showStatusLegend={showStatusLegend}
          weekdayStyle={displayFormat === "picker" ? "short" : "responsive"}
          onSelect={(date) => {
            onChange?.(calendarDateToKey(date));
            setOpen(false);
          }}
          disabledMatcher={disabledMatcher}
          defaultMonth={selected ?? minDate ?? fromDateKey(todayKey)}
        />
        {showFooterActions && (
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => {
                onChange?.(todayKey);
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

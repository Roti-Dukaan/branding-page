"use client";

import { motion } from "motion/react";
import { Check, Loader2, Circle, MapPin, Bike, PackageCheck, Truck, Home } from "lucide-react";
import { formatTimestamp } from "@shop/lib/date";
import type { DeliveryStatus, DeliveryTimelineEntry } from "../orders/types/delivery";
import { DELIVERY_STATUS_LABELS } from "../orders/types/delivery";

interface DeliveryTimelineProps {
  entries: DeliveryTimelineEntry[];
  currentStatus: DeliveryStatus;
  className?: string;
}

const STEP_ICON: Record<string, React.ReactNode> = {
  WAITING_FOR_KITCHEN: <PackageCheck className="h-4 w-4" />,
  WAITING_FOR_PROVIDER: <Loader2 className="h-4 w-4" />,
  PROVIDER_ASSIGNED: <Bike className="h-4 w-4" />,
  RIDER_ARRIVING: <MapPin className="h-4 w-4" />,
  RIDER_ARRIVED: <MapPin className="h-4 w-4" />,
  AWAITING_PICKUP: <MapPin className="h-4 w-4" />,
  PICKED_UP: <Bike className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  NEAR_CUSTOMER: <MapPin className="h-4 w-4" />,
  DELIVERED: <Home className="h-4 w-4" />,
};

/**
 * Animated vertical delivery timeline. The current step pulses; completed steps
 * show a check; pending steps are dimmed.
 */
export function DeliveryTimeline({ entries, currentStatus, className }: DeliveryTimelineProps) {
  if (!entries.length) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">No delivery events yet.</p>
    );
  }

  const currentIndex = entries.findIndex((e) => e.status === currentStatus);

  return (
    <ol className={className}>
      {entries.map((entry, index) => {
        const isCompleted = index < currentIndex || entry.status === "DELIVERED";
        const isCurrent = index === currentIndex && entry.status !== "DELIVERED";
        const Icon = STEP_ICON[entry.status] ?? <Circle className="h-4 w-4" />;
        const title = entry.title ?? DELIVERY_STATUS_LABELS[entry.status] ?? entry.status;

        return (
          <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < entries.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                  isCompleted ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isCurrent
                    ? "animate-pulse border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : Icon}
            </span>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-indigo-700" : isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {title}
                </p>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              {(entry.description || entry.remarks) && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {entry.description ?? entry.remarks}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Horizontal stepper used in the customer order-tracking header. */
export function DeliveryStepBar({
  currentStatus,
}: {
  currentStatus: DeliveryStatus;
}) {
  const steps: DeliveryStatus[] = [
    "WAITING_FOR_PROVIDER",
    "PROVIDER_ASSIGNED",
    "RIDER_ARRIVING",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];
  const activeIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = activeIndex > i || currentStatus === "DELIVERED";
        const active = activeIndex === i;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <motion.div
              initial={false}
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ repeat: active ? Infinity : 0, duration: 1.4 }}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              {i + 1}
            </motion.div>
            {i < steps.length - 1 && (
              <div
                className={`h-1 flex-1 ${done ? "bg-emerald-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

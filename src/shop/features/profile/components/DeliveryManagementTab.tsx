"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Package,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Truck,
} from "lucide-react";

import { cn } from "@shop/lib/utils";
import {
  addDays,
  addDaysIst,
  calendarDateToKey,
  diffInDays,
  formatDisplayDate,
  formatLongDate,
  formatTimestamp,
  fromDateKey,
  isBefore,
  startOfDay,
  tomorrowDateKey,
  toDateKey,
} from "@shop/lib/date";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@shop/components/ui/alert";
import { Label } from "@shop/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shop/components/ui/select";
import { Calendar } from "@shop/components/ui/calendar";
import { DatePicker } from "@shop/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shop/components/ui/sheet";
import { Skeleton } from "@shop/components/ui/skeleton";
import { toast } from "@shop/lib/toast";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { AddressPickerDialog } from "./AddressPickerDialog";
import {
  useChangeDeliveryAddress,
  useDeliveryCalendar,
  usePauseSubscription,
  useResumeSubscription,
  useSkipDelivery,
  useSubscriptionManagement,
  useSubscriptionTimeline,
} from "../hooks/useSubscriptionManagement";
import type {
  DeliveryCalendarEntry,
  PauseReason,
  SubscriptionManagementState,
  SubscriptionStatus,
  SubscriptionTimelineEvent,
  SubscriptionTimelineType,
  UserSubscription,
} from "../types";
import type { DeliveryAddress } from "@shop/lib/types";

const FALLBACK_ADDRESS: DeliveryAddress = {
  id: "addr-default",
  name: "Prashanth",
  phone: "9876543210",
  house: "12-3-456",
  apartment: "Sunshine Apartments",
  street: "Mehdipatnam Road",
  area: "Mehdipatnam",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500028",
  addressType: "home",
  isDefault: true,
};

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  expired: "Expired",
};

const REASONS: { value: PauseReason; label: string }[] = [
  { value: "vacation", label: "Vacation" },
  { value: "out-of-town", label: "Out of Town" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

const TIMELINE_ICON: Record<
  SubscriptionTimelineType,
  { icon: typeof Package; color: string }
> = {
  created: { icon: Package, color: "text-primary bg-primary/10" },
  paused: { icon: Pause, color: "text-amber-600 bg-amber-100" },
  resumed: { icon: Play, color: "text-emerald-600 bg-emerald-100" },
  skipped: { icon: SkipForward, color: "text-orange-600 bg-orange-100" },
  "address-changed": { icon: MapPin, color: "text-blue-600 bg-blue-100" },
  renewed: { icon: RefreshCw, color: "text-violet-600 bg-violet-100" },
  completed: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100" },
};

export function DeliveryManagementTab({
  subscription,
}: {
  subscription: UserSubscription;
}) {
  const subscriptionId = subscription.planId;

  const management = useSubscriptionManagement(subscriptionId);
  const calendarQuery = useDeliveryCalendar(subscriptionId);
  const timelineQuery = useSubscriptionTimeline(subscriptionId);

  const pauseMutation = usePauseSubscription(subscriptionId);
  const resumeMutation = useResumeSubscription(subscriptionId);
  const skipMutation = useSkipDelivery(subscriptionId);
  const changeAddressMutation = useChangeDeliveryAddress(subscriptionId);

  const { addresses, fetchAddresses } = useAddressStore();
  const effectiveAddresses = useMemo(
    () => (addresses.length ? addresses : [FALLBACK_ADDRESS]),
    [addresses]
  );

  useEffect(() => {
    fetchAddresses().catch(() => {});
  }, [fetchAddresses]);

  const tomorrowKey = tomorrowDateKey();
  const today = fromDateKey(toDateKey(new Date()));

  const state: SubscriptionManagementState | undefined = management.data;
  const calendar: DeliveryCalendarEntry[] = calendarQuery.data ?? [];
  const timeline: SubscriptionTimelineEvent[] = timelineQuery.data ?? [];

  const statusMap = useMemo(() => {
    const map: Record<string, DeliveryCalendarEntry["status"]> = {};
    calendar.forEach((e) => (map[e.date] = e.status));
    return map;
  }, [calendar]);

  const isPaused = state?.status === "paused";
  const isLoading =
    management.isLoading || calendarQuery.isLoading || timelineQuery.isLoading;

  const tomorrowEntry = calendar.find((e) => e.date === tomorrowKey);
  const defaultAddress =
    effectiveAddresses.find((a) => a.isDefault) ?? effectiveAddresses[0];

  // Local UI state
  const [pauseFrom, setPauseFrom] = useState<string>(tomorrowKey);
  const [pauseUntil, setPauseUntil] = useState<string>(
    addDaysIst(new Date(), 4)
  );
  const [pauseReason, setPauseReason] = useState<PauseReason | "">("");

  const [selectedDate, setSelectedDate] = useState<DeliveryCalendarEntry | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [addressPickerDate, setAddressPickerDate] = useState<string | null>(null);
  const [tempAddressId, setTempAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );

  const tempAddress =
    effectiveAddresses.find((a) => a.id === tempAddressId) ?? defaultAddress;

  function fromKey(key: string) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Pause preview
  const pausePreview = useMemo(() => {
    if (!pauseFrom || !pauseUntil || !state) return null;
    const from = fromKey(pauseFrom);
    const until = fromKey(pauseUntil);
    if (isBefore(until, from)) return null;
    const days = diffInDays(from, until) + 1;
    const newExpiry = addDays(fromKey(state.endDate), days);
    return { days, newExpiry: calendarDateToKey(newExpiry) };
  }, [pauseFrom, pauseUntil, state]);

  if (isLoading || !state) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  function handleCalendarSelect(date: Date) {
    const key = calendarDateToKey(date);
    if (isBefore(date, today)) return;
    const entry = calendar.find((e) => e.date === key);
    if (entry && (entry.status === "scheduled" || entry.status === "paused")) {
      setSelectedDate(entry);
    }
  }

  function confirmPause() {
    if (!pauseFrom || !pauseUntil) {
      toast.error("Please select both pause dates");
      return;
    }
    pauseMutation.mutate(
      { from: pauseFrom, until: pauseUntil, reason: pauseReason || undefined },
      {
        onSuccess: () => toast.success("Meals paused successfully"),
        onError: () => toast.error("Failed to pause meals"),
      }
    );
  }

  function confirmResume() {
    resumeMutation.mutate(undefined, {
      onSuccess: () => {
        setResumeOpen(false);
        toast.success("Meals resumed");
      },
      onError: () => toast.error("Failed to resume meals"),
    });
  }

  function confirmSkip() {
    if (!skipTarget) return;
    skipMutation.mutate(
      { date: skipTarget },
      {
        onSuccess: () => {
          setSkipTarget(null);
          setSelectedDate(null);
          toast.success("Delivery skipped");
        },
        onError: () => toast.error("Failed to skip delivery"),
      }
    );
  }

  function handleAddressPick(address: DeliveryAddress) {
    setTempAddressId(address.id);
    setAddressPickerOpen(false);
    const target = addressPickerDate ?? state?.nextDelivery;
    if (target) {
      changeAddressMutation.mutate(
        { input: { date: target, addressId: address.id }, address },
        {
          onSuccess: () => toast.success("Delivery address updated"),
          onError: () => toast.error("Failed to update address"),
        }
      );
    } else {
      toast.success("Temporary delivery address set");
    }
    setAddressPickerDate(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Card */}
      <SummaryCard state={state} />

      {/* Section 1: Pause meals (active only) */}
      {!isPaused && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="size-4 text-primary" />
              Pause meals
            </CardTitle>
            <CardDescription>
              Temporarily stop recurring meals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pause-from">Pause From</Label>
                <DatePicker
                  id="pause-from"
                  value={pauseFrom}
                  onChange={setPauseFrom}
                  minDate={today}
                  placeholder="Select start date"
                  ariaLabel="Pause from date"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pause-until">Pause Until</Label>
                <DatePicker
                  id="pause-until"
                  value={pauseUntil}
                  onChange={setPauseUntil}
                  minDate={pauseFrom ? fromKey(pauseFrom) : today}
                  placeholder="Select end date"
                  ariaLabel="Pause until date"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pause-reason">Reason (Optional)</Label>
              <Select
                value={pauseReason || null}
                onValueChange={(v) => setPauseReason((v as PauseReason) || "")}
              >
                <SelectTrigger id="pause-reason" className="w-full">
                  <SelectValue className="text-muted-foreground">
                    {(value) =>
                      REASONS.find((r) => r.value === value)?.label ??
                      "Select reason"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={confirmPause}
              disabled={pauseMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
            >
              {pauseMutation.isPending ? (
                "Pausing..."
              ) : (
                <>
                  <Pause className="size-4" />
                  Pause meals
                </>
              )}
            </Button>

            {pausePreview && (
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Delivery schedule preview</AlertTitle>
                <AlertDescription>
                  {pausePreview.days} meals will be skipped. Your subscription
                  will automatically extend by {pausePreview.days} days.
                  <br />
                  New expiry:{" "}
                  <span className="font-medium text-foreground">
                    {formatDisplayDate(pausePreview.newExpiry)}
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 2: Resume meals (paused only) */}
      {isPaused && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="size-4 text-emerald-600" />
              Resume meals
            </CardTitle>
            <CardDescription>
              Your subscription is currently paused. Resume to continue receiving meals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <SummaryStat label="Status" value={<Badge className={cn("capitalize", STATUS_STYLES.paused)}>Paused</Badge>} />
              <SummaryStat
                label="Paused Until"
                value={state.pausedUntil ? formatDisplayDate(state.pausedUntil) : "—"}
              />
              <SummaryStat
                label="Resume Date"
                value={state.pausedUntil ? formatDisplayDate(state.pausedUntil) : formatDisplayDate(today)}
              />
            </div>
            <Button
              onClick={() => setResumeOpen(true)}
              disabled={resumeMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
            >
              <Play className="size-4" />
              Resume meals
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Skip Tomorrow (active only) */}
      {!isPaused && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                <SkipForward className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Skip Tomorrow</p>
                <p className="text-sm text-muted-foreground">
                  Skip only tomorrow&apos;s delivery
                  {tomorrowEntry
                    ? ` (${formatDisplayDate(tomorrowKey)})`
                    : ""}
                  .
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setSkipTarget(tomorrowKey)}
              disabled={tomorrowEntry?.status !== "scheduled"}
              className="shrink-0"
            >
              <SkipForward className="size-4" />
              Skip Tomorrow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Delivery Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            Delivery Calendar
          </CardTitle>
          <CardDescription>
            View your upcoming meals. Tap a future scheduled date to manage it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            deliveryStatuses={statusMap}
            onSelect={handleCalendarSelect}
            disabledMatcher={(date) => isBefore(date, today)}
            aria-label="Delivery calendar"
            className="mx-auto max-w-md"
          />
        </CardContent>
      </Card>

      {/* Section 5: Temporary Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Temporary Delivery Address
          </CardTitle>
          <CardDescription>
            Set a different address for your meals without changing your default
            address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-foreground">Current Delivery Address</p>
              {tempAddress ? (
                <p className="mt-0.5 text-muted-foreground">
                  {[tempAddress.house, tempAddress.apartment, tempAddress.street, tempAddress.area]
                    .filter(Boolean)
                    .join(", ")}
                  , {tempAddress.city}, {tempAddress.state} - {tempAddress.pincode}
                </p>
              ) : (
                <p className="mt-0.5 text-muted-foreground">No address selected</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setAddressPickerDate(null);
              setAddressPickerOpen(true);
            }}
          >
            <MapPin className="size-4" />
            Change Address
          </Button>
        </CardContent>
      </Card>

      {/* Section 6: Subscription Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Subscription Timeline
          </CardTitle>
          <CardDescription>Important events for your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline events={timeline} />
        </CardContent>
      </Card>

      {/* Side Sheet for a selected delivery date */}
      <Sheet
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <SheetContent side="right" className="w-full sm:w-[400px]">
          {selectedDate && (
            <>
              <SheetHeader>
                <SheetTitle>Delivery Details</SheetTitle>
                <SheetDescription>
                  {formatLongDate(selectedDate.date)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4">
                <div className="space-y-3">
                  <DetailRow label="Delivery Date" value={formatDisplayDate(selectedDate.date)} />
                  <DetailRow label="Meal" value={selectedDate.meal} />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Address</p>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedDate.address
                        ? [
                            selectedDate.address.house,
                            selectedDate.address.apartment,
                            selectedDate.address.street,
                            selectedDate.address.area,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : tempAddress
                          ? [
                              tempAddress.house,
                              tempAddress.apartment,
                              tempAddress.street,
                              tempAddress.area,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "—"}
                      {selectedDate.address
                        ? `, ${selectedDate.address.city} - ${selectedDate.address.pincode}`
                        : tempAddress
                          ? `, ${tempAddress.city} - ${tempAddress.pincode}`
                          : ""}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={selectedDate.status !== "scheduled"}
                    onClick={() => {
                      setSkipTarget(selectedDate.date);
                      setSelectedDate(null);
                    }}
                  >
                    <SkipForward className="size-4" />
                    Skip This Delivery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setAddressPickerDate(selectedDate.date);
                      setAddressPickerOpen(true);
                    }}
                  >
                    <MapPin className="size-4" />
                    Change Delivery Address
                  </Button>
                </div>
              </div>

              <div className="mt-auto p-4">
                <SheetClose
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Close
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Address Picker */}
      <AddressPickerDialog
        open={addressPickerOpen}
        onOpenChange={setAddressPickerOpen}
        addresses={effectiveAddresses}
        currentAddressId={
          addressPickerDate
            ? calendar.find((e) => e.date === addressPickerDate)?.address?.id ??
              tempAddressId
            : tempAddressId
        }
        onSelect={handleAddressPick}
        onAddNew={() => {
          setAddressPickerOpen(false);
          useAddressStore.getState().setAddressSheetOpen(true);
        }}
        title={addressPickerDate ? "Change Delivery Address" : "Temporary Delivery Address"}
      />

      {/* Resume confirmation */}
      <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume meals</DialogTitle>
            <DialogDescription>
              Your subscription will resume immediately and meals will continue as scheduled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResumeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmResume}
              disabled={resumeMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="size-4" />
              Resume meals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip confirmation */}
      <Dialog open={!!skipTarget} onOpenChange={(open) => !open && setSkipTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Delivery</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                {skipTarget === tomorrowKey ? (
                  <p>
                    Tomorrow&apos;s delivery ({formatDisplayDate(tomorrowKey)}) will be
                    skipped. Your subscription will automatically extend by one day.
                  </p>
                ) : skipTarget ? (
                  <p>
                    The delivery on {formatDisplayDate(skipTarget)} will be skipped.
                    Your subscription will automatically extend by one day.
                  </p>
                ) : null}
                <p className="font-semibold text-foreground">
                  Once you skip cannot revert back, are you sure you want to skip?
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSkip}
              disabled={skipMutation.isPending}
              variant="destructive"
            >
              <SkipForward className="size-4" />
              Skip Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

  function SummaryCard({ state }: { state: SubscriptionManagementState }) {
  const stats: { label: string; value: ReactNode }[] = [
    {
      label: "Subscription Status",
      value: (
        <Badge className={cn("capitalize", STATUS_STYLES[state.status])}>
          {STATUS_LABEL[state.status]}
        </Badge>
      ),
    },
    {
      label: "Next Delivery",
      value: state.nextDelivery ? formatDisplayDate(state.nextDelivery) : "—",
    },
    {
      label: "Remaining meals",
      value: state.remainingDeliveries ?? "—",
    },
    {
      label: "Current End Date",
      value: state.endDate ? formatDisplayDate(state.endDate) : "—",
    },
  ];

  if (state.status === "paused") {
    stats.push(
      { label: "Paused Until", value: state.pausedUntil ? formatDisplayDate(state.pausedUntil) : "—" },
      { label: "Days Paused", value: state.daysPaused ?? "—" },
      {
        label: "New Subscription End Date",
        value: state.newEndDate ? formatDisplayDate(state.newEndDate) : "—",
      }
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          Delivery Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <SummaryStat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Timeline({ events }: { events: SubscriptionTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No timeline events yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {events.map((event) => {
        const config = TIMELINE_ICON[event.type];
        const Icon = config.icon;
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] flex size-6 items-center justify-center rounded-full ring-4 ring-background",
                config.color
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {event.label}
              </span>
              <Badge variant="outline" className="capitalize">
                {event.type.replace("-", " ")}
              </Badge>
            </div>
            {event.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.description}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {formatTimestamp(event.timestamp)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

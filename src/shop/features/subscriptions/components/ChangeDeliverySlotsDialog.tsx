"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@shop/lib/toast";
import { Button } from "@shop/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { DeliverySlotPicker } from "@shop/components/delivery/DeliverySlotPicker";
import { apiClient } from "@shop/lib/api/client";
import { subscriptionsApi } from "../services/subscriptions.api";
import {
  getSubscriptionDeliverySlotIds,
  MAX_SUBSCRIPTION_DELIVERY_SLOTS,
} from "../utils/subscription-display";
import type { CustomerSubscription } from "../types/subscription";

type DeliverySlot = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

interface ChangeDeliverySlotsDialogProps {
  subscription: CustomerSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function ChangeDeliverySlotsDialog({
  subscription,
  open,
  onOpenChange,
  onChanged,
}: ChangeDeliverySlotsDialogProps) {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedSlotIds([]);
      setSlotsError(null);
      return;
    }

    setSelectedSlotIds(getSubscriptionDeliverySlotIds(subscription));

    let cancelled = false;
    setSlotsLoading(true);
    apiClient
      .get("/delivery-slots/available")
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data?.data ?? []) as DeliverySlot[];
        setSlots(list);
        if (list.length === 0) {
          setSlotsError("No delivery slots are available right now.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError("Failed to load delivery slots.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, subscription]);

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      if (prev.includes(slotId)) return prev.filter((id) => id !== slotId);
      if (prev.length >= MAX_SUBSCRIPTION_DELIVERY_SLOTS) {
        toast.error(`You can select up to ${MAX_SUBSCRIPTION_DELIVERY_SLOTS} delivery slots`);
        return prev;
      }
      return [...prev, slotId];
    });
  };

  const save = async () => {
    if (selectedSlotIds.length === 0) {
      toast.error("Select at least one delivery slot");
      return;
    }

    setSubmitting(true);
    try {
      await subscriptionsApi.changeSlot(subscription.id, {
        deliverySlotId: selectedSlotIds[0],
        deliverySlotIds: selectedSlotIds,
      });
      toast.success("Delivery slots updated");
      onChanged();
      onOpenChange(false);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not update delivery slots";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change delivery slots</DialogTitle>
          <DialogDescription>
            Select one or more time windows for your subscription meals. Changes apply to upcoming
            meals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading slots…
            </div>
          ) : slotsError ? (
            <p className="text-sm text-destructive">{slotsError}</p>
          ) : (
            <DeliverySlotPicker
              slots={slots}
              multiple
              selectedSlotIds={selectedSlotIds}
              onSelect={(slot) => toggleSlot(slot.id)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={submitting || selectedSlotIds.length === 0}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Save slots"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@shop/lib/toast";
import { formatPrice } from "@shop/lib/utils";
import { formatDisplayDate, toDateKey } from "@shop/lib/date";
import { Button } from "@shop/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Label } from "@shop/components/ui/label";
import { Input } from "@shop/components/ui/input";
import { subscriptionsApi } from "../services/subscriptions.api";
import type { CustomerSubscription } from "../types/subscription";

interface PauseSubscriptionDialogProps {
  subscription: CustomerSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaused: () => void;
}

export function PauseSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onPaused,
}: PauseSubscriptionDialogProps) {
  const [untilDate, setUntilDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const minDate = useMemo(() => toDateKey(new Date()), []);

  const submit = async () => {
    setLoading(true);
    try {
      await subscriptionsApi.pause(subscription.id, reason || undefined, untilDate || undefined);
      toast.success(
        untilDate
          ? `Subscription paused until ${formatDisplayDate(untilDate)}. Remaining days extend when you resume.`
          : "Subscription paused. Remaining days will extend when you resume.",
      );
      onPaused();
      onOpenChange(false);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not pause subscription";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pause subscription</DialogTitle>
          <DialogDescription>
            Meals will stop from today. When you resume, your plan end date extends by the
            number of days paused (if carry-forward is enabled on your plan).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pause-until">Pause until (optional)</Label>
            <Input
              id="pause-until"
              type="date"
              min={minDate}
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pause-reason">Reason (optional)</Label>
            <Input
              id="pause-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Travel, festival, etc."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Pause subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

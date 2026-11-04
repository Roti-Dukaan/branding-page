"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { AlertTriangle, Wrench } from "lucide-react";

interface KitchenUnavailableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "CLOSED" | "MAINTENANCE" | undefined;
}

/**
 * Alert-style dialog shown when a customer attempts to check out while the
 * kitchen is CLOSED or in MAINTENANCE. There is no "proceed" action — only a
 * close button — because new orders are blocked.
 */
export function KitchenUnavailableDialog({
  open,
  onOpenChange,
  status,
}: KitchenUnavailableDialogProps) {
  const isMaintenance = status === "MAINTENANCE";
  const Icon = isMaintenance ? Wrench : AlertTriangle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">
            {isMaintenance ? "Kitchen Unavailable" : "Kitchen Closed"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isMaintenance
              ? "Our kitchen is temporarily unavailable due to maintenance. Please try again shortly."
              : "We're currently not accepting new orders. Please visit us again during operating hours."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

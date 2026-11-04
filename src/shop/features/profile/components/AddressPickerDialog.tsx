"use client";

import { Plus, Home, Briefcase, MapPinned } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import type { AddressType, DeliveryAddress } from "@shop/lib/types";

const addressTypeConfig: Record<
  AddressType,
  { icon: typeof Home; label: string; color: string }
> = {
  home: { icon: Home, label: "Home", color: "text-primary" },
  work: { icon: Briefcase, label: "Work", color: "text-blue-600" },
  other: { icon: MapPinned, label: "Other", color: "text-purple-600" },
};

export interface AddressPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: DeliveryAddress[];
  currentAddressId?: string | null;
  onSelect: (address: DeliveryAddress) => void;
  onAddNew: () => void;
  title?: string;
  description?: string;
}

export function AddressPickerDialog({
  open,
  onOpenChange,
  addresses,
  currentAddressId,
  onSelect,
  onAddNew,
  title = "Select Delivery Address",
  description = "Choose where this delivery should go. This won't change your default address.",
}: AddressPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {addresses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No saved addresses yet.
            </p>
          ) : (
            addresses.map((addr) => {
              const config = addressTypeConfig[addr.addressType] || addressTypeConfig.home;
              const Icon = config.icon;
              const isCurrent = addr.id === currentAddressId;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelect(addr)}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      isCurrent ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${isCurrent ? config.color : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-foreground">
                        {config.label}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[addr.house, addr.apartment, addr.street, addr.area]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={onAddNew}>
            <Plus className="size-4" />
            Add New Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

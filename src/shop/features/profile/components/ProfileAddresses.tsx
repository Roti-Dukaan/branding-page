"use client";

import { useEffect, useState } from "react";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@shop/components/ui/dialog";
import { toast } from "@shop/lib/toast";
import {
  Home,
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { formatFullAddress } from "@shop/lib/geo/format-delivery-location";

const ADDRESS_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  work: Building2,
  other: MapPin,
};

export function ProfileAddresses() {
  const {
    addresses,
    loading,
    error,
    fetchAddresses,
    setDefaultAddress,
    deleteAddress,
    openAddressEditor,
  } = useAddressStore();

  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAddresses();
  }, [fetchAddresses]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAddress(deleteTarget.id);
      toast.success("Address deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete address. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) return null;

  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Saved Addresses
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your delivery addresses
            </p>
          </div>
          <Button onClick={() => openAddressEditor()}>
            <Plus className="size-4" />
            Add Address
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                      <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
                  <div className="h-3 w-4/5 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex gap-2">
                  <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
                  <div className="h-7 w-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-7 w-8 rounded-md bg-muted animate-pulse ml-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && addresses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Saved Addresses
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your delivery addresses
            </p>
          </div>
          <Button onClick={() => openAddressEditor()}>
            <Plus className="size-4" />
            Add Address
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="size-10 text-destructive mb-3" />
            <p className="text-sm font-medium text-foreground">
              Failed to load addresses
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {error}
            </p>
            <Button variant="outline" onClick={fetchAddresses}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Saved Addresses
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your delivery addresses
          </p>
        </div>
        <Button onClick={() => openAddressEditor()}>
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No saved addresses
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your delivery addresses for faster checkout
            </p>
            <Button className="mt-4" onClick={() => openAddressEditor()}>
              <Plus className="size-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const TypeIcon = ADDRESS_TYPE_ICONS[address.addressType] || MapPin;
            const label = (address.addressType || "home").charAt(0).toUpperCase() + (address.addressType || "home").slice(1);

            const formattedAddress = formatFullAddress(address);

            return (
              <Card key={address.id} className="relative">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <TypeIcon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {label}
                        </p>
                        {address.isDefault && (
                          <Badge variant="secondary" className="mt-0.5 text-[10px]">
                            <Star className="mr-0.5 size-2.5" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openAddressEditor(address)}
                        title="Edit address"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDefaultAddress(address.id)}
                          title="Set as default"
                        >
                          <Star className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setDeleteTarget({
                            id: address.id,
                            label: label,
                          })
                        }
                        title="Delete address"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-sm text-muted-foreground">
                    {address.phone && (
                      <p className="font-medium text-foreground">{address.phone}</p>
                    )}
                    <p className="leading-relaxed">{formattedAddress}</p>
                    {address.landmark && (
                      <p className="text-xs">Near {address.landmark}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this address?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `The "${deleteTarget.label}" address will be permanently removed from your account. This cannot be undone.`
                : "This address will be permanently removed from your account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isDeleting}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

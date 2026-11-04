// @ts-nocheck
"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { Checkbox } from "@shop/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { AddressType, DeliveryAddress } from "@shop/lib/types";
import { toast } from "@shop/lib/toast";
import dynamic from "next/dynamic";
import { isPlaceholderCoordinates } from "@shop/lib/geo/constants";
import { locationService } from "@shop/services/location.service";
import {
  isValidIndianPhone,
  normalizeIndianPhone,
  RECEIVER_PHONE_VALIDATION_MESSAGE,
} from "@shop/lib/validation/phone";

const AddressMapPicker = dynamic(
  () => import("./AddressMapPicker"),
  { ssr: false }
);

const addressSchema = z.object({
  phone: z
    .string()
    .min(1, "Receiver number is required")
    .refine(isValidIndianPhone, { message: RECEIVER_PHONE_VALIDATION_MESSAGE }),
  house: z.string().min(2, "House/Flat is required"),
  apartment: z.string().optional(),
  street: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Enter a valid 6-digit pincode"),
  addressType: z.enum(["home", "work", "other"]),
  isDefault: z.boolean().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema> & { addressType: AddressType };

interface AddressFormProps {
  editingAddress: DeliveryAddress | null;
  onClose: () => void;
  onSubmit?: (data: AddressFormValues) => Promise<void> | void;
}

export default function AddressForm({ editingAddress, onClose, onSubmit }: AddressFormProps) {
  const { addAddress, updateAddress } = useAddressStore();
  const [isSaving, setIsSaving] = useState(false);
  const [mapLat, setMapLat] = useState(
    editingAddress?.lat || 17.3850
  );
  const [mapLng, setMapLng] = useState(
    editingAddress?.lng || 78.4867
  );

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
      defaultValues: {
        phone: editingAddress?.phone || "",
        house: editingAddress?.house || "",
        apartment: editingAddress?.apartment || "",
        street: editingAddress?.street || "",
        area: editingAddress?.area || "",
        landmark: editingAddress?.landmark || "",
        city: editingAddress?.city || "Hyderabad",
        state: editingAddress?.state || "Telangana",
        pincode: editingAddress?.pincode || "",
        addressType: editingAddress?.addressType || "home",
        isDefault: editingAddress?.isDefault || false,
        lat: editingAddress?.lat,
        lng: editingAddress?.lng,
      },
  });

  const handleSubmit = async (data: AddressFormValues) => {
    if (!data.phone.trim() || !data.house.trim()) {
      toast.error("Please fill in receiver number and address");
      return;
    }

    setIsSaving(true);

    let lat = isPlaceholderCoordinates(mapLat, mapLng) ? undefined : mapLat;
    let lng = isPlaceholderCoordinates(mapLat, mapLng) ? undefined : mapLng;

    if (lat === undefined || lng === undefined) {
      try {
        const resolved = await locationService.geocodeAddressParts({
          house: data.house,
          street: data.street,
          area: data.area,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        });
        if (resolved) {
          lat = resolved.lat;
          lng = resolved.lng;
        }
      } catch {
        // geocoding errors handled below
      }
    }

    if (lat === undefined || lng === undefined) {
      toast.error(
        "Could not locate this address. Please check the area and pincode.",
      );
      setIsSaving(false);
      return;
    }

    try {
      const deliveryResult = await locationService.checkDelivery(lat, lng);
      if (!deliveryResult.serviceable) {
        toast.error(
          deliveryResult.message ||
            "Sorry, we don't deliver to this location yet.",
        );
        setIsSaving(false);
        return;
      }
    } catch {
      toast.error("Failed to verify delivery for this address");
      setIsSaving(false);
      return;
    }

    const payload = {
      ...data,
      phone: normalizeIndianPhone(data.phone),
      lat,
      lng,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        if (editingAddress) {
          updateAddress(editingAddress.id, payload);
          toast.success("Address updated successfully");
        } else {
          addAddress(payload);
          toast.success("Address saved successfully");
        }
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to addresses
      </button>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">
            Receiver Number *
          </Label>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="+91 or 10-digit number"
            className="h-10"
            maxLength={14}
          />
          {form.formState.errors.phone && (
            <p className="text-[10px] text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="house" className="text-xs">
            House / Flat / Floor *
          </Label>
          <Input
            id="house"
            {...form.register("house")}
            placeholder="e.g. 402, Sunshine Residency"
            className="h-10"
          />
          {form.formState.errors.house && (
            <p className="text-[10px] text-destructive">
              {form.formState.errors.house.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apartment" className="text-xs">
            Apartment / Tower
          </Label>
          <Input
            id="apartment"
            {...form.register("apartment")}
            placeholder="e.g. Tower B"
            className="h-10"
          />
        </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-xs">
              Street
            </Label>
            <Input
              id="street"
              {...form.register("street")}
              placeholder="Street name"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-xs">
              Area / Locality
            </Label>
            <Input
              id="area"
              {...form.register("area")}
              placeholder="e.g. HSR Layout"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs">
              City *
            </Label>
            <Input
              id="city"
              {...form.register("city")}
              placeholder="City"
              className="h-10"
            />
            {form.formState.errors.city && (
              <p className="text-[10px] text-destructive">
                {form.formState.errors.city.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-xs">
              State *
            </Label>
            <Input
              id="state"
              {...form.register("state")}
              placeholder="State"
              className="h-10"
            />
            {form.formState.errors.state && (
              <p className="text-[10px] text-destructive">
                {form.formState.errors.state.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode" className="text-xs">
              Pincode *
            </Label>
            <Input
              id="pincode"
              {...form.register("pincode")}
              placeholder="6 digits"
              className="h-10"
              maxLength={6}
            />
            {form.formState.errors.pincode && (
              <p className="text-[10px] text-destructive">
                {form.formState.errors.pincode.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Address Type *</Label>
          <RadioGroup
            value={form.watch("addressType")}
            onValueChange={(v) => form.setValue("addressType", v as AddressType)}
            className="flex gap-3"
          >
            {(["home", "work", "other"] as AddressType[]).map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
                  form.watch("addressType") === type
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <RadioGroupItem value={type} />
                <span className="text-sm font-medium capitalize">{type}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.watch("isDefault")}
            onCheckedChange={(checked) =>
              form.setValue("isDefault", checked === true)
            }
          />
          <span className="text-sm">Set as default address</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Address"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

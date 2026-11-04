"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@shop/lib/toast";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Label } from "@shop/components/ui/label";
import { Input } from "@shop/components/ui/input";
import { Checkbox } from "@shop/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { locationService } from "@shop/services/location.service";
import { useGoogleMaps } from "@shop/hooks/use-google-maps";
import CurrentLocationButton from "@shop/components/location/CurrentLocationButton";
import LocationSearch from "@shop/components/location/LocationSearch";
import GoogleMapPicker from "@shop/components/location/GoogleMapPicker";
import DeliveryAvailabilityCard from "@shop/components/location/DeliveryAvailabilityCard";
import { AddressType, DeliveryAddress } from "@shop/lib/types";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { defaultReceiverName, defaultReceiverPhone } from "@shop/lib/profile-utils";
import {
  isValidIndianPhone,
  normalizeIndianPhone,
  RECEIVER_PHONE_VALIDATION_MESSAGE,
} from "@shop/lib/validation/phone";

type EditorView = "pick" | "map" | "form";

type LocationResult = {
  addressDetails: {
    formattedAddress: string;
    areaName: string;
    city: string;
    pincode: string;
  };
  deliveryResult: {
    serviceable: boolean;
    distance?: number;
    branchId?: string;
    branchName?: string;
    estimatedTime?: string;
    deliveryCharge?: number;
    minimumOrderAmount?: number;
    message?: string;
  };
};

interface AddressEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress?: DeliveryAddress | null;
  onSaved?: (address: DeliveryAddress) => void;
  onUnavailable?: (pincode: string, area: string) => void;
}

export default function AddressEditorDialog({
  open,
  onOpenChange,
  editingAddress = null,
  onSaved,
  onUnavailable,
}: AddressEditorDialogProps) {
  const { addAddress, updateAddress } = useAddressStore();
  const { google } = useGoogleMaps();
  const user = useAuthStore((s) => s.user);

  const isEditing = !!editingAddress;

  const [view, setView] = useState<EditorView>("pick");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    house: "",
    apartment: "",
    street: "",
    area: "",
    landmark: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
    addressType: "home" as AddressType,
    isDefault: false,
  });

  const resetState = useCallback(() => {
    setView(isEditing ? "form" : "pick");
    setIsSaving(false);
    setIsCheckingDelivery(false);
    setLocationResult(null);
    setSelectedLat(editingAddress?.lat ?? null);
    setSelectedLng(editingAddress?.lng ?? null);
    setFormData({
      receiverName: editingAddress?.name || defaultReceiverName(user),
      phone: editingAddress?.phone || defaultReceiverPhone(user),
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
    });
  }, [editingAddress, isEditing, user]);

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  const handleLocationSelected = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationResult(null);
    setView("map");
  }, []);

  const handlePlaceSelected = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationResult(null);
    setView("map");
  }, []);

  const handleValidateDelivery = async () => {
    if (!google || selectedLat === null || selectedLng === null) return;

    setIsCheckingDelivery(true);
    setLocationResult(null);
    try {
      const res = await locationService.checkDelivery(selectedLat, selectedLng);

      let geoResult = {
        formattedAddress: `${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`,
        areaName: "",
        city: "Hyderabad",
        pincode: "",
      };

      try {
        const geo = await locationService.verifyAndSave(
          google,
          selectedLat,
          selectedLng,
        );
        geoResult = geo.addressDetails;
      } catch {
        // Use raw coordinates if reverse geocoding fails
      }

      setLocationResult({
        addressDetails: geoResult,
        deliveryResult: res,
      });

      if (res.serviceable) {
        setFormData((prev) => ({
          ...prev,
          city: prev.city || geoResult.city || "Hyderabad",
          pincode: prev.pincode || geoResult.pincode || "",
        }));
        setView("form");
      } else {
        toast.error(res.message || "Delivery not available to this location");
      }
    } catch {
      toast.error("Failed to verify delivery location");
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  const handleConfirmAndContinue = async () => {
    if (locationResult?.deliveryResult.serviceable) {
      setView("form");
      return;
    }
    await handleValidateDelivery();
  };

  const handleSaveAddress = async () => {
    if (!formData.receiverName.trim() || !formData.phone.trim() || !formData.house.trim()) {
      toast.error("Please fill in receiver name, number, and address");
      return;
    }

    if (!isValidIndianPhone(formData.phone)) {
      toast.error(RECEIVER_PHONE_VALIDATION_MESSAGE);
      return;
    }

    const normalizedPhone = normalizeIndianPhone(formData.phone);

    let lat = selectedLat;
    let lng = selectedLng;

    // Only forward-geocode when the user did not pin a location on the map.
    if (lat === null || lng === null) {
      try {
        const geocoded = await locationService.geocodeAddressParts({
          house: formData.house,
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        });
        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;
        }
      } catch {
        // fall back handled below
      }
    }

    if (lat === null || lng === null) {
      toast.error(
        "Could not locate this address. Please check the area and pincode.",
      );
      return;
    }

    try {
      const deliveryResult = await locationService.checkDelivery(lat, lng);
      if (!deliveryResult.serviceable) {
        const message =
          deliveryResult.message ||
          "Sorry, we don't deliver to this location yet.";
        toast.error(message);
        onUnavailable?.(formData.pincode, formData.area);
        return;
      }
    } catch {
      toast.error("Failed to verify delivery for this address");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.receiverName.trim(),
        phone: normalizedPhone,
        house: formData.house.trim(),
        apartment: formData.apartment || undefined,
        street: formData.street || undefined,
        area: formData.area || undefined,
        landmark: formData.landmark || undefined,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        addressType: formData.addressType,
        isDefault: formData.isDefault,
        lat,
        lng,
      };

      let saved: DeliveryAddress;
      if (isEditing && editingAddress) {
        await updateAddress(editingAddress.id, payload);
        saved = { ...editingAddress, ...payload };
        toast.success("Address updated successfully");
      } else {
        saved = await addAddress(payload);
        toast.success("Address saved successfully");
      }

      onSaved?.(saved);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        "Failed to save address";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
  };

  const title = isEditing ? "Edit Address" : "Add New Address";
  const description =
    view === "pick"
      ? "Choose how you'd like to set your delivery location"
      : view === "map"
        ? "Pin your exact delivery location on the map"
        : "Fill in the address details below";

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <AnimatePresence mode="wait">
            {view === "pick" && (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <CurrentLocationButton onLocationSelected={handleLocationSelected} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-popover px-3 text-xs text-muted-foreground">
                      or search
                    </span>
                  </div>
                </div>

                <LocationSearch onPlaceSelected={handlePlaceSelected} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-popover px-3 text-xs text-muted-foreground">
                      or enter manually
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedLat(null);
                    setSelectedLng(null);
                    setLocationResult(null);
                    setView("form");
                  }}
                >
                  Enter Address Manually
                </Button>
              </motion.div>
            )}

            {view === "map" && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={() => setView(isEditing ? "form" : "pick")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <GoogleMapPicker
                  initialLat={selectedLat ?? undefined}
                  initialLng={selectedLng ?? undefined}
                  onLocationChange={(lat, lng) => {
                    setSelectedLat(lat);
                    setSelectedLng(lng);
                    setLocationResult(null);
                  }}
                  className="h-[220px] sm:h-[240px]"
                />

                {locationResult && locationResult.deliveryResult.serviceable && (
                  <DeliveryAvailabilityCard
                    serviceable
                    branchName={locationResult.deliveryResult.branchName}
                    estimatedTime={locationResult.deliveryResult.estimatedTime}
                    deliveryCharge={locationResult.deliveryResult.deliveryCharge}
                    distance={locationResult.deliveryResult.distance}
                    areaName={locationResult.addressDetails.areaName}
                    formattedAddress={locationResult.addressDetails.formattedAddress}
                  />
                )}

                {locationResult && !locationResult.deliveryResult.serviceable && (
                  <DeliveryAvailabilityCard
                    serviceable={false}
                    message={locationResult.deliveryResult.message}
                    formattedAddress={locationResult.addressDetails.formattedAddress}
                    onChooseAnother={() => {
                      setLocationResult(null);
                      setView("pick");
                    }}
                  />
                )}
              </motion.div>
            )}

            {view === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    setView(selectedLat !== null && selectedLng !== null ? "map" : "pick")
                  }
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {isEditing && selectedLat !== null && selectedLng !== null
                    ? "Adjust on map"
                    : "Back"}
                </button>

                <div className="space-y-1.5">
                  <Label htmlFor="editor-receiver-name" className="text-xs">
                    Receiver Name *
                  </Label>
                  <Input
                    id="editor-receiver-name"
                    value={formData.receiverName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiverName: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editor-phone" className="text-xs">
                    Receiver Number *
                  </Label>
                  <Input
                    id="editor-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 or 10-digit number"
                    maxLength={14}
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editor-house" className="text-xs">
                    House / Flat / Floor *
                  </Label>
                  <Input
                    id="editor-house"
                    value={formData.house}
                    onChange={(e) =>
                      setFormData({ ...formData, house: e.target.value })
                    }
                    placeholder="e.g. 402, Sunshine Residency"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editor-apartment" className="text-xs">
                    Apartment / Tower
                  </Label>
                  <Input
                    id="editor-apartment"
                    value={formData.apartment}
                    onChange={(e) =>
                      setFormData({ ...formData, apartment: e.target.value })
                    }
                    placeholder="e.g. Tower B"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-street" className="text-xs">
                      Street
                    </Label>
                    <Input
                      id="editor-street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="Street name"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-area" className="text-xs">
                      Area / Locality
                    </Label>
                    <Input
                      id="editor-area"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      placeholder="e.g. HSR Layout"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-city" className="text-xs">
                      City *
                    </Label>
                    <Input
                      id="editor-city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-state" className="text-xs">
                      State *
                    </Label>
                    <Input
                      id="editor-state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-pincode" className="text-xs">
                      Pincode *
                    </Label>
                    <Input
                      id="editor-pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pincode: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="6 digits"
                      maxLength={6}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Address Type *</Label>
                  <RadioGroup
                    value={formData.addressType}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        addressType: v as AddressType,
                      })
                    }
                    className="flex gap-2"
                  >
                    {(["home", "work", "other"] as AddressType[]).map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
                          formData.addressType === type
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
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: checked === true })
                    }
                  />
                  <span className="text-sm">Set as default address</span>
                </label>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAddress}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {view === "map" && (
          <div className="shrink-0 border-t px-4 py-3">
            <Button
              onClick={handleConfirmAndContinue}
              disabled={
                selectedLat === null ||
                selectedLng === null ||
                !google ||
                isCheckingDelivery
              }
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isCheckingDelivery && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Confirm and Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

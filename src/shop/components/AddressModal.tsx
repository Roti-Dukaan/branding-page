"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@shop/lib/toast";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Navigation, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { Label } from "@shop/components/ui/label";
import { Input } from "@shop/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { Textarea } from "@shop/components/ui/textarea";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useLocationStore } from "@shop/lib/stores/location-store";
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
import { cn } from "@shop/lib/utils";

type AddressModalView = "list" | "map" | "form";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelected: (addressId: string) => void;
}

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

export default function AddressModal({
  open,
  onOpenChange,
  onAddressSelected,
}: AddressModalProps) {
  const { addresses, fetchAddresses, selectAddress, addAddress } =
    useAddressStore();
  const user = useAuthStore((s) => s.user);
  const { google } = useGoogleMaps();
  const [view, setView] = useState<AddressModalView>("list");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    useAddressStore.getState().selectedAddressId
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(
    null
  );
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
    deliveryInstructions: "",
  });

  useEffect(() => {
    if (open) {
      fetchAddresses();
      resetState();
    }
  }, [open, fetchAddresses]);

  const resetState = () => {
    setView("list");
    setSelectedAddressId(useAddressStore.getState().selectedAddressId);
    setIsSaving(false);
    setIsCheckingDelivery(false);
    setLocationResult(null);
    setSelectedLat(null);
    setSelectedLng(null);
    setFormData({
      receiverName: defaultReceiverName(user),
      phone: defaultReceiverPhone(user),
      house: "",
      apartment: "",
      street: "",
      area: "",
      landmark: "",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "",
      addressType: "home",
      deliveryInstructions: "",
    });
  };

  const handleSelectAddress = (addr: DeliveryAddress) => {
    setSelectedAddressId(addr.id);
    selectAddress(addr.id);
    // Set coordinates in location store if address has lat/lng
    if (addr.lat !== undefined && addr.lng !== undefined) {
      useLocationStore.getState().setCoordinates(addr.lat, addr.lng);
    }
    setTimeout(() => {
      onAddressSelected(addr.id);
      onOpenChange(false);
    }, 300);
  };

  const handleLocationSelected = useCallback(
    async (lat: number, lng: number) => {
      setSelectedLat(lat);
      setSelectedLng(lng);
      setView("map");
    },
    []
  );

  const handlePlaceSelected = useCallback(
    (lat: number, lng: number, _address: string) => {
      setSelectedLat(lat);
      setSelectedLng(lng);
      setView("map");
    },
    []
  );

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
          selectedLng
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
        toast.error(
          deliveryResult.message ||
            "Sorry, we don't deliver to this location yet.",
        );
        return;
      }
      useLocationStore.getState().setDeliveryResult(deliveryResult);
    } catch {
      toast.error("Failed to verify delivery for this address");
      return;
    }

    setIsSaving(true);
    try {
      const created = await addAddress({
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
        isDefault: false,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
      });

      selectAddress(created.id);
      useLocationStore.getState().setCoordinates(lat, lng);
      toast.success("Address saved successfully");
      onAddressSelected(created.id);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    resetState();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg",
          view === "map" && "h-[90vh] max-h-[90vh] p-0"
        )}
      >
        {view !== "map" && (
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg font-bold">Select Delivery Address</DialogTitle>
          </DialogHeader>
        )}

        <div
          className={cn(
            "relative min-h-0 flex-1",
            view !== "map" && "overflow-y-auto"
          )}
        >
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No saved addresses
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add your first delivery address
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold capitalize">
                            {addr.addressType}
                          </span>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {addr.phone ||
                            [addr.house, addr.street, addr.area]
                              .filter(Boolean)
                              .join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {addr.house}
                          {addr.apartment && `, ${addr.apartment}`}
                          {addr.street && `, ${addr.street}`}
                          {addr.area && `, ${addr.area}`}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label className="text-xs font-medium">Or add a new address</Label>

                <CurrentLocationButton
                  onLocationSelected={handleLocationSelected}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">
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
                    <span className="bg-background px-3 text-xs text-muted-foreground">
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
              </div>
            </motion.div>
          )}

          {view === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 flex flex-col"
            >
              <GoogleMapPicker
                initialLat={selectedLat ?? undefined}
                initialLng={selectedLng ?? undefined}
                onLocationChange={(lat, lng) => {
                  setSelectedLat(lat);
                  setSelectedLng(lng);
                  setLocationResult(null);
                }}
                onPlaceSelected={(lat, lng) => {
                  setSelectedLat(lat);
                  setSelectedLng(lng);
                  setLocationResult(null);
                }}
                showSearch
                showAddressCard
                className="h-full min-h-[420px]"
                footer={
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm & Continue
                  </Button>
                }
              />

              {locationResult && locationResult.deliveryResult.serviceable && (
                <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
                  <DeliveryAvailabilityCard
                    serviceable={true}
                    branchName={locationResult.deliveryResult.branchName}
                    estimatedTime={locationResult.deliveryResult.estimatedTime}
                    deliveryCharge={locationResult.deliveryResult.deliveryCharge}
                    distance={locationResult.deliveryResult.distance}
                    areaName={locationResult.addressDetails.areaName}
                    formattedAddress={locationResult.addressDetails.formattedAddress}
                  />
                </div>
              )}

              {locationResult && !locationResult.deliveryResult.serviceable && (
                <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
                  <DeliveryAvailabilityCard
                    serviceable={false}
                    message={locationResult.deliveryResult.message}
                    formattedAddress={locationResult.addressDetails.formattedAddress}
                    onChooseAnother={() => {
                      setLocationResult(null);
                      setView("list");
                    }}
                  />
                </div>
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
                onClick={() => setView("list")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <X className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="space-y-1.5">
                <Label htmlFor="addr-receiver-name" className="text-xs">
                  Receiver Name *
                </Label>
                <Input
                  id="addr-receiver-name"
                  value={formData.receiverName}
                  onChange={(e) =>
                    setFormData({ ...formData, receiverName: e.target.value })
                  }
                  placeholder="Full name"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-phone" className="text-xs">
                  Receiver Number *
                </Label>
                <Input
                  id="addr-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 or 10-digit number"
                  maxLength={14}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-house" className="text-xs">
                  House / Flat / Floor *
                </Label>
                <Input
                  id="addr-house"
                  value={formData.house}
                  onChange={(e) =>
                    setFormData({ ...formData, house: e.target.value })
                  }
                  placeholder="e.g. 402, Sunshine Residency"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="addr-street" className="text-xs">
                    Street
                  </Label>
                  <Input
                    id="addr-street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addr-area" className="text-xs">
                    Area / Locality
                  </Label>
                  <Input
                    id="addr-area"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-landmark" className="text-xs">
                  Landmark
                </Label>
                <Input
                  id="addr-landmark"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData({ ...formData, landmark: e.target.value })
                  }
                  placeholder="Near ..."
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="addr-city" className="text-xs">
                    City *
                  </Label>
                  <Input
                    id="addr-city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addr-state" className="text-xs">
                    State *
                  </Label>
                  <Input
                    id="addr-state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addr-pincode" className="text-xs">
                    Pincode *
                  </Label>
                  <Input
                    id="addr-pincode"
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
                <Label className="text-xs">Address Type</Label>
                <RadioGroup
                  value={formData.addressType}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      addressType: v as AddressType,
                    })
                  }
                  className="flex gap-3"
                >
                  {(["home", "work", "other"] as AddressType[]).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
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

              <div className="space-y-1.5">
                <Label htmlFor="addr-instructions" className="text-xs">
                  Delivery Instructions
                </Label>
                <Textarea
                  id="addr-instructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryInstructions: e.target.value,
                    })
                  }
                  placeholder="e.g. Leave at door, Ring bell twice..."
                  className="text-sm h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setView("list")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveAddress}
                  disabled={isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Address
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, Briefcase, MapPinned, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@shop/components/ui/sheet";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { Label } from "@shop/components/ui/label";
import { Input } from "@shop/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { Checkbox } from "@shop/components/ui/checkbox";
import { Textarea } from "@shop/components/ui/textarea";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { useDeliveryStore } from "@shop/lib/stores/delivery-store";
import { locationService } from "@shop/services/location.service";
import { AddressType, DeliveryAddress } from "@shop/lib/types";
import AddressEditorDialog from "./AddressEditorDialog";
import { toast } from "@shop/lib/toast";
import { normalizeEmail } from "@shop/lib/utils/email";

const addressTypeConfig: Record<
  AddressType,
  { icon: typeof Home; label: string; color: string }
> = {
  home: { icon: Home, label: "Home", color: "text-primary" },
  work: { icon: Briefcase, label: "Work", color: "text-blue-600" },
  other: { icon: MapPinned, label: "Other", color: "text-purple-600" },
};

type View = "list" | "unavailable" | "success";

const REASONS = [
  "Fresh Homemade Food",
  "Healthy Millet Rotis",
  "Affordable Pricing",
  "Subscription Plans",
  "Better Than Restaurant Food",
  "Recommended By Friends",
  "Other",
];

const FREQUENCIES = ["Daily", "Weekly", "Occasionally"];

const LAUNCH_INTERESTS = [
  "Jonna Roti",
  "Ragi Roti",
  "Healthy Meals",
  "Family Combos",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Subscription Plans",
];

export default function AddressSheet() {
  const {
    addresses,
    selectedAddressId,
    addressSheetOpen,
    setAddressSheetOpen,
    addressEditorOpen,
    addressEditorTarget,
    openAddressEditor,
    closeAddressEditor,
    selectAddress,
    deleteAddress,
    setDefaultAddress,
    updateAddress,
    fetchAddresses,
    loading,
    error,
  } = useAddressStore();
  const { submitInterest, hasSubmittedForPincode } = useDeliveryStore();

  const [view, setView] = useState<View>("list");
  const [pendingPincode, setPendingPincode] = useState("");
  const [pendingArea, setPendingArea] = useState("");
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  const [interestForm, setInterestForm] = useState({
    name: "",
    mobile: "",
    email: "",
    pincode: "",
    area: "",
    reason: "",
    otherReason: "",
    frequency: "",
    interests: [] as string[],
  });

  const resetInterestForm = () => {
    setInterestForm({
      name: "",
      mobile: "",
      email: "",
      pincode: pendingPincode,
      area: pendingArea,
      reason: "",
      otherReason: "",
      frequency: "",
      interests: [],
    });
    setInterestSubmitted(false);
    setIsSubmittingInterest(false);
  };

  const openUnavailable = (pincode: string, area: string) => {
    setPendingPincode(pincode);
    setPendingArea(area);
    setInterestForm((f) => ({
      ...f,
      pincode,
      area,
      name: "",
      mobile: "",
      email: "",
      reason: "",
      otherReason: "",
      frequency: "",
      interests: [],
    }));
    setInterestSubmitted(false);
    setView("unavailable");
  };

  const handleAddNew = () => {
    openAddressEditor(null);
  };

  const handleEdit = (address: DeliveryAddress) => {
    openAddressEditor(address);
  };

  const handleEditorSaved = async (saved: DeliveryAddress) => {
    try {
      const synced = await locationService.syncAddressDelivery(saved, {
        forceGeocode: false,
      });
      if (!synced?.deliveryResult.serviceable) {
        openUnavailable(saved.pincode || "", saved.area || "");
        return;
      }

      selectAddress(saved.id);
      setView("list");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to save address";
      toast.error(message);
    }
  };

  const handleSelectAddress = async (addr: DeliveryAddress) => {
    try {
      const synced = await locationService.syncAddressDelivery(addr, {
        forceGeocode: true,
      });

      if (!synced) {
        toast.error(
          "Could not determine delivery coordinates for this address. Please edit and save again.",
        );
        return;
      }

      if (!synced.deliveryResult.serviceable) {
        openUnavailable(addr.pincode || "", addr.area || "");
        return;
      }

      if (
        synced.lat !== addr.lat ||
        synced.lng !== addr.lng
      ) {
        await updateAddress(addr.id, { lat: synced.lat, lng: synced.lng });
      }

      selectAddress(addr.id);
      setAddressSheetOpen(false);
    } catch {
      toast.error("Failed to verify delivery for this address");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      toast.success("Address deleted successfully");
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || "Failed to delete address";
      toast.error(message);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
    toast.success("Default address updated");
  };

  const toggleInterest = (value: string) => {
    setInterestForm((f) => ({
      ...f,
      interests: f.interests.includes(value)
        ? f.interests.filter((i) => i !== value)
        : [...f.interests, value],
    }));
  };

  const handleInterestSubmit = async () => {
    if (
      !interestForm.name.trim() ||
      !interestForm.mobile.trim() ||
      !interestForm.pincode.trim() ||
      !interestForm.area.trim() ||
      !interestForm.reason ||
      !interestForm.frequency ||
      interestForm.interests.length === 0
    )
      return;
    if (isOther && !interestForm.otherReason.trim()) return;

    if (hasSubmittedForPincode(interestForm.pincode)) {
      setInterestSubmitted(true);
      return;
    }

    setIsSubmittingInterest(true);
    await new Promise((r) => setTimeout(r, 800));
    submitInterest({
      ...interestForm,
      otherReason: isOther ? interestForm.otherReason : undefined,
    });
    setIsSubmittingInterest(false);
    setInterestSubmitted(true);
    toast.success("Interest recorded successfully!");
  };

  const handleSuccessContinue = () => {
    setView("list");
    resetInterestForm();
  };

  const handleSheetClose = () => {
    setView("list");
    resetInterestForm();
  };

  const isOther = interestForm.reason === "Other";

  useEffect(() => {
    if (!addressSheetOpen) return;
    fetchAddresses();
  }, [addressSheetOpen, fetchAddresses]);

  const showListSkeleton = loading && addresses.length === 0;
  const showEmpty = !loading && addresses.length === 0;
  const showError = !!error && addresses.length === 0;

  return (
    <>
    <Sheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md pb-safe">
        <SheetHeader className="shrink-0 p-6 pb-2">
          <SheetTitle className="text-lg font-bold">
            {view === "list" && "Select Delivery Address"}
            {view === "unavailable" && "We're Almost There ❤️"}
            {view === "success" && "🎉 Thank You!"}
          </SheetTitle>
          <SheetDescription>
            {view === "list" && "Choose where you'd like your food delivered"}
            {view === "unavailable" &&
              "We currently deliver only within Hyderabad - 500089"}
            {view === "success" &&
              "We've added your location to our expansion list"}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {view === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 mt-2"
              >
                {showError && (
                  <div className="text-center py-8">
                    <MapPinned className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-1">
                      Failed to load addresses
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {error}
                    </p>
                    <Button onClick={fetchAddresses} variant="outline">
                      Retry
                    </Button>
                  </div>
                )}

                {showListSkeleton && (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                            <div className="h-3 w-48 rounded-md bg-muted animate-pulse" />
                            <div className="h-3 w-40 rounded-md bg-muted animate-pulse" />
                          </div>
                        </div>
                        <div className="h-px bg-border/50" />
                        <div className="flex gap-1">
                          <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
                          <div className="h-7 w-20 rounded-md bg-muted animate-pulse" />
                          <div className="h-7 w-8 rounded-md bg-muted animate-pulse ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showEmpty && (
                  <div className="text-center py-12">
                    <MapPinned className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-1">
                      No saved addresses
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add your first delivery address to get started
                    </p>
                    <Button
                      onClick={handleAddNew}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                )}

                {!showListSkeleton && !showEmpty && !showError && (
                  <>
                    {addresses.map((addr) => {
                      const config =
                        addressTypeConfig[addr.addressType] ||
                        addressTypeConfig.home;
                      const Icon = config.icon;
                      const isSelected = addr.id === selectedAddressId;

                      return (
                        <motion.div
                          key={addr.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleSelectAddress(addr)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  isSelected
                                    ? config.color
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-foreground capitalize">
                                    {config.label}
                                  </span>
                                  {addr.isDefault && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] px-1.5 py-0"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <Badge className="text-[9px] px-1.5 py-0 bg-primary text-primary-foreground">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {addr.phone ||
                                    [addr.house, addr.apartment, addr.street, addr.area]
                                      .filter(Boolean)
                                      .join(", ") ||
                                    `${addr.city}, ${addr.state} - ${addr.pincode}`}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {addr.house}
                                  {addr.apartment && `, ${addr.apartment}`}
                                  {addr.street && `, ${addr.street}`}
                                  {addr.area && `, ${addr.area}`}
                                  {addr.landmark && `, Near ${addr.landmark}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                          </div>

                          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(addr);
                              }}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {!addr.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefault(addr.id);
                                }}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(addr.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}

                    <Separator className="my-4" />

                    <Button
                      onClick={handleAddNew}
                      variant="outline"
                      className="w-full border-dashed border-2 h-12"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {view === "unavailable" && (
              <motion.div
                key="unavailable"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.1,
                    }}
                    className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center"
                  >
                    <span className="text-4xl">🚀</span>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-foreground mb-2"
                  >
                    We&apos;re Growing Every Day ❤️
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    Thank you for checking Roti Dukaan.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    We currently deliver only within
                    <br />
                    <span className="font-semibold text-foreground">
                      📍 Hyderabad - 500089
                    </span>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground mt-2"
                  >
                    We&apos;re expanding across Hyderabad soon and would love to
                    serve your area next.
                  </motion.p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      🎯
                    </span>
                    Help Us Reach You Faster
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="int-name" className="text-xs font-medium">
                        Name *
                      </Label>
                      <Input
                        id="int-name"
                        placeholder="Your name"
                        className="h-10 text-sm"
                        value={interestForm.name}
                        onChange={(e) =>
                          setInterestForm((f) => ({
                            ...f,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="int-mobile" className="text-xs font-medium">
                        Mobile Number *
                      </Label>
                      <Input
                        id="int-mobile"
                        placeholder="10-digit number"
                        className="h-10 text-sm"
                        maxLength={10}
                        value={interestForm.mobile}
                        onChange={(e) =>
                          setInterestForm((f) => ({
                            ...f,
                            mobile: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="int-email" className="text-xs font-medium">
                      Email (Optional)
                    </Label>
                    <Input
                      id="int-email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-10 text-sm"
                      value={interestForm.email}
                      onChange={(e) =>
                        setInterestForm((f) => ({
                          ...f,
                          email: normalizeEmail(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="int-pincode" className="text-xs font-medium">
                        Pincode *
                      </Label>
                      <Input
                        id="int-pincode"
                        placeholder="Pincode"
                        className="h-10 text-sm"
                        value={interestForm.pincode}
                        onChange={(e) =>
                          setInterestForm((f) => ({
                            ...f,
                            pincode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="int-area" className="text-xs font-medium">
                        Area *
                      </Label>
                      <Input
                        id="int-area"
                        placeholder="Area / Locality"
                        className="h-10 text-sm"
                        value={interestForm.area}
                        onChange={(e) =>
                          setInterestForm((f) => ({
                            ...f,
                            area: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2.5">
                    <Label className="text-xs font-medium">
                      Why would you like to choose Roti Dukaan? *
                    </Label>
                    <RadioGroup
                      value={interestForm.reason}
                      onValueChange={(value) =>
                        setInterestForm((f) => ({ ...f, reason: value }))
                      }
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {REASONS.map((reason) => (
                          <label
                            key={reason}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              interestForm.reason === reason
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <RadioGroupItem value={reason} />
                            <span className="text-sm font-medium">
                              {reason}
                            </span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                    {isOther && (
                      <Textarea
                        placeholder="Tell us what you're looking for..."
                        className="text-sm mt-2"
                        value={interestForm.otherReason}
                        onChange={(e) =>
                          setInterestForm((f) => ({
                            ...f,
                            otherReason: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2.5">
                    <Label className="text-xs font-medium">
                      How often would you order? *
                    </Label>
                    <RadioGroup
                      value={interestForm.frequency}
                      onValueChange={(value) =>
                        setInterestForm((f) => ({ ...f, frequency: value }))
                      }
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {FREQUENCIES.map((freq) => (
                          <label
                            key={freq}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              interestForm.frequency === freq
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <RadioGroupItem value={freq} />
                            <span className="text-xs font-medium">{freq}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2.5">
                    <Label className="text-xs font-medium">
                      What would you like us to introduce first? *
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {LAUNCH_INTERESTS.map((item) => (
                        <label
                          key={item}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            interestForm.interests.includes(item)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <Checkbox
                            checked={interestForm.interests.includes(item)}
                            onCheckedChange={() => toggleInterest(item)}
                          />
                          <span className="text-xs font-medium">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    disabled={
                      !interestForm.name.trim() ||
                      !interestForm.mobile.trim() ||
                      !interestForm.pincode.trim() ||
                      !interestForm.area.trim() ||
                      !interestForm.reason ||
                      !interestForm.frequency ||
                      interestForm.interests.length === 0 ||
                      (isOther && !interestForm.otherReason.trim()) ||
                      isSubmittingInterest
                    }
                    onClick={handleInterestSubmit}
                  >
                    {isSubmittingInterest && (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        ⟳
                      </motion.span>
                    )}
                    {isSubmittingInterest
                      ? "Submitting..."
                      : "Notify Me When You Launch"}
                  </Button>
                </div>
              </motion.div>
            )}

            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <span className="text-3xl">🎉</span>
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  We&apos;ve added your location to our expansion list. As soon as
                  Roti Dukaan starts serving <strong>{pendingPincode}</strong>,
                  we&apos;ll notify you.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleSuccessContinue}
                >
                  Back to Home
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {view === "unavailable" && interestSubmitted && !isSubmittingInterest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  setInterestSubmitted(false);
                  setView("success");
                }}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <AddressEditorDialog
      open={addressEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeAddressEditor();
      }}
      editingAddress={addressEditorTarget}
      onSaved={handleEditorSaved}
      onUnavailable={(pincode, area) => openUnavailable(pincode, area)}
    />
    </>
  );
}

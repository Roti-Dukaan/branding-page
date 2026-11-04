"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { useCartStore } from "@shop/lib/store";
import { useAddressStore } from "@shop/lib/stores/address-store";
import { locationService } from "@shop/services/location.service";
import { useGoogleMaps } from "@shop/hooks/use-google-maps";
import { toast } from "@shop/lib/toast";
import { cn } from "@shop/lib/utils";
import CurrentLocationButton from "./CurrentLocationButton";
import LocationSearch from "./LocationSearch";
import GoogleMapPicker from "./GoogleMapPicker";
import DeliveryAvailabilityCard from "./DeliveryAvailabilityCard";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogView = "select" | "map" | "result";

export default function LocationDialog({
  open,
  onOpenChange,
}: LocationDialogProps) {
  const { google, loadError } = useGoogleMaps();
  const store = useLocationStore();
  const cartItems = useCartStore((s) => s.items);
  const [view, setView] = useState<DialogView>("select");
  const [selectedLat, setSelectedLat] = useState<number | null>(
    store.latitude
  );
  const [selectedLng, setSelectedLng] = useState<number | null>(
    store.longitude
  );
  const [validating, setValidating] = useState(false);
  const [showCartWarning, setShowCartWarning] = useState(false);
  const [result, setResult] = useState<{
    addressDetails: any;
    deliveryResult: any;
  } | null>(null);

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
    if (selectedLat === null || selectedLng === null || !google) return;

    setValidating(true);
    setResult(null);

    try {
      const res = await locationService.verifyAndSave(
        google,
        selectedLat,
        selectedLng
      );
      setResult(res);
      setView("result");
      toast.success("Delivery location updated successfully");
    } catch {
      toast.error("Failed to verify delivery location");
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmLocation = () => {
    const hasExistingLocation = store.branchId !== null;
    if (hasExistingLocation && cartItems.length > 0) {
      setShowCartWarning(true);
      return;
    }
    useAddressStore.getState().clearSelectedAddress();
    onOpenChange(false);
  };

  const handleConfirmChangeWithCartClear = () => {
    setShowCartWarning(false);
    useCartStore.getState().clearCart();
    useAddressStore.getState().clearSelectedAddress();
    onOpenChange(false);
  };

  const handleCancelCartClear = () => {
    setShowCartWarning(false);
  };

  const handleChooseAnother = () => {
    setResult(null);
    setView("select");
    setSelectedLat(null);
    setSelectedLng(null);
  };

  const handleDialogClose = () => {
    if (validating) return;
    setView("select");
    setResult(null);
    onOpenChange(false);
  };

  if (!open) return null;

  if (loadError) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl text-center">
              <p className="text-sm font-semibold text-foreground">Maps unavailable</p>
              <p className="mt-2 text-xs text-muted-foreground">{loadError}</p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "flex w-full flex-col overflow-hidden bg-background shadow-2xl",
              "h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl",
              // Map view uses absolute children — keep a real height so the dialog
              // does not collapse to a blank blurred overlay after search.
              view === "map" && "sm:h-[min(90vh,640px)] sm:min-h-[520px]",
            )}
          >
            {/* Header */}
            {view !== "map" && (
              <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    Choose Delivery Location
                  </h2>
                </div>
                <button
                  onClick={handleDialogClose}
                  disabled={validating}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Content */}
            <div
              className={cn(
                "relative flex-1 overflow-hidden",
                view !== "map" && "overflow-y-auto p-4 sm:p-6"
              )}
            >
              <AnimatePresence mode="wait">
                {view === "select" && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
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
                  </motion.div>
                )}

                {view === "map" && (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <GoogleMapPicker
                      initialLat={selectedLat ?? undefined}
                      initialLng={selectedLng ?? undefined}
                      onLocationChange={(lat, lng) => {
                        setSelectedLat(lat);
                        setSelectedLng(lng);
                        setResult(null);
                      }}
                      onPlaceSelected={(lat, lng) => {
                        setSelectedLat(lat);
                        setSelectedLng(lng);
                        setResult(null);
                      }}
                      showSearch
                      showAddressCard
                      className="h-full min-h-[420px]"
                      footer={
                        <div className="flex gap-3">
                          <button
                            onClick={() => setView("select")}
                            className="flex-1 cursor-pointer rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleValidateDelivery}
                            disabled={
                              validating ||
                              selectedLat === null ||
                              selectedLng === null ||
                              !google
                            }
                            className="flex-1 cursor-pointer rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                          >
                            {validating ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking...
                              </span>
                            ) : (
                              "Confirm & Continue"
                            )}
                          </button>
                        </div>
                      }
                    />
                  </motion.div>
                )}

                {view === "result" && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4 p-4 sm:p-6"
                  >
                    <DeliveryAvailabilityCard
                      serviceable={result.deliveryResult.serviceable}
                      branchName={result.deliveryResult.branchName}
                      branchId={result.deliveryResult.branchId}
                      estimatedTime={result.deliveryResult.estimatedTime}
                      deliveryCharge={result.deliveryResult.deliveryCharge}
                      distance={result.deliveryResult.distance}
                      message={result.deliveryResult.message}
                      areaName={result.addressDetails.areaName}
                      formattedAddress={result.addressDetails.formattedAddress}
                      onChooseAnother={handleChooseAnother}
                    />

                    {result.deliveryResult.serviceable && (
                      <div className="flex gap-3">
                        <button
                          onClick={handleChooseAnother}
                          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Change Location
                        </button>
                        <button
                          onClick={handleConfirmLocation}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          Confirm Location
                        </button>
                      </div>
                    )}

                    {!result.deliveryResult.serviceable && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Try searching for a different location nearby
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cart clear warning when changing location */}
              <AnimatePresence>
                {showCartWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
                  >
                    <div className="text-center space-y-4 max-w-sm">
                      <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">Change Delivery Location?</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Changing your delivery location will clear the items in your cart. 
                          Your delivery charges and estimated time may also change.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancelCartClear}
                          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmChangeWithCartClear}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          Yes, Change Location
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

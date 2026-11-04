"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Navigation } from "lucide-react";
import { locationService } from "@shop/services/location.service";
import { loadGoogleMaps } from "@shop/lib/google-maps";
import { toast } from "@shop/lib/toast";

interface CurrentLocationButtonProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

export default function CurrentLocationButton({
  onLocationSelected,
}: CurrentLocationButtonProps) {
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);

    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        return;
      }

      const [position] = await Promise.all([
        locationService.getCurrentPosition(),
        loadGoogleMaps(),
      ]);

      onLocationSelected(position.coords.latitude, position.coords.longitude);
    } catch (err: any) {
      if (err?.code === 1) {
        toast.error(
          "Location permission denied. Click the lock icon in your address bar → Location → Allow, then try again.",
        );
      } else if (err?.code === 2) {
        toast.error(
          "Unable to detect your location. On Windows, enable Location in Settings → Privacy & security.",
        );
      } else if (err?.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error(err?.message || "Failed to get current location");
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleGetCurrentLocation}
      disabled={locating}
      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all disabled:opacity-60 cursor-pointer"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
        {locating ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <Navigation className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-foreground">
          {locating ? "Detecting location..." : "Use Current Location"}
        </p>
        <p className="text-xs text-muted-foreground">
          Auto-detect your delivery location
        </p>
      </div>
    </motion.button>
  );
}

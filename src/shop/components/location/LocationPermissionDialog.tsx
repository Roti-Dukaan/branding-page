"use client";

import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, X } from "lucide-react";

interface LocationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllow: () => void;
}

export default function LocationPermissionDialog({
  open,
  onOpenChange,
  onAllow,
}: LocationPermissionDialogProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-background rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-6 text-center">
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2">
                Enable Location Access
              </h2>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Allow Roti Dukaan to access your location to check delivery
                availability and find the nearest kitchen serving fresh meals
                near you.
              </p>

              <div className="space-y-3">
                <button
                  onClick={onAllow}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  Allow Location Access
                </button>

                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground mt-4">
                Your location is used only to check delivery availability. We
                never share your location data.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

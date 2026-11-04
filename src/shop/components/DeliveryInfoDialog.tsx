"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { MapPin, Rocket, Sparkles, Heart } from "lucide-react";
import { useDeliveryStore } from "@shop/lib/stores/delivery-store";
import InterestForm from "@shop/components/address/InterestForm";

const CURRENT_PINCODE = "500089";
const COMING_SOON = [
  "Gachibowli",
  "Kondapur",
  "Madhapur",
  "Financial District",
  "Nallagandla",
  "Tellampur",
  "Kokapet",
  "Narsingi",
];

interface DeliveryInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeliveryInfoDialog({
  open,
  onOpenChange,
}: DeliveryInfoDialogProps) {
  const { servicePincode } = useDeliveryStore();
  const [showInterestForm, setShowInterestForm] = useState(false);

  const handleNotifyMe = () => {
    setShowInterestForm(true);
  };

  const handleInterestSuccess = () => {
    setShowInterestForm(false);
  };

  const handleClose = () => {
    setShowInterestForm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        <AnimatePresence mode="wait">
          {!showInterestForm ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-5"
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Coverage
                </DialogTitle>
                <DialogDescription>
                  Where we deliver fresh homemade meals right now.
                </DialogDescription>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Currently Serving
                  </h4>
                  <Badge className="text-[10px] px-2 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-transparent">
                    <p className="text-xs text-muted-foreground mb-1">City</p>
                    <p className="font-semibold text-sm">Hyderabad</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-transparent">
                    <p className="text-xs text-muted-foreground mb-1">Pincode</p>
                    <p className="font-semibold text-sm">{servicePincode}</p>
                  </div>
                </div>
              </motion.div>

              <Separator />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Coming Soon
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {COMING_SOON.map((location, index) => (
                    <motion.div
                      key={location}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="p-3 rounded-xl border border-border bg-muted/30 text-center"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {location}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <Separator />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-3"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We&apos;re expanding across Hyderabad soon and would love to
                  serve your area next.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleNotifyMe}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Notify Me When You Launch
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <InterestForm
              open={showInterestForm}
              pincode={servicePincode}
              area=""
              onClose={handleClose}
              onSuccess={handleInterestSuccess}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

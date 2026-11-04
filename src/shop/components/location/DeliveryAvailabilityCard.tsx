"use client";

import { motion } from "motion/react";
import { CheckCircle2, MapPin, Clock, IndianRupee, UtensilsCrossed } from "lucide-react";

interface DeliveryAvailabilityCardProps {
  serviceable: boolean;
  branchName?: string;
  branchId?: string;
  estimatedTime?: string;
  deliveryCharge?: number;
  distance?: number;
  message?: string;
  areaName?: string;
  formattedAddress?: string;
  onChooseAnother?: () => void;
  outsideRadiusButServiceable?: boolean;
}

export default function DeliveryAvailabilityCard({
  serviceable,
  branchName,
  branchId,
  estimatedTime,
  deliveryCharge,
  distance,
  message,
  areaName,
  formattedAddress,
  onChooseAnother,
  outsideRadiusButServiceable,
}: DeliveryAvailabilityCardProps) {
  if (serviceable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white overflow-hidden"
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700">We Deliver Here</p>
              {areaName && (
                <p className="text-xs text-emerald-600">{areaName}</p>
              )}
            </div>
          </div>

          {outsideRadiusButServiceable && (
            <div className="rounded-lg bg-cream-deep border border-amber-200 p-3 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 text-xs font-medium">⚠</span>
                <p className="text-xs text-amber-800">
                  Delivery available (outside normal radius). Delivery may take longer.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {branchName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                <span>{branchName}</span>
              </div>
            )}
            {estimatedTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{estimatedTime}</span>
              </div>
            )}
            {deliveryCharge !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5 text-primary" />
                <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
              </div>
            )}
            {distance !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{distance} km</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50/80 to-white overflow-hidden"
    >
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-red-700">Sorry!</p>
          <p className="text-xs text-red-600 mt-0.5">
            {message || "We currently do not deliver to this location."}
          </p>
        </div>

        {formattedAddress && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{formattedAddress}</span>
          </p>
        )}

        {onChooseAnother && (
          <button
            onClick={onChooseAnother}
            className="w-full py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-colors cursor-pointer"
          >
            Choose Another Location
          </button>
        )}
      </div>
    </motion.div>
  );
}

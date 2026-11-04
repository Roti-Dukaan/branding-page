"use client";

import { User, Phone, Clock } from "lucide-react";
import { getEtaMessage } from "@shop/features/orders/utils/delivery-eta";
import type { DeliveryStatus } from "@shop/features/orders/types/delivery";

interface DeliveryPartnerCardProps {
  name?: string;
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  estimatedArrival?: string;
  deliveryStatus?: DeliveryStatus;
  otp?: string;
}

/**
 * Rider / delivery-partner card shown to the customer after a rider is assigned.
 * Mirrors the Uber Eats / Swiggy merchant card.
 */
export function DeliveryPartnerCard({
  name,
  phone,
  vehicleType,
  vehicleNumber,
  estimatedArrival,
  deliveryStatus,
  otp,
}: DeliveryPartnerCardProps) {
  if (!name && !phone && !vehicleNumber) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{name ?? "Delivery Partner"}</p>
          <p className="text-xs text-gray-500">
            {vehicleType ?? "Delivery Partner"}
            {vehicleNumber ? ` · ${vehicleNumber}` : ""}
          </p>
        </div>
      </div>

      {phone && (
        <div className="mt-4">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <Phone className="h-4 w-4" />
            Call Rider
          </a>
        </div>
      )}

      {(estimatedArrival || deliveryStatus) &&
        deliveryStatus &&
        !["DELIVERED", "FAILED", "CANCELLED"].includes(deliveryStatus) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <Clock className="h-4 w-4" />
          <span className="font-semibold">{getEtaMessage(estimatedArrival, deliveryStatus)}</span>
        </div>
      )}

      {otp && (
        <div className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-3 py-2.5 text-center">
          <p className="text-xs uppercase tracking-wide text-indigo-500">Pickup OTP</p>
          <p className="font-mono text-2xl font-bold tracking-[0.3em] text-indigo-700">{otp}</p>
        </div>
      )}
    </div>
  );
}

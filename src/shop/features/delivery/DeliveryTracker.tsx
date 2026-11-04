"use client";

import { motion } from "motion/react";
import { Search, Bike, MapPin, PackageCheck, Truck, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { formatCustomerEtaMessage } from "@shop/features/orders/utils/customer-delivery-ui";
import type { DeliveryTracking } from "../orders/types/delivery";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { DeliveryPartnerCard } from "./DeliveryPartnerCard";
import { DeliveryTimeline } from "./DeliveryTimeline";

interface DeliveryTrackerProps {
  delivery: DeliveryTracking;
  className?: string;
}

/**
 * Customer-facing delivery tracker. Renders a live status header, an animated
 * stage banner, the rider card (once assigned) and the full timeline.
 * Never crashes on missing data. Falls back to the last known status.
 */
export function DeliveryTracker({ delivery, className }: DeliveryTrackerProps) {
  const status = delivery.status;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900">Delivery Tracking</h3>
        <DeliveryStatusBadge status={status} />
      </div>

      <StageBanner status={status} />

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="font-semibold">{formatCustomerEtaMessage(delivery)}</span>
      </div>

      {(delivery.riderName || delivery.vehicleNumber) && (
        <div className="mt-4">
          <DeliveryPartnerCard
            name={delivery.riderName}
            phone={delivery.riderPhone}
            vehicleType="Bike"
            vehicleNumber={delivery.vehicleNumber}
            estimatedArrival={delivery.estimatedDeliveryAt}
            deliveryStatus={status}
            otp={delivery.pickupOtp}
          />
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-gray-700">Timeline</p>
        <DeliveryTimeline entries={delivery.timeline ?? []} currentStatus={status} />
      </div>
    </div>
  );
}

const STAGE: Record<
  string,
  { icon: React.ReactNode; title: string; subtitle: string; tone: string }
> = {
  WAITING_FOR_KITCHEN: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "The kitchen is getting your food ready.",
    tone: "bg-cream-deep text-amber-800",
  },
  WAITING_FOR_PROVIDER: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Our kitchen is preparing your fresh rotis.",
    tone: "bg-cream-deep text-amber-800",
  },
  PROVIDER_ASSIGNMENT_FAILED: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Our kitchen is preparing your fresh rotis.",
    tone: "bg-cream-deep text-amber-800",
  },
  PROVIDER_ASSIGNED: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Your order will be on the way shortly.",
    tone: "bg-cream-deep text-amber-800",
  },
  RIDER_ARRIVING: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Your order will be on the way shortly.",
    tone: "bg-cream-deep text-amber-800",
  },
  RIDER_ARRIVED: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Your order is almost ready to leave.",
    tone: "bg-cream-deep text-amber-800",
  },
  AWAITING_PICKUP: {
    icon: <PackageCheck className="h-5 w-5" />,
    title: "Order preparing",
    subtitle: "Your order is packed and will leave soon.",
    tone: "bg-cream-deep text-amber-800",
  },
  PICKED_UP: {
    icon: <Bike className="h-5 w-5" />,
    title: "On the way",
    subtitle: "Your order is heading to you.",
    tone: "bg-indigo-50 text-indigo-800",
  },
  OUT_FOR_DELIVERY: {
    icon: <Truck className="h-5 w-5" />,
    title: "On the way",
    subtitle: "Your order is heading to your address.",
    tone: "bg-indigo-50 text-indigo-800",
  },
  NEAR_CUSTOMER: {
    icon: <MapPin className="h-5 w-5" />,
    title: "Rider nearby",
    subtitle: "Your delivery partner is near you — get ready!",
    tone: "bg-indigo-50 text-indigo-800",
  },
  DELIVERED: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Delivered",
    subtitle: "Your order has been delivered. Enjoy your meal!",
    tone: "bg-green-50 text-green-700",
  },
  FAILED: {
    icon: <AlertCircle className="h-5 w-5" />,
    title: "Delivery Failed",
    subtitle: "Something went wrong. Our team will contact you.",
    tone: "bg-red-50 text-red-700",
  },
  CANCELLED: {
    icon: <AlertCircle className="h-5 w-5" />,
    title: "Cancelled",
    subtitle: "This delivery was cancelled.",
    tone: "bg-gray-50 text-gray-700",
  },
};

function StageBanner({ status }: { status: string }) {
  const stage = STAGE[status] ?? STAGE.WAITING_FOR_PROVIDER;
  const isActive = ["WAITING_FOR_PROVIDER", "RIDER_ARRIVING", "OUT_FOR_DELIVERY"].includes(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 flex items-center gap-3 rounded-2xl p-4 ${stage.tone}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70">
        {isActive ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="flex"
          >
            <Loader2 className="h-5 w-5" />
          </motion.span>
        ) : (
          stage.icon
        )}
      </div>
      <div>
        <p className="font-semibold">{stage.title}</p>
        <p className="text-sm opacity-80">{stage.subtitle}</p>
      </div>
    </motion.div>
  );
}

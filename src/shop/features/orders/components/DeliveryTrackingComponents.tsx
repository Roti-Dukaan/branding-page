"use client";

import { Clock, CheckCircle, AlertCircle, MapPin, Truck, User, Phone, Package } from "lucide-react";
import { formatTimestamp } from "@shop/lib/date";
import type { DeliveryStatus, DeliveryOrder, DeliveryTracking } from "../types/delivery";
import {
  buildCustomerTimeline,
  formatCustomerEtaMessage,
  getCustomerEtaLabel,
  getCustomerStepId,
  getCustomerStepIndex,
  CUSTOMER_DELIVERY_STEPS,
  type CustomerDeliveryStepId,
} from "../utils/customer-delivery-ui";

const STEP_STATUS_ICON: Record<CustomerDeliveryStepId, DeliveryStatus> = {
  pending: "WAITING_FOR_KITCHEN",
  preparing: "WAITING_FOR_KITCHEN",
  ready_for_pickup: "AWAITING_PICKUP",
  on_the_way: "OUT_FOR_DELIVERY",
  arrived: "NEAR_CUSTOMER",
  delivered: "DELIVERED",
};

const STEP_STATUS_STYLE: Record<CustomerDeliveryStepId, { color: string; bgColor: string }> = {
  pending: { color: "text-gray-600", bgColor: "bg-gray-100" },
  preparing: { color: "text-amber-600", bgColor: "bg-amber-100" },
  ready_for_pickup: { color: "text-lime-700", bgColor: "bg-lime-100" },
  on_the_way: { color: "text-indigo-600", bgColor: "bg-indigo-100" },
  arrived: { color: "text-purple-700", bgColor: "bg-purple-100" },
  delivered: { color: "text-emerald-600", bgColor: "bg-emerald-100" },
};

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  WAITING_FOR_KITCHEN: { label: "Order preparing", color: "text-amber-600", bgColor: "bg-amber-100", icon: <Package className="w-4 h-4" /> },
  WAITING_FOR_PROVIDER: { label: "Finding rider", color: "text-amber-600", bgColor: "bg-amber-100", icon: <Package className="w-4 h-4" /> },
  PROVIDER_ASSIGNMENT_FAILED: { label: "Finding rider", color: "text-amber-600", bgColor: "bg-amber-100", icon: <Package className="w-4 h-4" /> },
  PROVIDER_ASSIGNED: { label: "Rider assigned", color: "text-lime-700", bgColor: "bg-lime-100", icon: <Package className="w-4 h-4" /> },
  RIDER_ARRIVING: { label: "Rider on the way", color: "text-lime-700", bgColor: "bg-lime-100", icon: <Package className="w-4 h-4" /> },
  RIDER_ARRIVED: { label: "Rider at kitchen", color: "text-lime-700", bgColor: "bg-lime-100", icon: <Package className="w-4 h-4" /> },
  AWAITING_PICKUP: { label: "Ready for pickup", color: "text-lime-700", bgColor: "bg-lime-100", icon: <Package className="w-4 h-4" /> },
  PICKED_UP: { label: "On the way", color: "text-indigo-600", bgColor: "bg-indigo-100", icon: <Truck className="w-4 h-4" /> },
  OUT_FOR_DELIVERY: { label: "On the way", color: "text-indigo-600", bgColor: "bg-indigo-100", icon: <Truck className="w-4 h-4" /> },
  NEAR_CUSTOMER: { label: "Rider nearby", color: "text-indigo-600", bgColor: "bg-indigo-100", icon: <MapPin className="w-4 h-4" /> },
  DELIVERED: { label: "Delivered", color: "text-emerald-600", bgColor: "bg-emerald-100", icon: <CheckCircle className="w-4 h-4" /> },
  FAILED: { label: "Failed", color: "text-red-600", bgColor: "bg-red-100", icon: <AlertCircle className="w-4 h-4" /> },
  CANCELLED: { label: "Cancelled", color: "text-gray-600", bgColor: "bg-gray-100", icon: <AlertCircle className="w-4 h-4" /> },
};

interface CustomerDeliveryProgressProps {
  delivery: DeliveryTracking;
  className?: string;
}

export function CustomerDeliveryProgress({ delivery, className }: CustomerDeliveryProgressProps) {
  const currentStep = getCustomerStepId(delivery.status, delivery.order?.status);
  const currentIndex = getCustomerStepIndex(currentStep);
  const steps = buildCustomerTimeline(delivery);
  const cancelled = delivery.status === "FAILED" || delivery.status === "CANCELLED";

  if (cancelled) {
    const config = STATUS_CONFIG[delivery.status];
    return (
      <div className={`flex items-center gap-3 rounded-xl bg-red-50 p-3 ${className ?? ""}`}>
        {config.icon}
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {steps.map((step, index) => {
        const completed = index < currentIndex || delivery.status === "DELIVERED";
        const isCurrent = index === currentIndex && delivery.status !== "DELIVERED";
        const isLast = index === CUSTOMER_DELIVERY_STEPS.length - 1;
        const config = STATUS_CONFIG[STEP_STATUS_ICON[step.stepId]];
        const stepStyle = STEP_STATUS_STYLE[step.stepId];

        return (
          <div key={step.id} className="flex gap-3 relative">
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${
                  completed || isCurrent ? stepStyle.color : "text-gray-300"
                } ${completed || isCurrent ? stepStyle.bgColor : "bg-gray-100"}`}
              >
                {config.icon}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 mt-1 min-h-[24px] ${
                    completed ? "bg-orange-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1 pb-4">
              <div className={`flex items-center gap-2 flex-wrap ${isCurrent ? "font-semibold text-gray-900" : completed ? "font-medium text-gray-800" : "text-gray-400"}`}>
                <span className="text-sm">{step.label}</span>
                {step.timestamp && (completed || isCurrent) && (
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(step.timestamp)}
                  </span>
                )}
              </div>
              {(completed || isCurrent) && (
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** @deprecated Use CustomerDeliveryProgress for customer-facing tracking. */
interface DeliveryTimelineProps {
  timeline: import("../types/delivery").DeliveryTimelineEntry[];
  currentStatus: DeliveryStatus;
  className?: string;
}

export function DeliveryTimeline({ timeline, currentStatus, className }: DeliveryTimelineProps) {
  const currentIndex = timeline.findIndex((e) => e.status === currentStatus);

  return (
    <div className={className}>
      {timeline.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.OUT_FOR_DELIVERY;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={entry.id} className="flex gap-3 relative">
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${
                  isCompleted || isCurrent ? config.color : "text-gray-300"
                } ${isCompleted || isCurrent ? config.bgColor : "bg-gray-100"}`}
              >
                {config.icon}
              </div>
              {index < timeline.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 ${
                    isCompleted ? config.color.replace("text", "bg") : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className={`flex items-center gap-2 ${isCurrent ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                <span className="text-sm">{config.label}</span>
                <span className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</span>
              </div>
              {entry.remarks && (
                <p className="text-sm text-gray-500 mt-1">{entry.remarks}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RiderInfoCardProps {
  name?: string;
  phone?: string;
  vehicleNumber?: string;
}

export function RiderInfoCard({ name, phone, vehicleNumber }: RiderInfoCardProps) {
  if (!name && !phone && !vehicleNumber) return null;

  return (
    <div className="bg-indigo-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-600" />
        Rider Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {name && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
            <p className="font-medium text-gray-900">{name}</p>
          </div>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="font-medium text-indigo-600 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {phone}
            </p>
          </a>
        )}
        {vehicleNumber && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
            <p className="font-medium text-gray-900">{vehicleNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface DeliveryEtaCardProps {
  delivery: DeliveryTracking;
  className?: string;
}

export function DeliveryEtaCard({ delivery, className }: DeliveryEtaCardProps) {
  const etaMessage = formatCustomerEtaMessage(delivery);
  const isTerminal = ["DELIVERED", "FAILED", "CANCELLED"].includes(delivery.status)
    || delivery.order?.status === "DELIVERED"
    || delivery.order?.status === "CANCELLED"
    || delivery.order?.status === "FAILED";
  const etaLabel = getCustomerEtaLabel(delivery);

  return (
    <div className={className}>
      <div
        className={`rounded-xl p-4 ${
          isTerminal
            ? delivery.status === "DELIVERED" || delivery.order?.status === "DELIVERED"
              ? "bg-emerald-50"
              : "bg-gray-50"
            : "bg-indigo-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isTerminal
                ? delivery.status === "DELIVERED" || delivery.order?.status === "DELIVERED"
                  ? "bg-emerald-100"
                  : "bg-gray-100"
                : "bg-indigo-100"
            }`}
          >
            <Clock
              className={`w-5 h-5 ${
                isTerminal
                  ? delivery.status === "DELIVERED" || delivery.order?.status === "DELIVERED"
                    ? "text-emerald-600"
                    : "text-gray-500"
                  : "text-indigo-600"
              }`}
            />
          </div>
          <div>
            <p className="text-xs text-gray-500">{etaLabel}</p>
            <p
              className={`font-semibold text-lg ${
                isTerminal
                  ? delivery.status === "DELIVERED" || delivery.order?.status === "DELIVERED"
                    ? "text-emerald-800"
                    : "text-gray-700"
                  : "text-indigo-800"
              }`}
            >
              {etaMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeliveryInfoProps {
  order?: DeliveryOrder;
  delivery: DeliveryTracking;
}

export function DeliveryInfo({ order, delivery }: DeliveryInfoProps) {
  const address = order?.address;

  return (
    <div className="space-y-6">
      {delivery.actualDeliveryAt && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivered At</p>
            <p className="font-medium text-emerald-800">{formatTimestamp(delivery.actualDeliveryAt)}</p>
          </div>
        </div>
      )}

      {address && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Delivery Address
          </h4>
          <address className="text-sm text-gray-700 not-italic space-y-1">
            <p className="font-medium">{address.customerName}</p>
            <p>{address.phoneNumber}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            {address.landmark && <p className="text-gray-500">Near: {address.landmark}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
          </address>
        </div>
      )}
    </div>
  );
}

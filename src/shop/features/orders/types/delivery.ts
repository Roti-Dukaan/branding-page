export type DeliveryStatus =
  | "WAITING_FOR_KITCHEN"
  | "WAITING_FOR_PROVIDER"
  | "PROVIDER_ASSIGNMENT_FAILED"
  | "PROVIDER_ASSIGNED"
  | "RIDER_ARRIVING"
  | "RIDER_ARRIVED"
  | "AWAITING_PICKUP"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "NEAR_CUSTOMER"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export type DeliveryType = "QUICK" | "SCHEDULED";

export type DeliveryProvider =
  | "SHADOWFAX"
  | "SELF_DELIVERY"
  | "SHIPROCKET"
  | "PORTER";

export interface RiderInfo {
  name?: string;
  phone?: string;
  vehicleNumber?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
}

export interface DeliveryTimelineEntry {
  id: string;
  event: string;
  status: DeliveryStatus;
  title?: string | null;
  description?: string | null;
  fromStatus?: string | null;
  actorType: string;
  actorId?: string | null;
  remarks?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  deliveryType: DeliveryType;
  provider?: string | null;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  deliveryFee?: number;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  pickupOtp?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  riderTrackingUrl?: string | null;
  providerStatus?: string | null;
  timeline?: DeliveryTimelineEntry[];
  createdAt: string;
  updatedAt: string;
  order?: DeliveryOrder;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    name?: string;
    phone?: string;
  };
  deliveryType?: DeliveryType;
  deliverySlot?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  estimatedPreparationTime?: number;
  estimatedDeliveryTime?: number;
  status?: string;
  createdAt: string;
  items?: DeliveryOrderItem[];
  address?: DeliveryAddress;
  paymentMethod?: string;
  grandTotal?: number;
}

export interface DeliveryOrderItem {
  id: string;
  foodNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DeliveryAddress {
  id?: string;
  customerName?: string;
  phoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DeliveryListItem {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryType: DeliveryType;
  provider?: string | null;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  deliveryFee?: number;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDeliveryResponse {
  items: DeliveryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeliveryFilters {
  status?: DeliveryStatus | "all";
  provider?: DeliveryProvider | "all";
  deliveryType?: DeliveryType | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  WAITING_FOR_KITCHEN: "Order preparing",
  WAITING_FOR_PROVIDER: "Order preparing",
  PROVIDER_ASSIGNMENT_FAILED: "Order preparing",
  PROVIDER_ASSIGNED: "Order preparing",
  RIDER_ARRIVING: "Order preparing",
  RIDER_ARRIVED: "Order preparing",
  AWAITING_PICKUP: "Order preparing",
  PICKED_UP: "On the way",
  OUT_FOR_DELIVERY: "On the way",
  NEAR_CUSTOMER: "Rider nearby",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  "WAITING_FOR_KITCHEN",
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
  "PROVIDER_ASSIGNED",
  "RIDER_ARRIVING",
  "RIDER_ARRIVED",
  "AWAITING_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "NEAR_CUSTOMER",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  QUICK: "Quick",
  SCHEDULED: "Scheduled",
};

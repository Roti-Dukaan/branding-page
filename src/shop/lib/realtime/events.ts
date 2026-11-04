export const REALTIME_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PING: "ping",
  PONG: "pong",
  ERROR: "exception",

  KITCHEN_TICKET_CREATED: "kitchen:ticket_created",
  KITCHEN_TICKET_UPDATED: "kitchen:ticket_updated",

  ADMIN_ORDER_CREATED: "admin:order_created",
  ADMIN_ORDER_UPDATED: "admin:order_updated",

  CUSTOMER_ORDER_UPDATED: "customer:order_updated",

  ADMIN_DELIVERY_UPDATED: "admin:delivery_updated",
  CUSTOMER_DELIVERY_UPDATED: "customer:delivery_updated",
  DELIVERY_TRACKING_UPDATED: "delivery:tracking_updated",
  DELIVERY_ETA_UPDATED: "delivery:eta_updated",

  KITCHEN_STATUS_UPDATED: "kitchen:status_updated",

  CUSTOMER_SUPPORT_MESSAGE_UPDATED: "customer:support_message_updated",
} as const;

export interface AdminOrderUpdatedPayload {
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatus?: string;
  occurredAt: string;
}

export interface DeliveryUpdatedPayload {
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  deliveryType: string;
  status: string;
  previousStatus?: string;
  occurredAt: string;
  actorType: string;
  actorId?: string | null;
  remarks?: string | null;
}

export interface DeliveryTrackingUpdatedPayload {
  deliveryId: string;
  orderId: string;
  customerId: string;
  status: string;
  riderName: string | null;
  riderPhone: string | null;
  estimatedDeliveryAt: string | null;
  trackingUrl: string | null;
}

export interface DeliveryEtaUpdatedPayload {
  deliveryId: string;
  orderId: string;
  customerId: string;
  estimatedDeliveryAt: string;
  isDelayed: boolean;
  delayMinutes: number | null;
}

export interface KitchenStatusUpdatedPayload {
  status: "OPEN" | "BUSY" | "CLOSED" | "MAINTENANCE";
  busyDelayMinutes: number;
  message: string | null;
  scheduledReopenAt?: string | null;
  acceptingOrders?: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

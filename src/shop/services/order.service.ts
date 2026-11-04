import { apiClient } from "@shop/lib/api/client";

export interface OrderItem {
  id: string;
  foodNameSnapshot: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderAddress {
  customerName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
  estimatedDeliveryTime?: number;
  metaPurchaseEventId?: string;
  payment?: {
    status?: string;
    grandTotal?: number;
  };
}

export interface OrderList {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export const orderService = {
  async getHistory(page = 1, limit = 10): Promise<OrderList> {
    const { data } = await apiClient.get(`/orders?page=${page}&limit=${limit}`);
    return data.data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/orders/${encodeURIComponent(id)}`);
    return data.data;
  },

  async getByNumber(orderNumber: string): Promise<Order> {
    const { data } = await apiClient.get(`/orders/number/${encodeURIComponent(orderNumber)}`);
    return data.data;
  },

  async cancel(id: string, reason?: string): Promise<Order> {
    const { data } = await apiClient.post(`/orders/${encodeURIComponent(id)}/cancel`, { reason });
    return data.data;
  },
};
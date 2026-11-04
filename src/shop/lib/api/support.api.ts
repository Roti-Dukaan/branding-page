import { apiClient } from './client';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_BRANCH' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ORDER_NOT_RECEIVED' | 'LATE_DELIVERY' | 'WRONG_ITEM' | 'MISSING_ITEM' | 'FOOD_QUALITY' | 'DAMAGED_PACKAGE' | 'PAYMENT' | 'REFUND' | 'SUBSCRIPTION' | 'ACCOUNT' | 'PROMOTION' | 'OTHER';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  orderId?: string;
  branchId?: string;
  assignedToId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  source: string;
  subject: string;
  description: string;
  resolution?: string;
  customerRating?: number;
  customerFeedback?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; phone: string; email?: string };
  order?: { id: string; orderNumber: string; status: string; grandTotal: number };
  branch?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: string;
  senderId?: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface PaginatedSupportTickets {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const supportApi = {
  async createTicket(params: {
    category: TicketCategory;
    subject: string;
    description: string;
    priority?: TicketPriority;
    orderId?: string;
  }): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.post('/support/tickets', params);
    return data;
  },

  async getRecentOrders(limit = 10): Promise<ApiResponse<Array<{
    id: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    branchId: string | null;
    branchName: string | null;
    createdAt: string;
  }>>> {
    const { data } = await apiClient.get('/support/recent-orders', { params: { limit } });
    return data;
  },

  async listTickets(page = 1, limit = 10): Promise<ApiResponse<PaginatedSupportTickets>> {
    const { data } = await apiClient.get('/support/tickets', { params: { page, limit } });
    return data;
  },

  async getTicketDetail(id: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.get(`/support/tickets/${id}`);
    return data;
  },

  async addMessage(ticketId: string, message: string, attachmentUrls?: string[]): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.post(`/support/tickets/${ticketId}/messages`, { message, attachmentUrls });
    return data;
  },

  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.post(`/support/tickets/${ticketId}/rating`, { rating, feedback });
    return data;
  },
};

import { apiClient, getApiErrorMessage, unwrapApiResponse } from '@shop/lib/api/client';



export interface PaymentOrderResponse {

  paymentId: string;

  paymentReference: string;

  amount: number;

  currency: string;

  razorpayOrderId?: string;

  razorpayKeyId?: string;

  status: string;

  orderId?: string;

  orderNumber?: string;

}



export interface PaymentVerifyResponse {

  paymentId: string;

  paymentReference: string;

  status: string;

  paidAt?: string;

  orderId?: string;

  orderNumber?: string;

}



export interface PaymentHistoryItem {

  id: string;

  paymentReference: string;

  amount: number;

  currency: string;

  status: string;

  paymentMethod: string;

  provider: string;

  createdAt: string;

  paidAt?: string;

  checkoutReference?: string;

  subscriptionId?: string;

  subscriptionNumber?: string;

  grandTotal?: number;

  customerName?: string;

  customerPhone?: string;

  orderId?: string;

  orderNumber?: string;

  orderStatus?: string;

  deliverySlot?: string;

  deliveryAddress?: string;

  items?: Array<{

    id: string;

    foodNameSnapshot: string;

    quantity: number;

    lineTotal: number;

  }>;

  razorpayInfo?: {

    orderId: string;

    paymentId: string;

    gateway: string;

    paymentMethod: string;

    bank?: string;

    upiApp?: string;

    cardNetwork?: string;

    maskedCardNumber?: string;

    transactionReference: string;

    webhookStatus: string;

  } | null;

}



export interface PaymentHistoryResponse {

  items: PaymentHistoryItem[];

  total: number;

  page: number;

  limit: number;

}



type PaymentEntityPayload = PaymentVerifyResponse & { id?: string };



function mapVerifyResponse(entity: PaymentEntityPayload): PaymentVerifyResponse {

  return {

    paymentId: entity.paymentId ?? entity.id ?? '',

    paymentReference: entity.paymentReference,

    status: entity.status,

    paidAt: entity.paidAt,

    orderId: entity.orderId,

    orderNumber: entity.orderNumber,

  };

}



export const paymentService = {

  async createOrder(checkoutSessionId: string): Promise<PaymentOrderResponse> {

    try {

      const response = await apiClient.post('/payments/create-order', { checkoutSessionId });

      return unwrapApiResponse<PaymentOrderResponse>(response);

    } catch (error) {

      throw new Error(getApiErrorMessage(error, 'Failed to create payment order'));

    }

  },



  async verifyPayment(dto: {

    checkoutSessionId: string;

    razorpayOrderId: string;

    razorpayPaymentId: string;

    razorpaySignature: string;

  }): Promise<PaymentVerifyResponse> {

    try {

      const response = await apiClient.post('/payments/verify', dto);

      const entity = unwrapApiResponse<PaymentEntityPayload>(

        response,

        'Payment verification returned an invalid response',

      );

      return mapVerifyResponse(entity);

    } catch (error) {

      throw new Error(getApiErrorMessage(error, 'Payment verification failed'));

    }

  },

  async recoverPayment(checkoutSessionId: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await apiClient.post('/payments/recover', { checkoutSessionId });
      const entity = unwrapApiResponse<PaymentEntityPayload>(
        response,
        'Payment recovery returned an invalid response',
      );
      return mapVerifyResponse(entity);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Payment recovery failed'));
    }
  },



  async getHistory(page = 1, limit = 10): Promise<PaymentHistoryResponse> {

    try {

      const response = await apiClient.get(`/payments/history?page=${page}&limit=${limit}`);

      return unwrapApiResponse<PaymentHistoryResponse>(response);

    } catch (error) {

      throw new Error(getApiErrorMessage(error, 'Failed to load payment history'));

    }

  },



  async getById(id: string): Promise<PaymentHistoryItem> {

    try {

      const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);

      return unwrapApiResponse<PaymentHistoryItem>(response);

    } catch (error) {

      throw new Error(getApiErrorMessage(error, 'Failed to load payment details'));

    }

  },

};



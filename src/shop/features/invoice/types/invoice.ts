export interface InvoiceLineItem {
  id: number;
  lineNumber?: number;
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceAddress {
  houseNo: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
}

export interface InvoiceCustomer {
  name: string;
  phone: string;
  email?: string;
  address: InvoiceAddress;
}

export interface InvoiceSummary {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
}

export interface InvoicePayment {
  method: string;
  transactionId: string;
  status: "Paid" | "Pending" | "Failed";
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  date: string;
  time: string;
  paymentStatus: string;
  customer: InvoiceCustomer;
  items: InvoiceLineItem[];
  summary: InvoiceSummary;
  payment: InvoicePayment;
  specialInstructions?: string[];
}

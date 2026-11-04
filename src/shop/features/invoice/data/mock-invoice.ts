import type { InvoiceData } from "../types/invoice";

export const mockInvoiceData: InvoiceData = {
  invoiceNumber: "RDINV-FY2026-27-00001",
  orderId: "RDLIVE-FY2026-27-00001",
  date: "02 Aug 2026",
  time: "07:15 PM",
  paymentStatus: "Paid",
  customer: {
    name: "Sai Krishna",
    phone: "9876543210",
    email: "sai.krishna@example.com",
    address: {
      houseNo: "Flat 302",
      street: "Madhapur",
      area: "HITEC City",
      city: "Hyderabad",
      pincode: "500081",
    },
  },
  items: [
    {
      id: 1,
      name: "Jonna Roti",
      variant: "Regular",
      quantity: 10,
      unitPrice: 20,
      total: 200,
    },
    {
      id: 2,
      name: "Groundnut Chutney",
      variant: "250g",
      quantity: 1,
      unitPrice: 40,
      total: 40,
    },
    {
      id: 3,
      name: "Homemade Ghee",
      variant: "100ml",
      quantity: 1,
      unitPrice: 30,
      total: 30,
    },
  ],
  summary: {
    subtotal: 270,
    deliveryCharge: 30,
    discount: 20,
    couponCode: "WELCOME20",
    grandTotal: 280,
  },
  payment: {
    method: "UPI",
    transactionId: "pay_RD8X2K9M4N7P1Q",
    status: "Paid",
  },
  specialInstructions: ["Less Oil", "Extra Crispy", "No Plastic Bag"],
};

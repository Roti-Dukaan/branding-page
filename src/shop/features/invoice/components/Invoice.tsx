import type { InvoiceData } from "../types/invoice";
import { CustomerInformation } from "./CustomerInformation";
import { InvoiceFooter } from "./InvoiceFooter";
import { InvoiceHeader } from "./InvoiceHeader";
import { OrderSummary } from "./OrderSummary";
import { OrderTable } from "./OrderTable";
import { PaymentCard } from "./PaymentCard";
import { SpecialInstructions } from "./SpecialInstructions";

interface InvoiceProps {
  data: InvoiceData;
  className?: string;
}

export function Invoice({ data, className = "" }: InvoiceProps) {
  return (
    <article
      className={`invoice-paper mx-auto w-full max-w-[800px] rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/60 sm:p-10 ${className}`}
      aria-label={`Invoice ${data.invoiceNumber}`}
    >
      <InvoiceHeader
        invoiceNumber={data.invoiceNumber}
        orderId={data.orderId}
        date={data.date}
        time={data.time}
        paymentStatus={data.paymentStatus}
      />

      <CustomerInformation customer={data.customer} />

      <OrderTable items={data.items} />

      <OrderSummary summary={data.summary} />

      <PaymentCard payment={data.payment} />

      <SpecialInstructions instructions={data.specialInstructions} />

      <InvoiceFooter />
    </article>
  );
}

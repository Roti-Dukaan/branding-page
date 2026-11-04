import type { InvoiceCustomer } from "../types/invoice";

const BRAND_PRIMARY = "#C96A2B";

interface CustomerInformationProps {
  customer: InvoiceCustomer;
}

export function CustomerInformation({ customer }: CustomerInformationProps) {
  const { address } = customer;

  return (
    <section className="grid gap-6 border-b border-gray-200 py-6 sm:grid-cols-2">
      <div>
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: BRAND_PRIMARY }}
        >
          Bill To
        </h2>
        <div className="space-y-1 text-sm text-gray-700">
          <p className="text-base font-semibold text-gray-900">{customer.name}</p>
          <p>{customer.phone}</p>
          {customer.email ? <p className="text-gray-500">{customer.email}</p> : null}
        </div>
      </div>

      <div>
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: BRAND_PRIMARY }}
        >
          Delivery Address
        </h2>
        <address className="space-y-0.5 text-sm not-italic leading-relaxed text-gray-700">
          <p>{address.houseNo}</p>
          <p>{address.street}</p>
          <p>{address.area}</p>
          <p>
            {address.city} – {address.pincode}
          </p>
        </address>
      </div>
    </section>
  );
}

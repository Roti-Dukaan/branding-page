import Image from "next/image";

const BRAND_PRIMARY = "#C96A2B";
const BRAND_SECONDARY = "#5B3A29";

interface InvoiceHeaderProps {
  invoiceNumber: string;
  orderId: string;
  date: string;
  time: string;
  paymentStatus: string;
}

export function InvoiceHeader({
  invoiceNumber,
  orderId,
  date,
  time,
  paymentStatus,
}: InvoiceHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
          aria-hidden
        >
          <Image
            src="/roti_dukaan_logo.png"
            alt="Roti Dukaan"
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p
            className="text-xl font-bold tracking-wide sm:text-2xl"
            style={{ color: BRAND_SECONDARY }}
          >
            ROTI DUKAAN
          </p>
          <p className="mt-1 text-sm text-gray-500">Fresh • Healthy • Homemade Rotis</p>
        </div>
      </div>

      <div className="text-left sm:text-right">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: BRAND_PRIMARY }}
        >
          Invoice
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:items-end">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Invoice Number
            </dt>
            <dd className="font-semibold text-gray-800">{invoiceNumber}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-end">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Order ID</dt>
            <dd className="font-medium text-gray-700">{orderId}</dd>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Date</dt>
              <dd className="font-medium text-gray-700">{date}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Time</dt>
              <dd className="font-medium text-gray-700">{time}</dd>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-end">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Status
            </dt>
            <dd>
              <span
                className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `${BRAND_PRIMARY}18`,
                  color: BRAND_PRIMARY,
                }}
              >
                {paymentStatus}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

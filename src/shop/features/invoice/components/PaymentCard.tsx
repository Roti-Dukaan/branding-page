import type { InvoicePayment } from "../types/invoice";

const BRAND_PRIMARY = "#C96A2B";

interface PaymentCardProps {
  payment: InvoicePayment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const statusStyles =
    payment.status === "Paid"
      ? { bg: `${BRAND_PRIMARY}18`, color: BRAND_PRIMARY }
      : payment.status === "Pending"
        ? { bg: "#FEF3C718", color: "#B45309" }
        : { bg: "#FEE2E218", color: "#DC2626" };

  return (
    <section className="py-4">
      <h2
        className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: BRAND_PRIMARY }}
      >
        Payment Details
      </h2>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{payment.method}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Transaction ID
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-gray-700">
              {payment.transactionId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Status
            </dt>
            <dd className="mt-1">
              <span
                className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: statusStyles.bg,
                  color: statusStyles.color,
                }}
              >
                {payment.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

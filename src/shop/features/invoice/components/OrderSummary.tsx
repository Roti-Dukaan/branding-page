import { formatPrice } from "@shop/lib/utils";
import type { InvoiceSummary } from "../types/invoice";

const BRAND_PRIMARY = "#C96A2B";
const BRAND_SECONDARY = "#5B3A29";

interface OrderSummaryProps {
  summary: InvoiceSummary;
}

export function OrderSummary({ summary }: OrderSummaryProps) {
  const rows = [
    { label: "Subtotal", value: formatPrice(summary.subtotal), highlight: false },
    {
      label: "Delivery Charge",
      value: formatPrice(summary.deliveryCharge),
      highlight: false,
    },
    ...(summary.discount > 0
      ? [
          {
            label: summary.couponCode ? `Discount (${summary.couponCode})` : "Discount",
            value: `−${formatPrice(summary.discount)}`,
            highlight: false,
            accent: true,
          },
        ]
      : []),
  ];

  return (
    <section className="flex justify-end py-2">
      <div className="w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50/50 p-5">
        <dl className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-600">{row.label}</dt>
              <dd
                className={`font-medium ${"accent" in row && row.accent ? "text-emerald-600" : "text-gray-800"}`}
              >
                {row.value}
              </dd>
            </div>
          ))}

          <div
            className="mt-4 flex items-center justify-between gap-4 border-t border-gray-200 pt-4"
            style={{ borderColor: `${BRAND_PRIMARY}30` }}
          >
            <dt className="text-sm font-semibold text-gray-700">Grand Total</dt>
            <dd className="text-2xl font-bold" style={{ color: BRAND_SECONDARY }}>
              {formatPrice(summary.grandTotal)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

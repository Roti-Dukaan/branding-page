import { formatPrice } from "@shop/lib/utils";
import type { InvoiceLineItem } from "../types/invoice";

const BRAND_PRIMARY = "#C96A2B";

interface OrderTableProps {
  items: InvoiceLineItem[];
}

export function OrderTable({ items }: OrderTableProps) {
  return (
    <section className="py-6">
      <h2
        className="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: BRAND_PRIMARY }}
      >
        Order Details
      </h2>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="invoice-table w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                #
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Item
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">
                Variant
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 1 ? "bg-gray-50/80" : "bg-white"}
              >
                <td className="border-t border-gray-100 px-4 py-3 text-gray-500">{item.id}</td>
                <td className="border-t border-gray-100 px-4 py-3 font-medium text-gray-900">
                  {item.name}
                  <span className="mt-0.5 block text-xs font-normal text-gray-500 sm:hidden">
                    {item.variant}
                  </span>
                </td>
                <td className="hidden border-t border-gray-100 px-4 py-3 text-gray-600 sm:table-cell">
                  {item.variant}
                </td>
                <td className="border-t border-gray-100 px-4 py-3 text-right text-gray-700">
                  {item.quantity}
                </td>
                <td className="border-t border-gray-100 px-4 py-3 text-right text-gray-700">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="border-t border-gray-100 px-4 py-3 text-right font-semibold text-gray-900">
                  {formatPrice(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

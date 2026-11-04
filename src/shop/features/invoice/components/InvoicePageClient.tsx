"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Invoice, InvoicePrintButton } from "@shop/features/invoice";
import { mapInvoiceDetailToInvoiceData } from "@shop/features/invoice/utils/map-invoice-detail";
import { useInvoiceActions } from "@shop/features/invoice/hooks/useInvoiceActions";
import { invoiceApi } from "@shop/features/orders/services/invoice.api";
import type { InvoiceDetail } from "@shop/features/orders/services/invoice.api";
import "@shop/features/invoice/styles/invoice-print.css";

interface InvoicePageClientProps {
  orderId: string;
}

export function InvoicePageClient({ orderId }: InvoicePageClientProps) {
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { downloadInvoice, loading: actionLoading } = useInvoiceActions(orderId);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let view = await invoiceApi.getByOrder(orderId);
        if (!view.detail && view.state === "PENDING") {
          view = await invoiceApi.generate(orderId);
        }
        if (!cancelled) {
          if (view.detail) setDetail(view.detail);
          else if (view.state === "FAILED") setError("Invoice generation failed. Please contact support.");
          else setError("Invoice is being prepared. Please refresh in a moment.");
        }
      } catch {
        if (!cancelled) setError("Could not load invoice. You may not have access to this order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="invoice-page-shell flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C96A2B]" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="invoice-page-shell mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-600">{error ?? "Invoice not available"}</p>
        <Link href={`/orders/${orderId}/tracking`} className="mt-4 inline-block text-[#C96A2B] font-semibold">
          Back to order
        </Link>
      </div>
    );
  }

  const data = mapInvoiceDetailToInvoiceData(detail);

  return (
    <div className="invoice-page-shell min-h-screen bg-gray-100/80 px-4 py-8 sm:px-6 sm:py-12">
      <div className="no-print mx-auto mb-6 flex max-w-[800px] flex-wrap items-center justify-between gap-3">
        <Link href={`/orders/${orderId}/tracking`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Back to order
        </Link>
        <div className="flex flex-wrap gap-2">
          <InvoicePrintButton />
          <button
            type="button"
            onClick={() => void downloadInvoice()}
            disabled={actionLoading}
            className="rounded-xl border border-[#C96A2B] px-4 py-2 text-sm font-semibold text-[#C96A2B] hover:bg-[#C96A2B]/5 disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>
      </div>

      <Invoice data={data} />
    </div>
  );
}

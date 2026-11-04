"use client";

import { Download } from "lucide-react";
import { useInvoiceActions } from "@shop/features/invoice/hooks/useInvoiceActions";

interface OrderInvoiceActionsProps {
  orderId: string;
  compact?: boolean;
}

export function OrderInvoiceActions({ orderId, compact = false }: OrderInvoiceActionsProps) {
  const { downloadInvoice, loading } = useInvoiceActions(orderId);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void downloadInvoice()}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-foreground/70 disabled:opacity-50"
      >
        <Download className="size-3" />
        {loading ? "Preparing…" : "Download Invoice"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void downloadInvoice()}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-[#C96A2B] px-4 py-2 text-sm font-semibold text-[#C96A2B] hover:bg-[#C96A2B]/5 disabled:opacity-50"
    >
      <Download className="size-4" />
      {loading ? "Preparing PDF…" : "Download Invoice"}
    </button>
  );
}

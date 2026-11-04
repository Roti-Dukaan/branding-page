"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { usePaymentInvoiceActions } from "@shop/features/invoice/hooks/usePaymentInvoiceActions";

interface PaymentInvoiceActionsProps {
  paymentId: string;
  compact?: boolean;
}

export function PaymentInvoiceActions({ paymentId, compact = false }: PaymentInvoiceActionsProps) {
  const { downloadInvoice, loading } = usePaymentInvoiceActions(paymentId);

  return (
    <Button
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      onClick={() => void downloadInvoice()}
      disabled={loading}
      className={compact ? "h-8 gap-1.5 text-xs" : "gap-2"}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      Download Invoice
    </Button>
  );
}

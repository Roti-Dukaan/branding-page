"use client";

import { useCallback, useState } from "react";
import { toast } from "@shop/lib/toast";
import { invoiceApi } from "@shop/features/orders/services/invoice.api";
import { getApiErrorMessage } from "@shop/lib/api/client";

function saveBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function usePaymentInvoiceActions(paymentId: string) {
  const [loading, setLoading] = useState(false);

  const downloadInvoice = useCallback(async () => {
    setLoading(true);
    try {
      let view = await invoiceApi.getByPayment(paymentId);
      if (!view.invoice || view.state === "PENDING" || view.state === "FAILED") {
        view = await invoiceApi.generateForPayment(paymentId);
      }
      if (view.state === "FAILED") {
        toast.error("Invoice could not be generated. Please contact support.");
        return;
      }

      const { blob, fileName } = await invoiceApi.downloadPdfByPayment(paymentId);
      saveBlob(blob, fileName);
      toast.success("Invoice downloaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not download invoice. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  return { downloadInvoice, loading };
}

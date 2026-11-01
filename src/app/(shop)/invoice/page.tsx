import { Invoice, InvoicePrintButton, mockInvoiceData } from "@shop/features/invoice";
import { createPageMetadata } from "@shop/lib/seo";
import "@shop/features/invoice/styles/invoice-print.css";

export const metadata = createPageMetadata({
  title: "Invoice Preview",
  description: "Roti Dukaan order invoice preview",
  path: "/invoice",
  noIndex: true,
});

export default function InvoicePreviewPage() {
  return (
    <div className="invoice-page-shell min-h-screen bg-gray-100/80 px-4 py-8 sm:px-6 sm:py-12">
      <div className="no-print mx-auto mb-6 flex max-w-[800px] items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Invoice Preview</h1>
          <p className="text-sm text-gray-500">UI mock — A4 portrait, print-ready</p>
        </div>
        <InvoicePrintButton />
      </div>

      <Invoice data={mockInvoiceData} />
    </div>
  );
}

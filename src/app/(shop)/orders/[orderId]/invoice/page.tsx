import { InvoicePageClient } from "@shop/features/invoice/components/InvoicePageClient";
import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Invoice",
  description: "View your Roti Dukaan order invoice.",
  path: "/orders",
  noIndex: true,
});

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <InvoicePageClient orderId={orderId} />;
}

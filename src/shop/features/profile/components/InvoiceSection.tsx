import { OrderInvoiceActions } from "@shop/features/invoice/components/OrderInvoiceActions";
import { Card, CardContent } from "@shop/components/ui/card";

/** @deprecated Use OrderInvoiceActions directly. */
export function InvoiceSection({ orderId }: { orderId: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Invoice</h3>
        <OrderInvoiceActions orderId={orderId} />
      </CardContent>
    </Card>
  );
}

import { OrderSuccessClient } from "@shop/features/orders/components/OrderSuccessClient";
import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Order Confirmed",
  description: "Your Roti Dukaan order has been confirmed.",
  path: "/orders",
  noIndex: true,
});

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderSuccessClient orderId={orderId} />;
}

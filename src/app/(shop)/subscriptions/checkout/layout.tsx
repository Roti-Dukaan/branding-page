import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Subscription Checkout",
  description: "Subscribe to Roti Dukaan meal plans.",
  path: "/subscriptions/checkout",
  noIndex: true,
});

export default function SubscriptionsCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

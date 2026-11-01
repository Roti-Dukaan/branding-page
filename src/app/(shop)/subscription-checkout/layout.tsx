import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Subscription Checkout",
  description: "Subscribe to Roti Dukaan meal plans.",
  path: "/subscription-checkout",
  noIndex: true,
});

export default function SubscriptionCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

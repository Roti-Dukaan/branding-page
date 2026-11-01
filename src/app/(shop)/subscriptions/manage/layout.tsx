import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Manage Subscription",
  description: "Manage your Roti Dukaan meal subscription.",
  path: "/subscriptions/manage",
  noIndex: true,
});

export default function SubscriptionsManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Orders",
  description: "View your Roti Dukaan order history and tracking.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

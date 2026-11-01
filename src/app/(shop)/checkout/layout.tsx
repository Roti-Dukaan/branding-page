import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Checkout",
  description: "Complete your Roti Dukaan order.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

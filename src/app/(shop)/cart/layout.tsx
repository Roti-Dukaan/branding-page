import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Cart",
  description: "Your Roti Dukaan cart.",
  path: "/cart",
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

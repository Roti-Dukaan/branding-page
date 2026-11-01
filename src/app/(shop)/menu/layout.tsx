import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "Menu",
  description:
    "Browse Roti Dukaan's full menu of fresh homemade rotis, curries, rice, and wholesome meals. Order online for delivery in Hyderabad.",
  path: "/menu",
});

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { createPageMetadata } from "@shop/lib/seo";

export const metadata = createPageMetadata({
  title: "My Account",
  description: "Manage your Roti Dukaan profile, orders, and addresses.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

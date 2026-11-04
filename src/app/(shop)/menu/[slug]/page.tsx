import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareLanding } from "@/components/ShareLanding";
import { fetchMenuItemBySlug } from "@/lib/api";
import { appMenuDeepLink, menuAppPath } from "@/lib/share-links";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchMenuItemBySlug(slug);
  if (!item) return { title: "Menu item | Roti Dukaan" };
  return {
    title: `${item.name} | Roti Dukaan`,
    description:
      item.shortDescription ||
      `Order ${item.name} in the Roti Dukaan app — fresh home-style meals in Hyderabad.`,
    alternates: { canonical: appMenuDeepLink(slug) },
  };
}

export default async function MenuItemSharePage({ params }: Props) {
  const { slug } = await params;
  const item = await fetchMenuItemBySlug(slug);
  if (!item) notFound();

  const price = item.displayPrice ?? item.price;
  const priceLabel =
    price != null && Number.isFinite(Number(price)) ? `₹${Math.round(Number(price))}` : null;

  return (
    <ShareLanding
      title={item.name}
      subtitle={item.shortDescription}
      imageUrl={item.imageUrl}
      priceLabel={priceLabel}
      isVeg={item.isVeg}
      appPath={menuAppPath(slug)}
      webContinueHref={`/menu/${encodeURIComponent(slug)}/view`}
    />
  );
}

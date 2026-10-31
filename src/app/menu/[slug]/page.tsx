import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareLanding } from "@/components/ShareLanding";
import { fetchMenuItemBySlug } from "@/lib/api";
import { appMenuDeepLink } from "@/lib/share-links";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchMenuItemBySlug(slug);
  if (!item) return { title: "Item not found | Roti Dukaan" };

  const description =
    item.shortDescription?.trim() ||
    `Order ${item.name} on Roti Dukaan — fresh homemade meals delivered.`;

  return {
    title: `${item.name} | Roti Dukaan`,
    description,
    openGraph: {
      title: item.name,
      description,
      images: item.imageUrl ? [{ url: item.imageUrl }] : undefined,
    },
  };
}

export default async function MenuSharePage({ params }: Props) {
  const { slug } = await params;
  const item = await fetchMenuItemBySlug(slug);
  if (!item) notFound();

  const price =
    item.displayPrice != null
      ? Math.round(Number(item.displayPrice))
      : item.price != null
        ? Math.round(Number(item.price))
        : null;

  return (
    <ShareLanding
      title={item.name}
      subtitle={item.shortDescription}
      imageUrl={item.imageUrl}
      priceLabel={price != null ? `₹${price}` : null}
      isVeg={item.isVeg}
      openInAppHref={appMenuDeepLink(item.slug)}
    />
  );
}

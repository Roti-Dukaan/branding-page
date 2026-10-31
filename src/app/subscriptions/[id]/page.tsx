import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareLanding } from "@/components/ShareLanding";
import { fetchSubscriptionPackageById } from "@/lib/api";
import { appSubscriptionDeepLink } from "@/lib/share-links";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pkg = await fetchSubscriptionPackageById(id);
  if (!pkg) return { title: "Plan not found | Roti Dukaan" };

  const description =
    pkg.description?.trim() ||
    `Subscribe to ${pkg.name} on Roti Dukaan — meal plans delivered fresh.`;

  return {
    title: `${pkg.name} | Roti Dukaan`,
    description,
    openGraph: {
      title: pkg.name,
      description,
      images: pkg.imageUrl ? [{ url: pkg.imageUrl }] : undefined,
    },
  };
}

export default async function SubscriptionSharePage({ params }: Props) {
  const { id } = await params;
  const pkg = await fetchSubscriptionPackageById(id);
  if (!pkg) notFound();

  return (
    <ShareLanding
      title={pkg.name}
      subtitle={pkg.description}
      imageUrl={pkg.imageUrl}
      openInAppHref={appSubscriptionDeepLink(pkg.id)}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareLanding } from "@/components/ShareLanding";
import { fetchSubscriptionPackageById } from "@/lib/api";
import { subscriptionAppPath } from "@/lib/share-links";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pkg = await fetchSubscriptionPackageById(id);
  if (!pkg) return { title: "Subscription plan | Roti Dukaan" };
  return {
    title: `${pkg.name} | Roti Dukaan`,
    description:
      pkg.description ||
      `Subscribe to ${pkg.name} in the Roti Dukaan app — fresh meal plans delivered in Hyderabad.`,
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
      appPath={subscriptionAppPath(id)}
      webContinueHref={`/subscriptions/${encodeURIComponent(id)}/view`}
    />
  );
}

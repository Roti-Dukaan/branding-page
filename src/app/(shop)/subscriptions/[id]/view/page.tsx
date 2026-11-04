"use client";

import { useParams } from "next/navigation";
import { PackageDetailPage } from "@shop/features/subscriptions/components/PackageDetailPage";

export default function SubscriptionPackageWebPage() {
  const params = useParams();
  return <PackageDetailPage packageId={String(params.id)} />;
}

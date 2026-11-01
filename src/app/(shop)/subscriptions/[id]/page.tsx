"use client";

import { useParams } from "next/navigation";
import { PackageDetailPage } from "@shop/features/subscriptions/components/PackageDetailPage";

export default function SubscriptionPackagePage() {
  const params = useParams();
  return <PackageDetailPage packageId={String(params.id)} />;
}

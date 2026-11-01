import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PageShell } from "@/components/PageShell";
import { SHIPPING_DELIVERY_POLICY } from "@/lib/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: `${SHIPPING_DELIVERY_POLICY.title} | Roti Dukaan`,
  description: SHIPPING_DELIVERY_POLICY.description,
  alternates: { canonical: `${siteUrl}/shipping-delivery-policy` },
};

export default function ShippingDeliveryPolicyRoute() {
  return (
    <PageShell>
      <LegalPage {...SHIPPING_DELIVERY_POLICY} />
    </PageShell>
  );
}

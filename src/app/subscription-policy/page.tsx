import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PageShell } from "@/components/PageShell";
import { SUBSCRIPTION_POLICY } from "@/lib/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: `${SUBSCRIPTION_POLICY.title} | Roti Dukaan`,
  description: SUBSCRIPTION_POLICY.description,
  alternates: { canonical: `${siteUrl}/subscription-policy` },
};

export default function SubscriptionPolicyRoute() {
  return (
    <PageShell>
      <LegalPage {...SUBSCRIPTION_POLICY} />
    </PageShell>
  );
}

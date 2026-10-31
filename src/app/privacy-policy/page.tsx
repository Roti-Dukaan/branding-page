import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PageShell } from "@/components/PageShell";
import { PRIVACY_POLICY } from "@/lib/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: `${PRIVACY_POLICY.title} | Roti Dukaan`,
  description: PRIVACY_POLICY.description,
  alternates: { canonical: `${siteUrl}/privacy-policy` },
};

export default function PrivacyPolicyRoute() {
  return (
    <PageShell>
      <LegalPage {...PRIVACY_POLICY} />
    </PageShell>
  );
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PageShell } from "@/components/PageShell";
import { CANCELLATION_REFUND_POLICY } from "@/lib/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: `${CANCELLATION_REFUND_POLICY.title} | Roti Dukaan`,
  description: CANCELLATION_REFUND_POLICY.description,
  alternates: { canonical: `${siteUrl}/cancellation-refund-policy` },
};

export default function CancellationRefundPolicyRoute() {
  return (
    <PageShell>
      <LegalPage {...CANCELLATION_REFUND_POLICY} />
    </PageShell>
  );
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PageShell } from "@/components/PageShell";
import { TERMS_AND_CONDITIONS } from "@/lib/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: `${TERMS_AND_CONDITIONS.title} | Roti Dukaan`,
  description: TERMS_AND_CONDITIONS.description,
  alternates: { canonical: `${siteUrl}/terms-and-conditions` },
};

export default function TermsAndConditionsRoute() {
  return (
    <PageShell>
      <LegalPage {...TERMS_AND_CONDITIONS} />
    </PageShell>
  );
}

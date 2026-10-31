import type { Metadata } from "next";
import { ContactPageContent } from "@/components/ContactPageContent";
import { PageShell } from "@/components/PageShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.rotidukaan.com";

export const metadata: Metadata = {
  title: "Contact Us | Roti Dukaan",
  description:
    "Get in touch with Roti Dukaan. Have questions about our food or orders? We're here to help.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactRoute() {
  return (
    <PageShell>
      <ContactPageContent />
    </PageShell>
  );
}

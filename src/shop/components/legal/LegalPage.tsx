import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LegalDocument } from "@shop/lib/legal-content";

type LegalPageProps = LegalDocument;

export function LegalPage({ title, description, effectiveDate, intro, sections }: LegalPageProps) {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{title}</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>
          {effectiveDate && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Effective Date: {effectiveDate}
            </p>
          )}
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {intro && intro.length > 0 && (
          <div className="mb-8 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { LegalDocument } from "@/lib/legal-content";
import { Eyebrow } from "./ui";

type LegalPageProps = LegalDocument;

export function LegalPage({ title, description, effectiveDate, intro, sections }: LegalPageProps) {
  return (
    <main className="bg-cream pb-16">
      <div className="border-b border-sand/60 bg-leaf-soft/40">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-bark/70">
            <Link href="/" className="font-medium transition hover:text-leaf">
              Home
            </Link>
            <span aria-hidden className="text-bark/40">
              /
            </span>
            <span className="font-medium text-bark">{title}</span>
          </nav>
          <Eyebrow align="left">Legal</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-bark sm:text-4xl">
            {title}
          </h1>
          {effectiveDate ? (
            <p className="mt-2 text-sm font-semibold text-bark/60">
              Effective date: {effectiveDate}
            </p>
          ) : null}
          <p className="mt-3 text-base leading-relaxed text-bark/80">{description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="rounded-3xl border border-sand/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,37,18,0.06)] sm:p-10">
          {intro && intro.length > 0 ? (
            <div className="mb-8 space-y-3 text-sm leading-relaxed text-bark/85">
              {intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-xl font-bold text-leaf">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-bark/85">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

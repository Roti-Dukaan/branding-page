"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/faqs-content";

type Props = {
  title?: string;
  items: FaqItem[];
  className?: string;
};

export function BrandingFaqSection({
  title = "Frequently asked questions",
  items,
  className = "",
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section
      className={`rounded-3xl border border-sand/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,37,18,0.06)] sm:p-8 ${className}`}
    >
      <h3 className="font-display text-xl font-bold text-bark">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((faq, index) => (
          <div key={faq.question} className="overflow-hidden rounded-2xl border border-sand/70">
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold text-bark transition hover:bg-cream/80"
              aria-expanded={openFaq === index}
            >
              {faq.question}
              <span
                className={`shrink-0 text-leaf transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {openFaq === index ? (
              <div className="border-t border-sand/60 px-4 pb-4 pt-2 text-sm leading-relaxed text-bark/80">
                {faq.answer}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

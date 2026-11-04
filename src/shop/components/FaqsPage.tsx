"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { FAQ_CATEGORIES } from "@shop/lib/faqs-content";

export default function FaqsPage() {
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">FAQs</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-muted-foreground">
            Quick answers about ordering, delivery, payments, and subscriptions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {FAQ_CATEGORIES.map((category, categoryIndex) => (
            <Card key={category.title} className="border-border">
              <CardContent className="p-6">
                <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                  {categoryIndex + 1}. {category.title}
                </h2>
                <div className="space-y-3">
                  {category.items.map((faq, itemIndex) => {
                    const key = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openKey === key;

                    return (
                      <div key={key} className="overflow-hidden rounded-xl border border-border">
                        <button
                          type="button"
                          onClick={() => setOpenKey(isOpen ? null : key)}
                          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                        >
                          <span className="pr-4 text-sm font-semibold text-foreground">
                            Q. {faq.question}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-border px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Still need help?{" "}
          <Link href="/help" className="font-medium text-primary hover:underline">
            Visit our Help Center
          </Link>
        </p>
      </div>
    </div>
  );
}

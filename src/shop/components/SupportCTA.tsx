"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";

export default function SupportCTA() {
  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <LifeBuoy className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Need Help?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Our support team is here to assist you with orders, meals, and
            any other questions you may have.
          </p>
          <Link
            href="/profile?tab=support"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <LifeBuoy className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}

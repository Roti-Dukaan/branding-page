import Image from "next/image";
import Link from "next/link";
import { storeLinks } from "@/lib/site";

/** Shown where we only want a short CTA (e.g. legacy embeds). Main /subscriptions is full checkout. */
export function SubscriptionsAppBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-sand/80 bg-cream-deep/50 px-5 py-10 sm:px-10 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-leaf">
          Meal subscriptions
        </p>
        <h1 className="font-display text-2xl font-bold leading-tight text-bark sm:text-3xl">
          Subscribe on the website
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-bark/80 sm:text-base">
          Pick a plan and checkout here. Pause, skip, change plan, and daily menu selection are in
          the Roti Dukaan app.
        </p>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 font-display text-sm font-semibold text-cream shadow-[0_4px_12px_-6px_rgba(31,90,46,0.55)] transition hover:bg-leaf-dark"
        >
          View subscription plans
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={storeLinks.playStore}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:-translate-y-0.5"
            aria-label="Get it on Google Play"
          >
            <Image
              src="/images/googleplay_badge.png"
              alt=""
              width={195}
              height={75}
              className="h-11 w-auto sm:h-12"
            />
          </a>
          <a
            href={storeLinks.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:-translate-y-0.5"
            aria-label="Download on the App Store"
          >
            <Image
              src="/images/appstore_badge.png"
              alt=""
              width={195}
              height={75}
              className="h-11 w-auto sm:h-12"
            />
          </a>
        </div>
        <p className="text-xs text-bark/60">Manage an active plan in the app</p>
      </div>
    </section>
  );
}

import Image from "next/image";
import { storeLinks } from "@/lib/site";

export function SubscriptionsAppBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-sand/80 bg-cream-deep/50 px-5 py-10 sm:px-10 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-leaf">
          Subscriptions on mobile
        </p>
        <h1 className="font-display text-2xl font-bold leading-tight text-bark sm:text-3xl">
          Please download our mobile app
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-bark/80 sm:text-base">
          Subscribe, pick your daily meals, pause or skip deliveries, and manage your plan — all in
          the Roti Dukaan app.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
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
              className="h-12 w-auto sm:h-14"
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
              width={190}
              height={75}
              className="h-12 w-auto sm:h-14"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

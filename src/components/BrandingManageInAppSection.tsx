import Image from "next/image";
import { storeLinks } from "@/lib/site";

type Props = {
  title?: string;
  description?: string;
};

export function BrandingManageInAppSection({
  title = "Already subscribed?",
  description = "Pause, skip meals, change plans, and pick daily menus in the Roti Dukaan mobile app. New plans can be purchased here on the website anytime.",
}: Props) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-sand/80 bg-white/80 px-5 py-10 shadow-[0_20px_40px_-32px_rgba(74,37,18,0.35)] sm:px-10 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-leaf">
          Mobile app
        </p>
        <h2 className="font-display text-2xl font-bold leading-tight text-bark sm:text-3xl">{title}</h2>
        <p className="max-w-xl text-sm leading-relaxed text-bark/80 sm:text-base">{description}</p>
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
        <p className="text-xs text-bark/60">
          You can still take a new subscription on the website — management stays in the app.
        </p>
      </div>
    </section>
  );
}

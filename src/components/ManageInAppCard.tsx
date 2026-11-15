import Image from "next/image";
import { storeLinks } from "@/lib/site";
import { cn } from "@shop/lib/utils";

export type ManageInAppCardProps = {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function ManageInAppCard({
  title = "Already subscribed?",
  description = "Pause, skip meals, change plans, and pick daily menus in the Roti Dukaan mobile app. New plans can be purchased here on the website anytime.",
  className,
  compact = false,
}: ManageInAppCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-sand/80 bg-white/80 shadow-[0_20px_40px_-32px_rgba(74,37,18,0.35)]",
        compact ? "px-4 py-8 sm:px-6" : "px-5 py-10 sm:px-10 sm:py-12",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-3xl flex-col items-center text-center",
          compact ? "gap-3" : "gap-4",
        )}
      >
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-leaf">
          Mobile app
        </p>
        <h2
          className={cn(
            "font-display font-bold leading-tight text-bark",
            compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "max-w-xl leading-relaxed text-bark/80",
            compact ? "text-sm" : "text-sm sm:text-base",
          )}
        >
          {description}
        </p>
        <div className={cn("flex flex-wrap items-center justify-center gap-3", compact ? "mt-0" : "mt-2")}>
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
    </div>
  );
}

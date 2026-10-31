import Image from "next/image";
import Link from "next/link";
import { playStoreUrl } from "@/lib/share-links";
import { storeLinks } from "@/lib/site";

type ShareLandingProps = {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  priceLabel?: string | null;
  openInAppHref: string;
  isVeg?: boolean;
};

export function ShareLanding({
  title,
  subtitle,
  imageUrl,
  priceLabel,
  openInAppHref,
  isVeg,
}: ShareLandingProps) {
  const playStore = playStoreUrl();

  return (
    <main className="min-h-screen bg-cream text-bark">
      <header className="border-b border-sand/80 bg-cream/95 px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-leaf">
          <Image src="/images/logo.png" alt="" width={36} height={36} className="rounded-lg" />
          Roti Dukaan
        </Link>
      </header>

      <div className="mx-auto flex max-w-lg flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_12px_40px_rgba(74,37,18,0.08)]">
          <div className="relative aspect-[4/3] bg-cream-deep">
            {imageUrl ? (
              <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width:512px) 100vw, 512px" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-bark/50">Roti Dukaan</div>
            )}
            {isVeg != null && (
              <span
                className={`absolute left-3 top-3 rounded-md border-2 bg-white px-1 py-0.5 text-[10px] font-bold ${
                  isVeg ? "border-green-600 text-green-700" : "border-red-600 text-red-700"
                }`}
              >
                {isVeg ? "VEG" : "NON-VEG"}
              </span>
            )}
          </div>
          <div className="space-y-3 p-6">
            <h1 className="font-display text-2xl font-bold leading-tight text-leaf">{title}</h1>
            {subtitle ? <p className="text-sm leading-relaxed text-bark/80">{subtitle}</p> : null}
            {priceLabel ? <p className="font-display text-xl font-bold text-bark">{priceLabel}</p> : null}
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-sm text-bark/75">
            Order this in the Roti Dukaan app — fresh home-style meals delivered in Hyderabad.
          </p>
          <a
            href={openInAppHref}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-leaf px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:bg-leaf-dark"
          >
            Open in app
          </a>
          <a
            href={playStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-leaf/30 bg-white px-6 py-3.5 font-semibold text-leaf transition hover:border-leaf"
          >
            Get the app on Google Play
          </a>
          {storeLinks.appStore !== "#download" ? (
            <a href={storeLinks.appStore} className="text-sm font-medium text-leaf underline underline-offset-2">
              App Store
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}

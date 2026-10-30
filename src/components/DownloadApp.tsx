import Image from "next/image";
import { storeLinks } from "@/lib/site";
import { Eyebrow } from "./ui";

export function DownloadApp() {
  return (
    <section id="download" className="relative overflow-hidden pt-16 sm:pt-20">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-leaf px-6 py-12 text-cream sm:px-12 lg:px-16 lg:py-14">
          <Image
            src="/images/leaves_cluster_2.png"
            alt=""
            width={145}
            height={152}
            className="pointer-events-none absolute -bottom-6 -left-6 w-28 opacity-70 sm:w-36"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <Eyebrow tone="light" align="left">
                Fresher days start here
              </Eyebrow>
              <h2 className="font-display text-3xl leading-tight font-bold sm:text-4xl lg:text-[2.75rem]">
                Download the Roti Dukaan App
              </h2>
              <p className="max-w-md text-lg text-cream/85">
                Order fresh rotis and home-style meals in seconds, track your delivery live and
                unlock app-only offers.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
                    className="h-14 w-auto"
                  />
                </a>
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
                    className="h-14 w-auto"
                  />
                </a>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div
                className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#f6c04a_0%,rgba(240,161,40,0.55)_42%,transparent_70%)] sm:h-80 sm:w-80"
                aria-hidden
              />
              <div className="relative w-52 sm:w-60 lg:w-64">
                <Image
                  src="/images/phone_mockup.png"
                  alt="The Roti Dukaan app on a phone"
                  width={185}
                  height={188}
                  className="animate-float relative w-full drop-shadow-[0_24px_24px_rgba(0,0,0,0.35)]"
                />
                <Image
                  src="/images/floating_leaves.png"
                  alt=""
                  width={155}
                  height={145}
                  className="absolute -top-6 -right-10 w-20 rotate-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-10" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-[14%] bg-soil" />
        <Image
          src="/images/bottom_wave_background.png"
          alt=""
          width={695}
          height={178}
          sizes="(min-width: 1280px) 80rem, 100vw"
          className="relative mx-auto w-full max-w-7xl"
        />
      </div>
    </section>
  );
}

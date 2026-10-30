import Image from "next/image";
import { PillButton, SectionTitle } from "./ui";

export function MadeWithCare() {
  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-28">
      <Image
        src="/images/leaves_cluster_2.png"
        alt=""
        width={145}
        height={152}
        className="pointer-events-none absolute top-10 -left-8 w-24 rotate-[18deg] opacity-80 sm:w-32"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <SectionTitle
            eyebrow="Real food, brighter days"
            title={
              <>
                Made with Care,
                <br className="hidden sm:block" /> Just for You
              </>
            }
            align="left"
          />
          <p className="max-w-lg text-lg leading-relaxed text-bark/80">
            At Roti Dukaan, every roti is rolled by hand and cooked fresh on the
            tawa, just the way it&apos;s done at home. We pair it with
            slow-cooked sabzis, dals and curries made from simple, honest
            ingredients, so you can enjoy a wholesome meal without the wait.
          </p>
          <PillButton href="#how-it-works">Our Story</PillButton>
        </div>

        <figure className="relative">
          <div className="absolute -inset-4 -z-10 rotate-[-2deg] rounded-[2.5rem] bg-cream-deep" aria-hidden />
          <div className="overflow-hidden rounded-[2rem] bg-[#f6e3c3] shadow-[0_30px_50px_-30px_rgba(74,37,18,0.6)]">
            <Image
              src="/images/cooking_roti.png"
              alt="A fresh roti being cooked on a tawa, surrounded by bowls of flour and dal"
              width={370}
              height={192}
              sizes="(min-width: 1024px) 34rem, 100vw"
              className="w-full scale-[1.03]"
            />
          </div>
          <figcaption className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 font-display text-sm font-semibold text-cream shadow-lg sm:left-10">
            <span className="h-2 w-2 rounded-full bg-saffron" aria-hidden />
            Freshly Prepared Every Day
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

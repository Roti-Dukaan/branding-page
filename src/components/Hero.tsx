import Image from "next/image";
import { PillButton, Swoosh } from "./ui";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_35%,#fde3b0_0%,#f8ead0_35%,var(--color-cream)_70%)] pt-[5.125rem] pb-4 sm:pt-24 sm:pb-36 lg:pt-28 lg:pb-44"
    >
      <Image
        src="/images/top_tree_branch.png"
        alt=""
        width={260}
        height={160}
        priority
        className="pointer-events-none absolute -top-2 -right-6 z-10 w-44 sm:w-64 lg:-right-10 lg:w-[22rem]"
      />
      <Image
        src="/images/floating_leaves.png"
        alt=""
        width={155}
        height={145}
        className="pointer-events-none absolute top-28 -left-6 hidden w-28 rotate-[-20deg] opacity-90 sm:block"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-2 px-6 sm:gap-10 sm:px-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="relative z-20 flex flex-col items-start text-left sm:items-center sm:text-center lg:items-start lg:text-left">
          <h1 className="relative -ml-2 sm:ml-0">
            <span className="sr-only">Fresh Over Fast</span>
            <Image
              src="/images/tagline_fresh_over_fast.png"
              alt=""
              width={355}
              height={202}
              priority
              className="w-[68.5vw] drop-shadow-[0_2px_0_rgba(255,255,255,0.6)] sm:w-[min(82vw,26rem)]"
            />
          </h1>
          <p className="-mt-2 ml-3.5 max-w-[20.5rem] font-display text-[1.2rem] leading-snug font-medium text-bark sm:mt-6 sm:ml-0 sm:max-w-md sm:text-2xl">
            Home-style rotis and wholesome meals delivered to your doorstep.
          </p>
          <Swoosh className="ml-3.5 h-2 w-[5.625rem] text-saffron sm:mt-3 sm:ml-0 sm:h-3 sm:w-40" />
          <div className="mt-2.5 ml-3.5 flex flex-col items-start gap-2 sm:mt-8 sm:ml-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <PillButton href="#download" className="max-sm:py-2! max-sm:text-[0.95rem]! sm:px-7!">
              Order Now
            </PillButton>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 pl-3.5 font-display text-sm font-semibold text-leaf underline-offset-4 hover:underline sm:pl-0 sm:text-base"
            >
              See how it works
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M8 5l5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>

        <HeroScene />
      </div>
    </section>
  );
}

function HeroScene() {
  return (
    <div
      className="relative -mx-6 -mt-[4.5rem] aspect-[131/100] sm:mx-auto sm:mt-0 sm:aspect-[6/5] sm:w-full sm:max-w-[42rem]"
      aria-hidden
    >
      <Image
        src="/images/clouds.png"
        alt=""
        width={250}
        height={95}
        className="animate-drift absolute top-[2%] left-[4%] w-[30%] opacity-80"
      />
      <div className="absolute top-0 left-[-3%] w-[106%] sm:top-[6%] sm:left-0 sm:w-full sm:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
        <Image
          src="/images/city_background.png"
          alt=""
          width={365}
          height={204}
          priority
          sizes="(min-width: 1024px) 42rem, 100vw"
          className="w-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
        />
      </div>
      <Image
        src="/images/birds.png"
        alt=""
        width={135}
        height={90}
        className="animate-float absolute top-[4%] right-[24%] w-[12%] sm:right-[16%] sm:w-[16%]"
      />

      <div className="absolute inset-x-[-6%] bottom-[4%] h-[34%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(236,217,182,0.95)_0%,rgba(236,217,182,0)_70%)]" />

      <div className="animate-ride-in absolute bottom-[24.8%] left-[21.2%] z-10 w-[54.6%] sm:bottom-[23%] sm:left-[-4%] sm:w-[56%]">
        <div className="absolute inset-x-[14%] bottom-[1%] h-[7%] rounded-[50%] bg-bark/25 blur-[3px]" />
        <span className="animate-speed-line absolute top-[40%] right-[-6%] h-[3px] w-[16%] rounded-full bg-bark/25" />
        <span className="animate-speed-line absolute top-[54%] right-[-12%] h-[3px] w-[22%] rounded-full bg-bark/20 [animation-delay:0.25s]" />
        <span className="animate-speed-line absolute top-[68%] right-[-4%] h-[3px] w-[12%] rounded-full bg-bark/25 [animation-delay:0.5s]" />
        <span className="animate-puff absolute right-[4%] bottom-[8%] h-[9%] w-[9%] rounded-full bg-sand" />
        <span className="animate-puff absolute right-[1%] bottom-[12%] h-[6%] w-[6%] rounded-full bg-sand [animation-delay:0.6s]" />
        <Image
          src="/images/delivery_rider.png"
          alt=""
          width={1024}
          height={682}
          priority
          sizes="(min-width: 1024px) 22rem, 40vw"
          className="animate-ride-bob relative w-full drop-shadow-[0_14px_12px_rgba(74,37,18,0.25)]"
        />
      </div>
      <Image
        src="/images/curry_bowl.png"
        alt=""
        width={197}
        height={170}
        className="absolute right-[1.5%] bottom-[13.4%] z-10 w-[22.8%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)] sm:right-[-1%] sm:bottom-[23%] sm:w-[25%]"
      />
      <Image
        src="/images/roti_plate.png"
        alt=""
        width={312}
        height={165}
        priority
        className="absolute bottom-[3.4%] left-[39%] z-20 w-[49.2%] drop-shadow-[0_16px_14px_rgba(74,37,18,0.3)] sm:bottom-[3%] sm:left-auto sm:right-[8%] sm:w-[52%]"
      />
      <Image
        src="/images/paneer_curry.png"
        alt=""
        width={215}
        height={165}
        className="absolute bottom-[4%] left-[18.2%] z-30 w-[26.7%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)] sm:bottom-0 sm:left-[16%] sm:w-[27%]"
      />
      <Image
        src="/images/leaves_cluster_3.png"
        alt=""
        width={142}
        height={152}
        className="absolute bottom-[2%] left-[-6%] z-20 w-[20%] rotate-[-12deg] sm:bottom-[-4%] sm:w-[18%]"
      />
      <Image
        src="/images/leaves_cluster_1.png"
        alt=""
        width={175}
        height={152}
        className="absolute right-[-8%] bottom-[18%] z-30 w-[16%] -scale-x-100 sm:bottom-[-2%] sm:w-[18%]"
      />
    </div>
  );
}

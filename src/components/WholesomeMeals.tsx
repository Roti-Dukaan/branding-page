import Image from "next/image";
import { SectionTitle } from "./ui";

export function WholesomeMeals() {
  return (
    <section className="relative overflow-hidden pt-14 pb-8 sm:pt-20 sm:pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          eyebrow="Good food, good days"
          title={
            <>
              Wholesome Meals for a <span className="text-leaf">Healthier You</span>
            </>
          }
        />

        <div className="relative mx-auto mt-6 aspect-[16/5] w-full max-w-3xl sm:mt-8" aria-hidden>
          <div className="absolute inset-x-[8%] bottom-[2%] h-[30%] rounded-[50%] bg-sand/70 blur-xl" />
          <Image
            src="/images/clay_pot.png"
            alt=""
            width={115}
            height={170}
            loading="eager"
            className="absolute bottom-[14%] left-[4%] w-[13%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/curry_bowl.png"
            alt=""
            width={197}
            height={170}
            loading="eager"
            className="absolute bottom-[4%] left-[14%] z-10 w-[23%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/roti_plate.png"
            alt=""
            width={312}
            height={165}
            sizes="(min-width: 768px) 24rem, 50vw"
            loading="eager"
            className="absolute bottom-[8%] left-1/2 z-20 w-[42%] -translate-x-1/2 drop-shadow-[0_18px_14px_rgba(74,37,18,0.3)]"
          />
          <Image
            src="/images/paneer_curry.png"
            alt=""
            width={215}
            height={165}
            loading="eager"
            className="absolute right-[14%] bottom-[4%] z-10 w-[23%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/salad_bowl.png"
            alt=""
            width={160}
            height={158}
            loading="eager"
            className="absolute right-[2%] bottom-[18%] w-[15%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
        </div>
      </div>
    </section>
  );
}

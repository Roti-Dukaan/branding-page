import Image from "next/image";
import { SectionTitle } from "./ui";

const values = [
  {
    title: "Quality Ingredients",
    body: "Whole wheat atta, fresh vegetables and pure spices.",
    icon: <path d="M12 21c-4-3-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-3 8-7 11Zm0-15v11m0-6 3-2m-3 5-3-2" />,
  },
  {
    title: "Freshly Prepared",
    body: "Cooked to order, never reheated or stored.",
    icon: <path d="M4 14h16a8 8 0 0 1-16 0Zm4-5c0-1.5 1-2 1-3.5M12 9c0-1.5 1-2 1-3.5M16 9c0-1.5 1-2 1-3.5" />,
  },
  {
    title: "Hygienic & Safe",
    body: "Spotless kitchens and sealed, tamper-proof packaging.",
    icon: <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
  },
  {
    title: "Loved by Foodies",
    body: "Rated highly by families and food lovers alike.",
    icon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  },
];

export function WholesomeMeals() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle
          eyebrow="Good food, good days"
          title={
            <>
              Wholesome Meals for a <span className="text-leaf">Healthier You</span>
            </>
          }
        />

        <div className="relative mx-auto mt-12 aspect-[16/7] w-full max-w-3xl" aria-hidden>
          <div className="absolute inset-x-[8%] bottom-[2%] h-[30%] rounded-[50%] bg-sand/70 blur-xl" />
          <Image
            src="/images/clay_pot.png"
            alt=""
            width={115}
            height={170}
            className="absolute bottom-[14%] left-[4%] w-[13%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/curry_bowl.png"
            alt=""
            width={197}
            height={170}
            className="absolute bottom-[4%] left-[14%] z-10 w-[23%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/roti_plate.png"
            alt=""
            width={312}
            height={165}
            sizes="(min-width: 768px) 24rem, 50vw"
            className="absolute bottom-[8%] left-1/2 z-20 w-[42%] -translate-x-1/2 drop-shadow-[0_18px_14px_rgba(74,37,18,0.3)]"
          />
          <Image
            src="/images/paneer_curry.png"
            alt=""
            width={215}
            height={165}
            className="absolute right-[14%] bottom-[4%] z-10 w-[23%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/salad_bowl.png"
            alt=""
            width={160}
            height={158}
            className="absolute right-[2%] bottom-[18%] w-[15%] drop-shadow-[0_12px_10px_rgba(74,37,18,0.25)]"
          />
          <Image
            src="/images/floating_leaves.png"
            alt=""
            width={155}
            height={145}
            className="animate-float absolute top-0 right-[28%] w-[10%]"
          />
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <li
              key={v.title}
              className="rounded-3xl border border-sand/60 bg-white/70 p-6 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-28px_rgba(74,37,18,0.5)]"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-soft text-leaf">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {v.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-bark">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bark/70">{v.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

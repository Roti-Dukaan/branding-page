import Image from "next/image";

const features = [
  {
    title: "Fresh Ingredients",
    body: "Handpicked produce, sourced daily.",
    icon: "/images/icon_fresh_ingredients.png",
  },
  {
    title: "Home-Style Taste",
    body: "Recipes that taste like home.",
    icon: "/images/icon_home_style.png",
  },
  {
    title: "Fast Delivery",
    body: "Hot and fresh at your door.",
    icon: "/images/icon_fast_delivery.png",
  },
  {
    title: "Loved by Thousands",
    body: "Happy customers every day.",
    icon: "/images/icon_loved.png",
  },
];

export function FeatureStrip() {
  return (
    <section aria-label="Why Roti Dukaan" className="relative z-30 -mt-6 px-3 sm:-mt-28 sm:px-8">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 rounded-[1.5rem] border border-sand/60 bg-white/95 px-2 py-2 shadow-[0_24px_50px_-28px_rgba(74,37,18,0.45)] backdrop-blur sm:gap-y-8 sm:rounded-[2rem] sm:px-8 sm:py-8 lg:grid-cols-4 lg:divide-x lg:divide-sand/70">
        {features.map((f, i) => (
          <li
            key={f.title}
            className={`flex items-center gap-2 px-1.5 py-3 text-left sm:flex-col sm:gap-3 sm:px-3 sm:py-0 sm:text-center lg:flex-row lg:text-left ${
              i % 2 === 0 ? "max-sm:border-r max-sm:border-sand/60" : ""
            } ${i < 2 ? "max-sm:border-b max-sm:border-sand/60" : ""}`}
          >
            <Image
              src={f.icon}
              alt=""
              width={88}
              height={88}
              className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
            />
            <div className="min-w-0">
              <h3 className="font-display text-[0.78rem] leading-tight font-semibold whitespace-nowrap text-bark sm:text-lg sm:whitespace-normal">
                {f.title}
              </h3>
              <p className="mt-0.5 text-[0.68rem] leading-snug text-bark/70 sm:mt-1 sm:text-sm">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

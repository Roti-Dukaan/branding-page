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
    <section aria-label="Why Roti Dukaan" className="relative z-30 -mt-24 px-5 sm:-mt-28 sm:px-8">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 rounded-[2rem] border border-sand/60 bg-white/90 px-4 py-8 shadow-[0_24px_50px_-28px_rgba(74,37,18,0.45)] backdrop-blur sm:px-8 lg:grid-cols-4 lg:divide-x lg:divide-sand/70">
        {features.map((f) => (
          <li key={f.title} className="flex flex-col items-center gap-3 px-3 text-center lg:flex-row lg:text-left">
            <Image
              src={f.icon}
              alt=""
              width={88}
              height={88}
              className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
            />
            <div>
              <h3 className="font-display text-lg leading-tight font-semibold text-bark">{f.title}</h3>
              <p className="mt-1 text-sm text-bark/70">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

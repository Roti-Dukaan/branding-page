import Image from "next/image";
import { Fragment } from "react";
import { SectionTitle } from "./ui";

const steps = [
  {
    title: "Set Your Location",
    body: "Tell us where you are and see what's cooking nearby.",
    image: { src: "/images/step_location.png", width: 185, height: 125 },
  },
  {
    title: "Place Your Order",
    body: "Pick your rotis, curries and combos in a few taps.",
    image: { src: "/images/step_order.png", width: 185, height: 115 },
  },
  {
    title: "Get It Delivered",
    body: "We cook it fresh and bring it hot to your doorstep.",
    image: { src: "/images/step_delivery.png", width: 180, height: 122 },
  },
];

function DashedArrow() {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      className="hidden h-10 w-24 shrink-0 self-start text-leaf/60 md:mt-20 md:block lg:w-32"
      aria-hidden
    >
      <path
        d="M4 30C35 6 80 6 108 24"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="6 7"
      />
      <path d="M100 14l10 11-14 3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-cream-deep/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Good food, simple steps" title="How It Works" />

        <ol className="mt-14 flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-2">
          {steps.map((step, i) => (
            <Fragment key={step.title}>
              <li className="flex max-w-xs flex-1 flex-col items-center text-center">
                <div className="relative grid h-44 w-full place-items-center">
                  <div className="absolute inset-x-6 bottom-2 h-10 rounded-[50%] bg-sand/60 blur-md" aria-hidden />
                  <Image
                    src={step.image.src}
                    alt=""
                    width={step.image.width}
                    height={step.image.height}
                    className="relative max-h-40 w-auto"
                  />
                </div>
                <span className="mt-4 grid h-8 w-8 place-items-center rounded-full bg-leaf font-display text-sm font-semibold text-cream">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-bark">{step.title}</h3>
                <p className="mt-2 text-bark/70">{step.body}</p>
              </li>
              {i < steps.length - 1 && <DashedArrow />}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
}

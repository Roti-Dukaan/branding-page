export type FaqItem = {
  question: string;
  answer: string;
};

/** Shown on the contact page. */
export const CONTACT_FAQS: FaqItem[] = [
  {
    question: "How do I place an order with Roti Dukaan?",
    answer:
      "Browse our menu on the website or mobile app, add items to your cart, and check out. Once you get an order confirmation, our kitchen starts preparing your food fresh.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "Yes. A quick one-time registration with your mobile number lets us confirm your identity, save your delivery address, and keep you updated on your order.",
  },
  {
    question: "Which areas do you deliver to?",
    answer:
      "We currently deliver only within selected areas in Hyderabad. Enter your address in the app to check if you're covered.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most orders arrive within 20 to 30 minutes of confirmation, depending on your location and kitchen load at the time.",
  },
  {
    question: "What are your support hours?",
    answer: "Monday to Sunday, 8:00 AM to 12:00 PM.",
  },
];

/** Shown on the subscriptions browse page. */
export const SUBSCRIPTION_FAQS: FaqItem[] = [
  {
    question: "What subscription plans do you offer?",
    answer:
      "We offer weekly and monthly roti and meal plans with different timing slots and portions. Browse the plans above for current pricing and what each package includes.",
  },
  {
    question: "Can I subscribe on the website?",
    answer:
      "Yes. Pick a plan, set your preferences and delivery details, and complete checkout here. After you're subscribed, pause, skip meals, change plans, and choose daily menus in the Roti Dukaan mobile app.",
  },
  {
    question: "Can I change the weekly menu before I subscribe?",
    answer:
      "Yes. On each plan you can review the weekly menu and adjust items before checkout — the same flexibility as in the mobile app.",
  },
  {
    question: "What's the difference between recurring and one-time payment?",
    answer:
      "Recurring payment keeps your plan active and renews automatically each billing cycle. One-time payment covers a single billing period without auto-renewal. Choose either option at checkout.",
  },
  {
    question: "Can I pause or skip a delivery?",
    answer:
      "Yes. Skip or pause from the mobile app or your profile subscriptions section. Skipped days are extended onto your plan where applicable.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Cancel from the mobile app or email support@rotidukaan.com. Cancellation typically applies from your next billing cycle; deliveries already in preparation may still be fulfilled and charged.",
  },
];

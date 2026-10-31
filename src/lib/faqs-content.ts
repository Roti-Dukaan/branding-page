export type FaqItem = {
  question: string;
  answer: string;
};

/** First items from next-frontend FAQ — shown on the contact page. */
export const CONTACT_FAQS: FaqItem[] = [
  {
    question: "How do I place an order with Roti Dukaan?",
    answer:
      "Download the Roti Dukaan app, browse the menu, add items to your cart, and check out. Once you get an order confirmation, our kitchen starts preparing your food fresh.",
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

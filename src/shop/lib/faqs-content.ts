export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  title: string;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Ordering & Your Account",
    items: [
      {
        question: "How do I place an order with Roti Dukaan?",
        answer:
          "Browse our menu on the Roti Dukaan website, add items to your cart, and check out. Once you get an order confirmation, our kitchen starts preparing your food fresh.",
      },
      {
        question: "Do I need an account to order?",
        answer:
          "Yes. A quick one-time registration with your mobile number lets us confirm your identity, save your delivery address, and keep you updated on your order.",
      },
      {
        question: "How does OTP login work? Is it safe?",
        answer:
          "We send a One-Time Password (OTP) to your registered mobile number to verify it's really you. It's temporary, time-bound, and never stored or shared beyond that verification step.",
      },
      {
        question: "Can I order for someone else or to a different address?",
        answer:
          "Yes, as long as the delivery address falls within our Hyderabad serviceable area. Just enter the correct details at checkout.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        question: "Which areas do you deliver to?",
        answer:
          "We currently deliver only within selected areas in Hyderabad. Enter your address at checkout to check if you're covered.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Most orders arrive within 20 to 30 minutes of confirmation, depending on your location and kitchen load at the time.",
      },
      {
        question: "Do you use Swiggy, Zomato, or other delivery partners?",
        answer:
          "No. All orders are delivered by Roti Dukaan's own dedicated delivery team — we don't use third-party logistics providers.",
      },
      {
        question: "What if I'm not available to receive my delivery?",
        answer:
          "Our delivery executive will try to reach you by call or message. If delivery still can't be completed after a couple of reasonable attempts, the order may be marked undelivered, and charges for the prepared food may still apply.",
      },
      {
        question: "Is there a delivery fee?",
        answer:
          "Any applicable delivery charge is shown clearly at checkout before you confirm your order. We may offer free delivery above a certain order value or on select subscription plans.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We currently accept Cash on Delivery (COD). Online payment options such as UPI, cards, and wallets are coming soon.",
      },
      {
        question: "Is Cash on Delivery simple and safe?",
        answer:
          "Yes — just pay our delivery executive in cash when your order arrives. No advance payment is needed.",
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        question: "What subscription plans do you offer?",
        answer:
          "We offer weekly and monthly roti plans covering different timing slots. Check out the Subscriptions section of our website for current plans and pricing.",
      },
      {
        question: "Can I pause or skip delivery?",
        answer:
          "Yes. You can navigate to your profile subscription section and manage to skip or pause the subscription delivery, and those number of days will be extended in the plan.",
      },
      {
        question: "Can I change my delivery address for mid-subscription?",
        answer:
          "Yes — just update it with our support team or on the Platform with a little advance notice, subject to the new address being within our delivery area.",
      },
      {
        question: "How do I cancel my subscription?",
        answer:
          "Reach out to our support team or cancel directly on the Platform. Cancellation takes effect from your next billing cycle; deliveries already in preparation are still fulfilled and charged.",
      },
    ],
  },
  {
    title: "Cancellations & Refunds",
    items: [
      {
        question: "Can I cancel an order after placing it?",
        answer:
          "Yes, free of charge, as long as our kitchen hasn't started preparing it yet. Once cooking begins, the order can no longer be cancelled.",
      },
      {
        question: "What if my order arrives wrong, incomplete, or damaged?",
        answer:
          "Contact our support team within 10 minutes of delivery with your order ID (and a photo, for damaged items). We'll arrange a refund.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Approved refunds are processed within 2–4 business days, depending on your payment method.",
      },
      {
        question: "I paid by COD — how do I get refunded?",
        answer:
          "Since no online payment was made, we'll arrange your refund via bank transfer or UPI for details you provide us.",
      },
    ],
  },
  {
    title: "Food Quality & Safety",
    items: [
      {
        question: "Is Roti Dukaan FSSAI certified?",
        answer:
          "Yes, we operate in compliance with the Food Safety and Standards Act, 2006 under FSSAI License No. 23626028003051.",
      },
      {
        question: "Is the food really homemade?",
        answer:
          "Yes — every meal is freshly prepared using traditional, homestyle recipes, never previously frozen or stored.",
      },
      {
        question: "How should I store or reheat my food if I can't eat it right away?",
        answer:
          "For the best taste and safety, eat your meal within 2 hours of delivery. If you can't, refrigerate it promptly and consume it within 12 hours, reheating thoroughly before eating.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        question: "How do I reach customer support?",
        answer: "Email us at support@rotidukaan.com",
      },
      {
        question: "What are your support hours?",
        answer: "Monday to Sunday, 8:00 AM to 12:00 PM.",
      },
    ],
  },
];

export const FAQS: FaqItem[] = FAQ_CATEGORIES.flatMap((category) => category.items);

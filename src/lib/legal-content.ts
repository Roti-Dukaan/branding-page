export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  effectiveDate?: string;
  intro?: string[];
  sections: LegalSection[];
};

/** Same content as next-frontend — keep in sync when legal copy changes. */
export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  description: "How Roti Dukaan collects, uses, and protects your personal information.",
  effectiveDate: "10.08.2026",
  intro: [
    'Roti Dukaan ("we", "us", "our", "Company") respects your privacy and is committed to protecting the personal information of everyone who uses our website, mobile application, and food ordering and subscription services (together, the "Platform" or "Services"). This Privacy Policy explains what information we collect, how we use and protect it, and the rights available to you. By accessing or using our Services, you agree to the practices described in this Policy.',
  ],
  sections: [
    {
      title: "1. Information We Collect",
      paragraphs: [
        "Information You Provide to Us: When you register for an account, place an order, or contact our support team, we collect:",
        "• Name",
        "• Mobile number",
        "• Email address (optional)",
        "• Delivery address(es)",
        "• Order history",
        "• Payment-related details necessary to process a transaction (card/UPI credentials themselves are handled by our payment gateway partner and are not stored by us)",
        "• Any information you share with our customer support team",
        "OTP Authentication: We verify your mobile number using a One-Time Password (OTP) sent by SMS whenever you register or log in. The OTP is temporary and time-bound, is used solely to confirm that you control the mobile number provided, and is never stored beyond the verification window or shared with any party other than our SMS delivery provider.",
        "Location Information: Where you choose to enable location access, we may collect your device's approximate or precise location to help you set an accurate delivery address, estimate delivery time, and plan our delivery routes. Location access is optional — you can disable it at any time in your device settings, though you will then need to enter your delivery address manually.",
        "Cookies and Similar Technologies: Our website and app use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Platform is used.",
        "Automatically Collected Information: We may automatically log technical details such as IP address, device type, browser type, and general usage patterns, for security, troubleshooting, and analytics purposes.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      paragraphs: [
        "• Create and manage your account, and verify your identity via OTP",
        "• Process, prepare, and deliver your orders and subscriptions",
        "• Communicate with you about orders, subscriptions, offers, and service updates",
        "• Provide customer support and resolve complaints",
        "• Improve our menu, Platform, and delivery operations",
        "• Meet our legal, tax, and regulatory obligations",
        "• Detect, investigate, and prevent fraud, abuse, or security incidents",
      ],
    },
    {
      title: "3. How We Share Your Information",
      paragraphs: [
        "We do not sell your personal information to anyone. We share limited information only where necessary to run our Services:",
        "• With our own delivery staff, to enable order fulfilment — we currently use only Roti Dukaan's dedicated delivery team and do not share your data with third-party logistics providers",
        "• With payment gateway partners, solely to process payments securely",
        "• With our SMS/communication provider, solely to deliver OTPs and order or delivery updates",
        "• With government or regulatory authorities, where required by applicable law",
      ],
    },
    {
      title: "4. Data Security",
      paragraphs: [
        "We maintain reasonable technical and organisational security measures, in line with the DPDP Act, 2023 and the rules made under it, to protect your personal information against unauthorized access, alteration, disclosure, or loss. While we work hard to protect your data, no method of storage or transmission over the internet is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "5. Data Retention",
      paragraphs: [
        "We retain your personal information for as long as your account is active or as needed to provide our Services to you. We may retain certain information for a longer period where required to meet legal, accounting, or regulatory obligations, resolve disputes, or enforce our agreements. Once no longer required, your data is securely deleted or anonymized.",
      ],
    },
    {
      title: "6. Your Rights",
      paragraphs: [
        "Subject to applicable law, including the Digital Personal Data Protection Act, 2023 and the rules made under it, you have the right to:",
        "• Access the personal information we hold about you",
        "• Request correction of inaccurate or incomplete information",
        "• Withdraw consent for processing that is based on your consent",
        "• Request deletion of your personal information, subject to our legal retention obligations",
        "• Raise a grievance about how your personal information is handled, and have it addressed within a reasonable time",
        "To exercise any of these rights, please contact us using the details in Section 9 below.",
      ],
    },
    {
      title: "7. Children's Privacy",
      paragraphs: [
        "Our Services are not directed at individuals under the age of 18, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so that we can take appropriate action.",
      ],
    },
    {
      title: "8. Changes to This Policy",
      paragraphs: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices or in applicable law. The revised policy will be posted on our Platform with an updated "Effective Date." Your continued use of our Services after such changes constitutes acceptance of the revised policy.',
      ],
    },
    {
      title: "9. Contact Us / Grievance Officer",
      paragraphs: [
        "If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact:",
        "Grievance Officer: Prashanth R",
        "Company: Roti Dukaan",
        "Email: support@rotidukaan.com",
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: "Terms & Conditions",
  description: "Terms governing your access to and use of the Roti Dukaan platform and services.",
  effectiveDate: "10.08.2026",
  intro: [
    'These Terms & Conditions ("Terms") govern your access to and use of the Roti Dukaan website, mobile application, and food ordering and subscription services (together, the "Platform"). By accessing the Platform or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our Services.',
  ],
  sections: [
    {
      title: "1. Definitions",
      paragraphs: [
        '"Company" / "we" / "us" / "our": refers to Roti Dukaan.',
        '"User" / "you" / "your": refers to any individual who accesses or uses the Platform.',
        '"Services": refers to the food ordering, delivery, and subscription services offered by Roti Dukaan.',
      ],
    },
    {
      title: "2. User Eligibility",
      paragraphs: [
        "By using our Platform, you confirm that you are at least 18 years of age and competent to enter into a binding contract under the Indian Contract Act, 1872. If you use the Platform on behalf of another person, you confirm that you are authorized to do so.",
      ],
    },
    {
      title: "3. Account Registration",
      paragraphs: [
        "To place an order or subscribe to a meal plan, you must register an account using your mobile number, which is verified via OTP. You agree to provide accurate, current, and complete information at registration and to keep it updated.",
        "You are responsible for maintaining the confidentiality of your account and for all activity that takes place under it. We reserve the right to suspend or terminate any account that provides false information or is used in violation of these Terms.",
      ],
    },
    {
      title: "4. Ordering Process",
      paragraphs: [
        "You may browse our menu and place orders through our website or app. An order is confirmed only once you receive an order confirmation from us; we reserve the right to refuse or cancel any order, including where an item is unavailable, a pricing error has occurred, or fraud is suspected.",
      ],
    },
    {
      title: "5. Pricing",
      paragraphs: [
        "All prices are listed in Indian Rupees (INR) and are subject to change without prior notice; the price that applies to your order is the one shown at the time of order confirmation. Prices may or may not include applicable taxes and delivery charges, which are shown separately at checkout.",
        "We take reasonable care to keep pricing accurate. If a genuine pricing error occurs, we reserve the right to cancel the affected order and issue a full refund.",
      ],
    },
    {
      title: "6. Product Availability",
      paragraphs: [
        "All menu items and subscription plans are subject to availability. If an ordered item becomes unavailable after your order is placed, we will make reasonable efforts to inform you and may offer a substitute, remove the item with a corresponding refund, or cancel the order.",
        "We reserve the right to modify, add, or discontinue menu items and subscription plans at any time.",
      ],
    },
    {
      title: "7. Customer Responsibilities",
      paragraphs: [
        "As a user of our Services, you agree to:",
        "• Provide a complete and accurate delivery address and contact number",
        "• Be reasonably available to receive your order at the scheduled delivery time",
        "• Inform us in advance of any food allergies or dietary restrictions",
        "• Use the Platform only for lawful purposes",
        "• Make timely payment for all orders placed",
      ],
    },
    {
      title: "8. Delivery Terms",
      paragraphs: [
        "Delivery of your orders is governed by our separate Delivery Policy, which forms part of these Terms. Please refer to it for details on service areas, timings, and related conditions.",
      ],
    },
    {
      title: "9. Intellectual Property",
      paragraphs: [
        "All content on our Platform — including the Roti Dukaan name, logo, trademarks, recipes, images, graphics, and software — is the exclusive property of Roti Dukaan or its licensors and is protected under applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from this content without our prior written consent.",
      ],
    },
    {
      title: "10. Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, Roti Dukaan is not liable for any indirect, incidental, or consequential damages arising from your use of our Services. Our total liability for any claim arising out of an order is limited to the amount you paid for that specific order.",
        "We are not liable for delays or failures caused by circumstances beyond our reasonable control, including weather, traffic disruptions, strikes, or other force majeure events.",
      ],
    },
    {
      title: "11. Indemnification",
      paragraphs: [
        "You agree to indemnify and hold Roti Dukaan, its officers, employees, and delivery personnel harmless from any claims, damages, or expenses arising from your misuse of the Platform or breach of these Terms.",
      ],
    },
    {
      title: "12. Governing Law and Jurisdiction",
      paragraphs: [
        "These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.",
      ],
    },
    {
      title: "13. Amendments",
      paragraphs: [
        "We may modify these Terms at any time; changes take effect upon posting on our Platform. Continued use of our Services after changes are posted constitutes acceptance of the revised Terms.",
      ],
    },
    {
      title: "14. Severability",
      paragraphs: [
        "If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.",
      ],
    },
    {
      title: "15. Contact Us",
      paragraphs: [
        "For questions about these Terms, please contact us at support@rotidukaan.com",
      ],
    },
  ],
};

export const CANCELLATION_REFUND_POLICY: LegalDocument = {
  title: "Cancellation & Refund Policy",
  description: "When and how Roti Dukaan issues refunds for orders and subscriptions.",
  effectiveDate: "10.08.2026",
  intro: [
    "This Refund Policy explains when Roti Dukaan issues refunds, how to request one, and how long refunds take to process. It applies to all orders and subscriptions placed through our website and mobile application and should be read together with our Terms & Conditions.",
  ],
  sections: [
    {
      title: "1. Orders Eligible for a Refund",
      paragraphs: [
        "You may be eligible for a full or partial refund in the following situations:",
        "• The order is cancelled before our kitchen begins preparing it",
        "• A wrong item is delivered",
        "• One or more items are missing from your order",
        "• Food is delivered damaged, spoiled, or unfit for consumption",
        "• The order is confirmed but never delivered",
        "• The order is cancelled by Roti Dukaan due to item unavailability, a pricing error, or an operational issue on our end",
      ],
    },
    {
      title: "2. Subscription Refunds",
      paragraphs: [
        "For active subscriptions, unused or undelivered days are eligible for a pro-rated refund when you cancel your subscription — this excludes days you paused or skipped yourself, and missed deliveries caused by your own unavailability. Refund amounts are calculated based on the per day value of your plan.",
      ],
    },
    {
      title: "3. Situations Not Eligible for a Refund",
      paragraphs: [
        "Refunds are generally not provided where:",
        "• The order was cancelled after our kitchen had already started preparing it",
        "• A complaint about a wrong, missing, or damaged item is raised after the reporting window in Section 4",
        "• Delivery failed due to an incorrect address or your unavailability at the time of delivery",
        "• The subscription day in question was already paused or skipped by you",
      ],
    },
    {
      title: "4. How to Request a Refund",
      paragraphs: [
        "To request a refund, contact our support team (see Contact Us below) within 10 minutes of delivery for order-related issues and share:",
        "• Your order or subscription ID",
        "• A brief description of the issue",
        "• A photograph, for damaged or spoiled food",
        "Our team will review your request and get back to you with the outcome.",
      ],
    },
    {
      title: "5. Refund Verification",
      paragraphs: [
        "We may verify refund requests against order records, delivery logs, and any evidence you provide before approving a refund, and may reach out to you if we need additional information.",
      ],
    },
    {
      title: "6. Refund Amount",
      paragraphs: [
        "Approved refunds cover the value of the affected item(s). Delivery charges are non-refundable, except where your entire order was not delivered or cancelled due to an error on our part — in which case the full amount paid, including delivery charges, is refunded.",
      ],
    },
    {
      title: "7. Refund Methods",
      paragraphs: [
        "Cash on Delivery (COD) orders: Since no online payment was made, refunds are processed via bank transfer or UPI for details you provide us.",
        "Online payments (once enabled): Refunds are credited back to the original payment method used — card, UPI, net banking, or wallet.",
        "We do not issue cash refunds for online payments, and we only process refunds to an account or UPI ID you have specifically provided to us for that purpose.",
      ],
    },
    {
      title: "8. Refund Timelines",
      paragraphs: [
        "Once a refund is approved:",
        "• COD refunds are processed within 5 business days of approval",
        "• Online payment refunds are processed within 2 to 3 business days of approval; the amount may take a few additional days to reflect in your account depending on your bank or payment provider.",
      ],
    },
    {
      title: "9. If You Haven't Received Your Refund",
      paragraphs: [
        "If an approved refund hasn't reached you within the stated timeline, please contact our support team with your order ID and refund approval date, and we will investigate and follow up with you.",
      ],
    },
    {
      title: "10. Changes to This Policy",
      paragraphs: [
        "We may update this Refund Policy from time to time. Any changes will be posted on our Platform with a revised effective date.",
      ],
    },
    {
      title: "11. Contact Us",
      paragraphs: ["Email: support@rotidukaan.com"],
    },
  ],
};

export const SUBSCRIPTION_POLICY: LegalDocument = {
  title: "Subscription Policy",
  description: "How Roti Dukaan meal subscription plans work.",
  effectiveDate: "07.08.2026",
  intro: [
    "Roti Dukaan offers meal subscription plans for customers who want fresh, homemade meals delivered on a recurring basis. This Subscription Policy explains how our subscription plans work, including scheduling, changes, pauses, and cancellations.",
  ],
  sections: [
    {
      title: "1. Subscription Plans",
      paragraphs: [
        "We offer subscription plans across different durations and meal types (weekly or monthly plans covering breakfast, lunch, dinner, or combinations of these), as listed on our Platform. Plan details, pricing, and inclusions are shown at the time of subscribing and may be updated periodically.",
      ],
    },
    {
      title: "2. Delivery Schedule",
      paragraphs: [
        "Each subscription plan has a defined delivery schedule and time window, communicated to you when you subscribe. Deliveries are made in line with this schedule, subject to the terms of our Delivery Policy.",
      ],
    },
    {
      title: "3. Pause and Resume",
      paragraphs: [
        "You may pause your subscription for a specific period, such as during travel, by notifying us at least 12 to 24 hours before your next scheduled delivery. Paused days are not charged and can be resumed as per your instructions, or automatically at the end of the pause period with carry forward days.",
      ],
    },
    {
      title: "4. Skip Delivery",
      paragraphs: [
        "You may skip an individual delivery within your subscription by notifying us at least 12 to 24 hours before the scheduled delivery time. Skipped deliveries are not charged for that day, and the meal credit is adjusted or carried forward as per your plan's terms.",
      ],
    },
    {
      title: "5. Address Changes",
      paragraphs: [
        "You may update your delivery address for future deliveries by contacting our support team or updating it on the Platform, with at least 12 to 24 hours advance notice. Address changes are subject to serviceability; if your new address falls outside our delivery areas, we will let you know your options, including pausing or cancelling your subscription.",
      ],
    },
    {
      title: "6. Missed Deliveries",
      paragraphs: [
        "If you or your authorized representative is unavailable to receive a scheduled delivery and the delivery attempt fails despite reasonable efforts by our team, that day's delivery is treated as completed for billing purposes, unless you had already notified us in advance under Pause and Resume or Skip Delivery above.",
      ],
    },
    {
      title: "7. Subscription Cancellation",
      paragraphs: [
        "You may cancel your subscription at any time by contacting our support team or through the Platform. Cancellation takes effect from the next billing or delivery cycle; any deliveries already scheduled or in preparation will still be fulfilled and charged as per standard terms.",
      ],
    },
    {
      title: "8. Renewal Process",
      paragraphs: [
        "Subscriptions do not currently renew automatically and must be manually renewed by you at the end of your plan period. We plan to introduce auto-renewal in the future; when we do, you will be notified in advance and given the option to opt out of auto-renewal at any time.",
      ],
    },
    {
      title: "9. Refund Eligibility",
      paragraphs: [
        "Refunds for unused or undelivered days within an active subscription — excluding days you skipped or paused, and excluding days affected by circumstances under Section 9 of our Delivery Policy — are calculated on a pro-rata basis and processed in line with our Refund Policy.",
      ],
    },
  ],
};

export const SHIPPING_DELIVERY_POLICY: LegalDocument = {
  title: "Shipping & Delivery Policy",
  description: "Delivery areas, timings, and charges for Roti Dukaan orders.",
  sections: [
    {
      title: "Delivery Areas",
      paragraphs: [
        "We currently deliver across select areas in Hyderabad. Delivery availability is confirmed at checkout based on your saved address.",
      ],
    },
    {
      title: "Delivery Timings",
      paragraphs: [
        "Most orders arrive within 20 to 30 minutes of confirmation, depending on your location and kitchen load at the time.",
      ],
    },
    {
      title: "Delivery Charges",
      paragraphs: [
        "Any applicable delivery charge is shown clearly at checkout before you confirm your order. We may offer free delivery above a certain order value or on select subscription plans.",
      ],
    },
  ],
};

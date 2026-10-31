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

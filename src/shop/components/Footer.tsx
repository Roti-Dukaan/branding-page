"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Instagram, Facebook, Linkedin } from "lucide-react";
import { SITE_CONFIG } from "@shop/lib/constants";
import { Separator } from "@shop/components/ui/separator";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/faqs", label: "FAQs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms-and-conditions", label: "Terms & Conditions" },
      { href: "/cancellation-refund-policy", label: "Cancellation & Refund Policy" },
      { href: "/shipping-delivery-policy", label: "Shipping & Delivery Policy" },
      { href: "/subscription-policy", label: "Subscription Policy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: SITE_CONFIG.social.instagram, label: "Instagram", icon: Instagram },
  { href: SITE_CONFIG.social.facebook, label: "Facebook", icon: Facebook },
  { href: SITE_CONFIG.social.linkedin, label: "LinkedIn", icon: Linkedin },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = "text-gray-400 hover:text-primary transition-colors text-sm";

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group shrink-0 mb-4">
              <Image
                src="/roti_dukaan_logo.png"
                alt="Roti Dukaan"
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary transition-all"
                sizes="48px"
              />
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Roti Dukaan
                </span>
                <span className="block text-xs text-gray-400 -mt-0.5">
                  Fresh Homemade Meals
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {SITE_CONFIG.description}
            </p>
            <p className="mt-3 text-gray-400 text-sm">
              FSSAI Lic. No.{" "}
              <span className="font-medium text-gray-300">{SITE_CONFIG.fssaiLicense}</span>
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-lg font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Roti Dukaan. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-1 sm:hidden">
            FSSAI Lic. No. {SITE_CONFIG.fssaiLicense}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm"
        >
          Back to Top
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}

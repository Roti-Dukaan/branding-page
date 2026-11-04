"use client";

import Link from "next/link";
import { ChevronRight, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { SITE_CONFIG, getSupportWhatsAppUrl } from "@shop/lib/constants";

const HELP_LINKS = [
  {
    title: "Contact Us",
    description: "Send us a message and our team will get back to you.",
    href: "/contact",
    label: "Go to Contact",
  },
  {
    title: "FAQs",
    description: "Find quick answers to common questions about orders and delivery.",
    href: "/faqs",
    label: "View FAQs",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Help Center</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Help Center
          </h1>
          <p className="mt-3 text-muted-foreground">
            Need assistance? We&apos;re here to help with orders, subscriptions, and delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {HELP_LINKS.map((item) => (
            <Card key={item.href} className="border-border">
              <CardContent className="p-5">
                <HelpCircle className="h-8 w-8 text-primary mb-3" />
                <h2 className="font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <Link href={item.href} className="inline-block mt-4">
                  <Button variant="outline" size="sm">
                    {item.label}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MessageCircle className="h-5 w-5 text-primary" />
                WhatsApp Support
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Chat with us for quick help with your order.
              </p>
            </div>
            <a href={getSupportWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90">Chat on WhatsApp</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Email us</p>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-sm text-primary hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

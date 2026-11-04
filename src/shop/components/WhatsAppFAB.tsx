"use client";

import { MessageCircle } from "lucide-react";
import { getSupportWhatsAppUrl } from "@shop/lib/constants";

export default function WhatsAppFAB() {
  return (
    <a
      href={getSupportWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      aria-label="Chat on WhatsApp for support"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

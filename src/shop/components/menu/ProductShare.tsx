"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Link, MessageCircle, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { toast } from "@shop/lib/toast";

interface ProductShareProps {
  productName: string;
}

export default function ProductShare({ productName }: ProductShareProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleWhatsApp = () => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(`Check out ${productName} on Roti Dukaan!`);
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleTwitter = () => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(`Check out ${productName} on Roti Dukaan!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-sm font-bold text-foreground mb-2">Share</h3>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="text-[11px] font-medium gap-1 h-7"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsApp}
          className="text-[11px] font-medium gap-1 h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <MessageCircle className="h-3 w-3" />
          WhatsApp
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebook}
          className="text-[11px] font-medium gap-1 h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <ExternalLink className="h-3 w-3" />
          Facebook
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitter}
          className="text-[11px] font-medium gap-1 h-7 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
        >
          <ExternalLink className="h-3 w-3" />
          Twitter
        </Button>
      </div>
    </motion.div>
  );
}

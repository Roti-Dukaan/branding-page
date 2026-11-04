"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Link2, MessageCircle, Facebook, Twitter, Check, X } from "lucide-react";
import { toast } from "@shop/lib/toast";

interface ShareButtonProps {
  itemName: string;
  /** Public menu slug (not database UUID). */
  itemSlug: string;
  className?: string;
}

export default function ShareButton({ itemName, itemSlug, className = "" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/menu/${encodeURIComponent(itemSlug)}`;
  };

  const shareText = `Check out ${itemName} on Roti Dukaan!`;

  const handleNativeShare = () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: itemName,
          text: shareText,
          url,
        })
        .catch(() => {});
    } else {
      setOpen(!open);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    setOpen(false);
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    setOpen(false);
  };

  const handleTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleNativeShare();
        }}
        aria-label="Share"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-100 px-3.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Share Item
                </p>
              </div>

              <div className="py-1">
                <ShareMenuItem
                  icon={copied ? Check : Link2}
                  label={copied ? "Copied!" : "Copy Link"}
                  onClick={handleCopyLink}
                  highlight={copied}
                />
                <ShareMenuItem
                  icon={MessageCircle}
                  label="WhatsApp"
                  onClick={handleWhatsApp}
                  iconColor="text-green-600"
                />
                <ShareMenuItem
                  icon={Facebook}
                  label="Facebook"
                  onClick={handleFacebook}
                  iconColor="text-blue-600"
                />
                <ShareMenuItem
                  icon={Twitter}
                  label="Twitter / X"
                  onClick={handleTwitter}
                  iconColor="text-sky-500"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareMenuItem({
  icon: Icon,
  label,
  onClick,
  iconColor,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  iconColor?: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
        highlight ? "bg-emerald-50 text-emerald-600" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className={`h-4 w-4 ${iconColor || ""}`} />
      {label}
    </button>
  );
}

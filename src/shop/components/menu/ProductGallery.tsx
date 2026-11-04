"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@shop/lib/utils";
import ShareButton from "@shop/components/ui/ShareButton";

interface ProductGalleryProps {
  images: string[];
  name: string;
  isVeg: boolean;
  slug: string;
}

export default function ProductGallery({
  images,
  name,
  isVeg,
  slug,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main Image - Clean card style */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[selectedIndex]}
              alt={`${name} - Image ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 360px"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Veg/Non-veg indicator */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={cn(
              "w-6 h-6 border-2 flex items-center justify-center p-[2px] bg-white rounded-md shadow-sm",
              isVeg ? "border-green-600" : "border-red-600"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                isVeg ? "bg-green-600" : "bg-red-600"
              )}
            />
          </div>
        </div>

        {/* Share button */}
        <div className="absolute top-3 right-3 z-10">
          <ShareButton itemName={name} itemSlug={slug} />
        </div>

        {/* Image count */}
        <div className="absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
          {selectedIndex + 1}/{images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2">
        {images.map((image, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
              selectedIndex === index
                ? "border-primary shadow-sm"
                : "border-border/50 opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn } from "lucide-react";
import { GALLERY_ITEMS } from "@shop/lib/data";

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Our Kitchen
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              A Peek Into Our Kitchen
            </h2>
            <p className="text-muted-foreground text-base">
              See the love and care that goes into every meal we prepare.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => setLightbox(item.image)}
            >
              <div className="aspect-square relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-semibold">
                    {item.title}
                  </p>
                  <p className="text-white/70 text-xs">{item.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt="Gallery photo"
                fill
                className="object-contain rounded-2xl"
                sizes="80vw"
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

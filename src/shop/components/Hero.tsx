"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Flame, Heart } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { homepageBannerApi } from "@shop/lib/api/homepage-banner.api";
import type { ApiHomepageBanner } from "@shop/lib/types/api";
import { isSafeExternalUrl } from "@shop/lib/safe-external-url";
import { useLocationStore } from "@shop/lib/stores/location-store";
import { formatDeliveryLocationLabel } from "@shop/lib/geo/format-delivery-location";
import { useMounted } from "@shop/lib/hooks";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop";

const ROTATING_HEADLINE_SUFFIXES = [
  "Instantly",
  "on Schedule",
  "by Subscription",
] as const;

const HEADLINE_ROTATE_MS = 3200;

function RotatingHeadlinePhrase() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % ROTATING_HEADLINE_SUFFIXES.length);
    }, HEADLINE_ROTATE_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="mt-1 block">
      <span className="text-foreground">Rotis Delivered </span>
      <span
        className="relative inline-block min-w-[9.5em] overflow-hidden align-bottom text-primary sm:min-w-[11em]"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={ROTATING_HEADLINE_SUFFIXES[phraseIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="inline-block"
          >
            {ROTATING_HEADLINE_SUFFIXES[phraseIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

const TRUST_BADGES = [
  { icon: Leaf, label: "Zero MSG", sublabel: "100% Natural" },
  { icon: Flame, label: "Soft Grain Rotis", sublabel: "Fresh Daily" },
  { icon: Heart, label: "Cold-Pressed Oils", sublabel: "Healthy Choice" },
];

function getRedirectUrl(banner: ApiHomepageBanner): string | null {
  switch (banner.redirectType) {
    case "CATEGORY":
    case "PRODUCT":
      return banner.redirectValue ? `/menu/${banner.redirectValue}/view` : null;
    case "SUBSCRIPTION":
      return banner.redirectValue ? `/subscriptions/${banner.redirectValue}/view` : null;
    case "EXTERNAL_URL":
      return banner.redirectValue && isSafeExternalUrl(banner.redirectValue)
        ? banner.redirectValue
        : null;
    default:
      return null;
  }
}

function getImageUrl(banner: ApiHomepageBanner, isMobile: boolean): string {
  if (isMobile && banner.mobileImageUrl) return banner.mobileImageUrl;
  return banner.desktopImageUrl || banner.mobileImageUrl || DEFAULT_IMAGE;
}

function CarouselControls({
  count,
  currentIndex,
  onPrev,
  onNext,
  onGoTo,
}: {
  count: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}) {
  if (count <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-full border border-gray-200 bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onGoTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full border border-gray-200 bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}

function HeroCarouselImage({
  src,
  alt,
  loading,
  className,
  onClick,
}: {
  src: string;
  alt: string;
  loading: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
    >
      {loading ? (
        <div className="h-full w-full animate-pulse bg-gray-200" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="relative h-full w-full"
          >
            <Image src={src} alt={alt} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function Hero() {
  const mounted = useMounted();
  const areaName = useLocationStore((s) => s.areaName);
  const city = useLocationStore((s) => s.city);
  const formattedAddress = useLocationStore((s) => s.formattedAddress);
  const [slides, setSlides] = useState<ApiHomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const deliveryLabel = mounted
    ? formatDeliveryLocationLabel({
        areaName,
        city,
        formattedAddress,
        placeholder: "Hyderabad",
      })
    : "Hyderabad";

  const fetchBanners = useCallback(async () => {
    try {
      const res = await homepageBannerApi.getActiveBanners();
      const now = new Date();
      const active = (res.data ?? []).filter((banner) => {
        if (!banner.isActive) return false;
        if (banner.startDate && now < new Date(banner.startDate)) return false;
        if (banner.endDate && now > new Date(banner.endDate)) return false;
        return Boolean(banner.desktopImageUrl || banner.mobileImageUrl);
      });
      setSlides(active);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const slideCount = slides.length > 0 ? slides.length : 1;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return undefined;
    autoplayRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [nextSlide, slideCount]);

  const currentSlide = slides[currentIndex];
  const desktopImage = currentSlide ? getImageUrl(currentSlide, false) : DEFAULT_IMAGE;
  const mobileImage = currentSlide ? getImageUrl(currentSlide, true) : DEFAULT_IMAGE;
  const currentAlt = currentSlide?.title ?? "Delicious homemade Indian thali";

  const handleImageClick = () => {
    if (!currentSlide) return;
    const url = getRedirectUrl(currentSlide);
    if (!url) return;
    if (currentSlide.redirectType === "EXTERNAL_URL") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  const imageClickHandler = currentSlide && getRedirectUrl(currentSlide) ? handleImageClick : undefined;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-background sm:min-h-screen lg:min-h-[90vh]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl sm:h-[400px] sm:w-[400px] md:h-[600px] md:w-[600px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-secondary/5 blur-3xl sm:h-[350px] sm:w-[350px] md:h-[500px] md:w-[500px]" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content — matches main branch */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary sm:h-2 sm:w-2" />
                </span>
                Now Delivering in {deliveryLabel}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 text-2xl font-bold leading-[1.2] tracking-tight text-foreground sm:mb-6 sm:text-3xl sm:leading-[1.1] md:text-4xl lg:text-5xl xl:text-6xl"
            >
              <span className="block">Fresh Homemade</span>
              <RotatingHeadlinePhrase />
              <span className="mt-1 block sm:mt-0">to Your Door</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mb-8 sm:text-base md:text-lg"
            >
              Healthy, freshly prepared rotis, curries, and wholesome meals made with love. No
              preservatives, no compromises — just pure homemade goodness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:gap-4"
            >
              <Link href="/menu">
                <Button
                  size="lg"
                  className="h-10 bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90 sm:h-12 sm:px-8 sm:text-base"
                >
                  View Menu
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 sm:gap-4 md:gap-6"
            >
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                    <badge.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground sm:text-sm">{badge.label}</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">{badge.sublabel}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — dynamic carousel with main branch layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-square max-w-lg">
              <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 sm:rounded-3xl">
                <HeroCarouselImage
                  src={desktopImage}
                  alt={currentAlt}
                  loading={loading}
                  className="h-full w-full"
                  onClick={imageClickHandler}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -left-4 top-0 z-10 rounded-xl border border-border bg-white p-3 shadow-xl sm:-left-6 sm:rounded-2xl sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                    <Flame className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground sm:text-sm">Quick Delivery</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">20-30 mins</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute -right-4 bottom-0 z-10 rounded-xl border border-border bg-white p-3 shadow-xl sm:-right-6 sm:rounded-2xl sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 sm:h-10 sm:w-10">
                    <Heart className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground sm:text-sm">Made with Love</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">500+ Happy Customers</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <CarouselControls
              count={slides.length}
              currentIndex={currentIndex}
              onPrev={prevSlide}
              onNext={nextSlide}
              onGoTo={setCurrentIndex}
            />
          </motion.div>

          {/* Mobile Hero Image — dynamic carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:hidden"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-primary/10 sm:aspect-square">
              <HeroCarouselImage
                src={mobileImage}
                alt={currentAlt}
                loading={loading}
                className="h-full w-full"
                onClick={imageClickHandler}
              />
            </div>

            <CarouselControls
              count={slides.length}
              currentIndex={currentIndex}
              onPrev={prevSlide}
              onNext={nextSlide}
              onGoTo={setCurrentIndex}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

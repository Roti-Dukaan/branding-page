"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { ProductDetails } from "@shop/lib/types";
import { addToRecentlyViewed } from "@shop/lib/product-utils";
import ProductBreadcrumb from "./ProductBreadcrumb";
import ProductGallery from "./ProductGallery";
import ProductHeader from "./ProductHeader";
import ProductDescription from "./ProductDescription";
import HealthTags from "./HealthTags";
import NutritionCard from "./NutritionCard";
import PairWithSection from "./PairWithSection";
import RelatedProducts from "./RelatedProducts";
import StickyPurchaseCard from "./StickyPurchaseCard";
import RecentlyViewed from "./RecentlyViewed";
import CustomerPromise from "./CustomerPromise";

interface ProductDetailsPageProps {
  product: ProductDetails;
  relatedProducts?: ProductDetails[];
}

export default function ProductDetailsPage({ product, relatedProducts = [] }: ProductDetailsPageProps) {

  useEffect(() => {
    addToRecentlyViewed(product.slug);
    window.scrollTo(0, 0);
  }, [product.slug]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <ProductBreadcrumb
          category={product.category}
          productName={product.name}
        />

        {/* Swiggy/Zomato style: Image left (small) + Details right */}
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 lg:gap-8 items-start">
          {/* Left - Compact Image Card */}
          <div className="md:sticky md:top-24">
            <ProductGallery
              images={product.galleryImages}
              name={product.name}
              isVeg={product.isVeg}
              slug={product.slug}
            />
          </div>

          {/* Right - All Details */}
          <div className="space-y-5">
            <ProductHeader product={product} />

            <HealthTags healthTags={product.healthTags} />

            <ProductDescription product={product} />

            <NutritionCard nutrition={product.nutrition} />

            <PairWithSection
              pairings={product.pairings}
              currentProductSlug={product.slug}
            />

            <StickyPurchaseCard product={product} />
          </div>
        </div>

        {/* Full-width sections below */}
        <div className="mt-12 space-y-10">
          <CustomerPromise />

          <RelatedProducts
            products={relatedProducts}
            currentSlug={product.slug}
          />

          <RecentlyViewed currentSlug={product.slug} />
        </div>
      </div>

      {/* Mobile bottom spacer for sticky bar */}
      <div className="lg:hidden h-24" />
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, HelpCircle, Loader2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";
import ShareButton from "@shop/components/ui/ShareButton";
import { useCategories, useFoods, useBranchFoods, useBranchCategories } from "@shop/hooks/api/use-menu";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useLocationStore } from "@shop/lib/stores/location-store";
import type { ApiCategory, ApiProduct } from "@shop/lib/types/api";
import { resolveImageUrl, getCategoryFilterNames } from "@shop/lib/product-utils";
import { mapApiVariants } from "@shop/lib/menu-variants";
import { DietFilter } from "@shop/components/menu/DietFilter";
import { Price } from "@shop/components/ui/price";

export default function MenuSection() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dietFilter, setDietFilter] = useState<"All" | "Veg" | "NonVeg">("All");
  const { addFavorite, removeFavorite, isFavorite } = useProfileStore();
  const branchId = useLocationStore((s) => s.branchId);

  const { data: globalCategories = [], isLoading: categoriesLoading } = useCategories();
  const { data: branchCategories = [], isLoading: branchCategoriesLoading } = useBranchCategories();
  const { data: globalFoods = [], isLoading: foodsLoading } = useFoods({ limit: 100, sort: "sort_order" });
  const { data: branchFoods = [], isLoading: branchFoodsLoading } = useBranchFoods();

  const categories = (branchId ? branchCategories : globalCategories) as ApiCategory[];
  const foods = (branchId ? branchFoods : globalFoods) as ApiProduct[];

  const categoryNames = useMemo(
    () => getCategoryFilterNames(categories),
    [categories]
  );

  const filteredItems = useMemo(() => {
    return foods
      .filter((item: ApiProduct) => branchId || item.isAvailable !== false)
      .filter((item: ApiProduct) => {
        const category = categories.find((c: ApiCategory) => c.id === item.categoryId);
        const categoryName = category?.name || "";
        const matchesCategory =
          activeCategory === "All" || categoryName === activeCategory;
        const matchesSearch =
          (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.shortDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiet =
          dietFilter === "All" ||
          (dietFilter === "Veg" && item.isVeg) ||
          (dietFilter === "NonVeg" && !item.isVeg);
        return matchesCategory && matchesSearch && matchesDiet;
      });
  }, [foods, categories, activeCategory, searchQuery, dietFilter, branchId]);

  const isLoading = categoriesLoading || foodsLoading || (branchId && (branchCategoriesLoading || branchFoodsLoading));

  if (isLoading) {
    return (
      <section id="menu" className="py-20 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm uppercase tracking-widest text-primary-amber font-bold block mb-2">
              Explore Flavors
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-bold tracking-tight mb-4">
              Our Homemade Menu
            </h2>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-amber" />
            <span className="ml-3 text-gray-500">Loading menu...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm uppercase tracking-widest text-primary-amber font-bold block mb-2">
            Explore Flavors
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-bold tracking-tight mb-4">
            Our Homemade Menu
          </h2>
          <p className="text-gray-500 text-base">
            Lovingly made with high-quality ingredients. Select from our organic rotis, savory curries, and value-packed wholesome combos.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-sand mb-10">
          <div className="flex flex-col gap-4 lg:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for rotis, paneer, dal, combos..."
                className="w-full bg-cream/40 text-charcoal placeholder-gray-400 pl-11 pr-4 py-3 rounded-2xl border border-sand/60 focus:border-primary-amber focus:ring-1 focus:ring-primary-amber focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2 hidden sm:inline-block">
                Dietary:
              </span>
              <DietFilter value={dietFilter} onChange={setDietFilter} />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 border-t border-sand/50 pt-3 sm:pt-4 overflow-x-auto scrollbar-none flex gap-2">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-amber-600/15"
                    : "bg-cream/30 text-gray-600 hover:bg-cream-deep hover:text-primary border border-sand/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[300px] items-stretch">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item: ApiProduct) => {
              const category = categories.find((c: ApiCategory) => c.id === item.categoryId);
              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden border border-sand shadow-sm flex flex-col h-full group glow-card"
                >
                  <div onClick={() => router.push(`/menu/${item.slug}/view`)} className="cursor-pointer flex flex-col flex-1">
                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-cream-deep">
                      {item.imageUrl ? (
                        <Image
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
                        <div className={`w-3 h-3 border-[1.5px] ${item.isVeg ? 'border-green-600' : 'border-rose-700'} flex items-center justify-center p-[1.5px]`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-rose-700'}`} />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFavorite(item.slug)) {
                              removeFavorite(item.slug);
                            } else {
                              addFavorite(item.slug);
                            }
                          }}
                          className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isFavorite(item.slug)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500 hover:text-red-400"
                            }`}
                          />
                        </button>
                        <ShareButton itemName={item.name} itemSlug={item.slug} />
                      </div>
                    </div>

                    <div className="p-3 pb-0 flex-1">
                      <h3 className="text-sm font-bold text-charcoal mb-0.5 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary-amber transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-[11px] leading-snug line-clamp-1 min-h-[1rem]">
                        {item.shortDescription || "\u00A0"}
                      </p>
                    </div>
                  </div>

                  <div className="px-3 pb-3 pt-2 mt-auto min-h-10 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col">
                      <Price
                        value={item.price}
                        className="text-sm font-bold text-charcoal"
                      />
                      {item.listDisplayPrice != null && item.listDisplayPrice > item.price ? (
                        <Price
                          value={item.listDisplayPrice}
                          className="text-[10px] text-gray-400 line-through"
                        />
                      ) : null}
                    </div>
                      <AddToCartButton
                        item={{
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.imageUrl ? resolveImageUrl(item.imageUrl) : "",
                          isVeg: item.isVeg,
                          description: item.shortDescription || "",
                          category: category?.name || "",
                          gstPercentage: item.gstPercentage,
                          gstType: item.gstType,
                          variants: mapApiVariants(item.variants),
                        }}
                        showPrice={false}
                      />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-3xl border border-sand shadow-sm col-span-full"
            >
              <div className="w-16 h-16 rounded-full bg-cream-deep text-primary-amber flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-1">No dishes match your filters</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Try adjusting your filters, clearing your search query, or checking other categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDietFilter("All");
                  setActiveCategory("All");
                }}
                className="mt-4 text-xs text-primary-amber font-bold underline cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

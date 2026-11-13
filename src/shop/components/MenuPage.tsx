"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CatalogImage } from "@shop/components/ui/CatalogImage";
import { motion } from "motion/react";
import { Search, Loader2, Heart } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { DietFilter } from "@shop/components/menu/DietFilter";
import { Price } from "@shop/components/ui/price";
import AddToCartButton from "@shop/components/ui/add-to-cart-button";
import ShareButton from "@shop/components/ui/ShareButton";
import { useCategories, useFoods, useBranchFoods, useBranchCategories } from "@shop/hooks/api/use-menu";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useLocationStore } from "@shop/lib/stores/location-store";
import type { ApiCategory, ApiProduct } from "@shop/lib/types/api";
import { resolveImageUrl, getCategoryFilterNames } from "@shop/lib/product-utils";
import { mapApiVariants } from "@shop/lib/menu-variants";

export default function MenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
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
          (item.shortDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiet =
          dietFilter === "All" ||
          (dietFilter === "Veg" && item.isVeg) ||
          (dietFilter === "NonVeg" && !item.isVeg);
        return matchesCategory && matchesSearch && matchesDiet;
      });
  }, [foods, categories, activeCategory, searchQuery, dietFilter, branchId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isLoading = branchId ? (branchCategoriesLoading || branchFoodsLoading) : (categoriesLoading || foodsLoading);

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 items-start">
          {/* Mobile sticky filter bar — matches home page MenuSection */}
          <div className="menu-filters-mobile-bar lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-4">
            <div className="menu-filters-float rounded-3xl p-4 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
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

              <div className="border-t border-sand/50 pt-3 overflow-x-auto scrollbar-none flex gap-2">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    type="button"
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
          </div>

          {/* Desktop sticky filter sidebar */}
          <aside className="menu-filters-aside hidden lg:block">
            <div className="menu-filters-float bg-card rounded-2xl p-4 sm:p-5 border border-border space-y-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-thin">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rotis, paneer, dal..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Dietary</h3>
                <DietFilter value={dietFilter} onChange={setDietFilter} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Menu Grid — explicit column so filters stay in sidebar when sticky */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading menu...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {filteredItems.map((item: ApiProduct, index: number) => {
                const category = categories.find((c: ApiCategory) => c.id === item.categoryId);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    className="bg-white rounded-2xl overflow-hidden border border-sand shadow-sm flex flex-col h-full group glow-card"
                  >
                    <div onClick={() => router.push(`/menu/${item.slug}/view`)} className="cursor-pointer flex flex-col flex-1">
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-cream-deep">
                        {item.imageUrl ? (
                          <CatalogImage
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-4xl">🍽️</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
                          <div className={`w-3 h-3 border-[1.5px] ${item.isVeg ? "border-green-600" : "border-rose-700"} flex items-center justify-center p-[1.5px]`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-rose-700"}`} />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <button
                            type="button"
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
                      <Price
                        value={item.price}
                        className="text-sm font-bold text-charcoal"
                      />
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
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">
                No dishes found
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your search or filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setDietFilter("All");
                  setActiveCategory("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

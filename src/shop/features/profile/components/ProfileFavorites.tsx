"use client";

import Image from "next/image";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useFoods } from "@shop/hooks/api/use-menu";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { formatPrice } from "@shop/lib/utils";
import { useCartStore } from "@shop/lib/store";
import { toast } from "@shop/lib/toast";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { resolveImageUrl } from "@shop/lib/product-utils";

export function ProfileFavorites() {
  const { favorites, removeFavorite } = useProfileStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: foods = [], isLoading } = useFoods({ limit: 100 });

  const favoriteItems = favorites
    .map((f) => ({
      ...f,
      item: foods.find((m) => m.slug === f.menuItemId),
    }))
    .filter((f) => f.item);

  const handleAddToCart = (item: (typeof foods)[number]) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.imageUrl ? resolveImageUrl(item.imageUrl) : "",
        isVeg: item.isVeg,
        description: item.shortDescription || "",
        category: "",
        gstPercentage: item.gstPercentage,
        gstType: item.gstType,
      },
      1
    );
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Favorites
        </h2>
        <p className="text-sm text-muted-foreground">
          Your saved meals for quick reorder
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : favoriteItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Heart className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No favorites yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse the menu and tap the heart icon to save meals
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteItems.map((f) => {
            const item = f.item!;
            return (
              <Card key={item.slug} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  {item.imageUrl ? (
                    <Image
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                            item.isVeg
                              ? "border-green-600 text-green-600"
                              : "border-red-600 text-red-600"
                          }`}
                        >
                          <span
                            className={`size-2 rounded-full ${
                              item.isVeg ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </span>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="size-3.5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        removeFavorite(item.slug);
                        toast.success(`${item.name} removed from favorites`);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

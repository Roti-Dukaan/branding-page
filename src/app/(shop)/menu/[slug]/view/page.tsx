import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsPage from "@shop/components/menu/ProductDetailsPage";
import { JsonLd } from "@shop/components/seo/JsonLd";
import { getServerApiBaseUrl } from "@shop/lib/api/server-url";
import {
  createPageMetadata,
  getBreadcrumbJsonLd,
  getProductJsonLd,
} from "@shop/lib/seo";
import { formatServingsLabel, normalizeProduct } from "@shop/lib/product-utils";
import { mapApiVariants } from "@shop/lib/menu-variants";
import type { ApiProduct, ApiCategory } from "@shop/lib/types/api";

export const dynamic = "force-dynamic";

function resolveImageUrl(apiBase: string, url?: string | null): string {
  if (!url) return "/foods/placeholder.jpg";
  if (/^https?:\/\//.test(url)) return url;
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function getProduct(apiBase: string, slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${apiBase}/api/v1/menu/items/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.data || null;
    return product ? normalizeProduct(product) : null;
  } catch {
    return null;
  }
}

async function getCategories(apiBase: string): Promise<ApiCategory[]> {
  try {
    const res = await fetch(
      `${apiBase}/api/v1/menu/categories?limit=100&sort=displayOrder&order=asc`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.items || [];
  } catch {
    return [];
  }
}

async function getRelatedProducts(
  apiBase: string,
  categoryId: string,
  currentSlug: string,
): Promise<ApiProduct[]> {
  try {
    const res = await fetch(
      `${apiBase}/api/v1/menu/items?limit=50&available=true&sort=sort_order`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.data?.items || [];
    return items
      .filter((p: ApiProduct) => p.categoryId === categoryId && p.slug !== currentSlug)
      .slice(0, 4)
      .map(normalizeProduct);
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiBase = await getServerApiBaseUrl();
  const product = await getProduct(apiBase, slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const description = `Fresh homemade ${product.name} delivered in Hyderabad. ${product.shortDescription || ""}`.trim();
  const imageUrl = product.imageUrl
    ? resolveImageUrl(apiBase, product.imageUrl)
    : undefined;

  return createPageMetadata({
    title: product.name,
    description,
    path: `/menu/${slug}/view`,
    image: imageUrl,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const apiBase = await getServerApiBaseUrl();
  const [product, categories] = await Promise.all([
    getProduct(apiBase, slug),
    getCategories(apiBase),
  ]);

  if (!product) {
    notFound();
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const relatedProducts = await getRelatedProducts(apiBase, product.categoryId, slug);
  const categoryName = category?.name || "Uncategorized";

  const mappedRelatedProducts = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.shortDescription || "",
    price: p.discountPrice || p.price,
    category: categoryName,
    image: resolveImageUrl(apiBase, p.imageUrl),
    isVeg: p.isVeg,
    slug: p.slug,
  }));

  const variants = mapApiVariants(product.variants);
  const productDetails = {
    id: product.id,
    name: product.name,
    description: product.description || product.shortDescription || "",
    price: product.discountPrice || product.price,
    variants,
    category: categoryName,
    image: resolveImageUrl(apiBase, product.imageUrl),
    isVeg: product.isVeg,
    tags: [],
    isSpecial: product.isFeatured,
    preparationTime: `${product.preparationTime || 20} min`,
    slug: product.slug,
    shortDescription: product.shortDescription || "",
    longDescription: product.description || product.shortDescription || "",
    ingredients: [],
    nutrition: {
      calories: product.calories != null ? Number(product.calories) : 0,
      protein: `${product.protein != null ? Number(product.protein) : 0}g`,
      carbs: `${product.carbs != null ? Number(product.carbs) : 0}g`,
      fat: `${product.fats != null ? Number(product.fats) : 0}g`,
      fiber: `${product.fiber != null ? Number(product.fiber) : 0}g`,
      servingSize: product.servingSize || "1 plate",
    },
    healthTags: [] as string[],
    benefits: [],
    availability: product.isAvailable ? ("available" as const) : ("unavailable" as const),
    servings: formatServingsLabel(product.servingSize),
    galleryImages: (() => {
      const gallery = (product.gallery || []).map((url) => resolveImageUrl(apiBase, url));
      if (gallery.length > 0) return gallery;
      const main = resolveImageUrl(apiBase, product.imageUrl);
      return main ? [main] : [];
    })(),
    pairings: mappedRelatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      slug: p.slug,
      isVeg: p.isVeg,
    })),
    cookingPreferences: [],
    mockOrders: "100+",
    rating: 0,
    reviewCount: 0,
  };

  return (
    <>
      <JsonLd
        data={[
          getProductJsonLd({
            name: product.name,
            description: product.description || product.shortDescription || product.name,
            slug: product.slug,
            image: resolveImageUrl(apiBase, product.imageUrl),
            price: product.discountPrice || product.price,
            isAvailable: product.isAvailable,
          }),
          getBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Menu", path: "/menu" },
            { name: product.name, path: `/menu/${slug}/view` },
          ]),
        ]}
      />
      <ProductDetailsPage
        product={productDetails as any}
        relatedProducts={mappedRelatedProducts as any}
      />
    </>
  );
}

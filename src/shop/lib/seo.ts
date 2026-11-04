import { SITE_CONFIG } from "./constants";

type RobotsDirective = {
  index: boolean;
  follow: boolean;
  googleBot?: { index: boolean; follow: boolean };
};

type PageMetadata = Record<string, unknown>;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://rotidukaan.com";

export const DEFAULT_OG_IMAGE = "/roti_dukaan_logo.png";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1034937759158014";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-L8P4KCQJEP";

export const SEO_KEYWORDS = [
  "homemade food delivery",
  "fresh roti delivery",
  "Indian food delivery Hyderabad",
  "healthy meals Hyderabad",
  "roti dukaan",
  "home cooked food delivery",
  "meal subscription Hyderabad",
  "veg food delivery",
];

export const NOINDEX_ROBOTS: RobotsDirective = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}): PageMetadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const fullTitle = title.includes(SITE_CONFIG.name)
    ? title
    : `${title} | ${SITE_CONFIG.name}`;

  return {
    title,
    description,
    keywords: keywords ?? SEO_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_CONFIG.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: NOINDEX_ROBOTS } : {}),
  };
}

export const rootMetadata: PageMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: `${SITE_CONFIG.description} Order online for fast delivery in Hyderabad.`,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/roti_dukaan_logo.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/roti_dukaan_logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_URL,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address,
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    servesCuisine: ["Indian", "North Indian", "South Indian"],
    priceRange: "₹₹",
    areaServed: {
      "@type": "City",
      name: "Hyderabad",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "11:00",
        closes: "19:30",
      },
    ],
    sameAs: [],
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/menu?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProductJsonLd({
  name,
  description,
  slug,
  image,
  price,
  isAvailable,
}: {
  name: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  isAvailable: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: absoluteUrl(image),
    url: absoluteUrl(`/menu/${slug}`),
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/menu/${slug}`),
      priceCurrency: "INR",
      price: price.toFixed(2),
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function getBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export async function getMenuSlugsForSitemap(): Promise<string[]> {
  const apiBase =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://api.rotidukaan.com";

  try {
    const res = await fetch(
      `${apiBase.replace(/\/$/, "")}/api/v1/menu/items?limit=500&available=true`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.data?.items || [];
    return items
      .map((item: { slug?: string }) => item.slug)
      .filter((slug: string | undefined): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}

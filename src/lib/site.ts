import { storeDownloadPath, storeUrls } from "./stores";

/** Keep in sync with next-frontend `SITE_CONFIG.fssaiLicense`. */
export const fssaiLicense =
  process.env.NEXT_PUBLIC_FSSAI_LICENSE?.trim() || "23626028003051";

export const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
] as const;

export const storeLinks = {
  playStore: storeUrls.playStore,
  appStore: storeUrls.appStore,
  smartDownload: storeDownloadPath,
};

export const socialLinks = [
  {
    label: "Facebook",
    href:
      process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ||
      "https://www.facebook.com/share/1FTWZhnJr6/",
    icon: "/images/facebook_icon.png",
  },
  {
    label: "Instagram",
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
      "https://www.instagram.com/rotidukaan/",
    icon: "/images/instagram_icon.png",
  },
  {
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
    icon: "/images/youtube_icon.png",
  },
];

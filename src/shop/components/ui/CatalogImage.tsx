"use client";

import Image, { type ImageProps } from "next/image";
import {
  resolveImageUrl,
  shouldUnoptimizeImage,
} from "@shop/lib/catalog-image";

type CatalogImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

/** Menu/catalog image — CDN direct + lazy load for list thumbnails. */
export function CatalogImage({
  src,
  alt,
  priority,
  ...rest
}: CatalogImageProps) {
  const resolved = resolveImageUrl(src);
  return (
    <Image
      {...rest}
      src={resolved}
      alt={alt}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      unoptimized={shouldUnoptimizeImage(resolved)}
    />
  );
}

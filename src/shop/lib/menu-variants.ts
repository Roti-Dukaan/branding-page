import type { ApiProductVariant } from "./types/api";
import type { MenuItemVariant } from "./types";

export function mapApiVariants(variants?: ApiProductVariant[]): MenuItemVariant[] {
  return (variants ?? [])
    .filter((variant) => variant.isAvailable && variant.name?.trim())
    .map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      displayPrice:
        variant.displayPrice != null ? Number(variant.displayPrice) : undefined,
      isDefault: variant.isDefault,
      isAvailable: variant.isAvailable,
      sortOrder: variant.sortOrder,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function defaultVariant(variants: MenuItemVariant[]): MenuItemVariant | undefined {
  if (!variants.length) return undefined;
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

export function variantUnitPrice(variant: MenuItemVariant): number {
  return variant.displayPrice ?? variant.price;
}

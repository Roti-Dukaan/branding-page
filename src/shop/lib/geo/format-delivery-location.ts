import type { DeliveryAddress } from "@shop/lib/types";

export const DELIVERY_LOCATION_PLACEHOLDER = "Choose Delivery Location";

const MAX_LABEL_LENGTH = 40;

function truncateLabel(text: string, maxLength = MAX_LABEL_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function normalizePart(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSamePlace(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function dedupeParts(parts: string[]): string[] {
  return parts.filter(
    (part, index) => index === 0 || !isSamePlace(part, parts[index - 1]),
  );
}

function getAddressStreetParts(address: DeliveryAddress): string[] {
  return dedupeParts(
    [
      normalizePart(address.house),
      normalizePart(address.apartment),
      normalizePart(address.street),
      normalizePart(address.area),
    ].filter((part): part is string => Boolean(part)),
  );
}

export function formatSavedAddressLabel(address: DeliveryAddress): string | null {
  const parts = getAddressStreetParts(address);

  if (parts.length > 0) {
    return truncateLabel(parts.join(", "));
  }

  const city = normalizePart(address.city);
  return city ? truncateLabel(city) : null;
}

/** Full saved-address line for cards and summaries (not truncated). */
export function formatFullAddress(address: DeliveryAddress): string {
  const streetParts = getAddressStreetParts(address);
  const city = normalizePart(address.city);
  const state = normalizePart(address.state);
  const pincode = normalizePart(address.pincode);

  const cityState = [city, state].filter(Boolean).join(", ");
  const locationSuffix =
    cityState && pincode
      ? `${cityState} - ${pincode}`
      : pincode || cityState || "";

  if (streetParts.length > 0 && locationSuffix) {
    return `${streetParts.join(", ")}, ${locationSuffix}`;
  }
  if (streetParts.length > 0) {
    return streetParts.join(", ");
  }
  return locationSuffix || "Address unavailable";
}

export interface DeliveryLocationInput {
  address?: DeliveryAddress | null;
  areaName?: string | null;
  city?: string | null;
  formattedAddress?: string | null;
  placeholder?: string;
}

export function formatDeliveryLocationLabel(
  input: DeliveryLocationInput,
): string {
  const placeholder = input.placeholder ?? DELIVERY_LOCATION_PLACEHOLDER;

  if (input.address) {
    const savedLabel = formatSavedAddressLabel(input.address);
    if (savedLabel) return savedLabel;
  }

  const area = normalizePart(input.areaName);
  const city = normalizePart(input.city);

  if (area && (!city || !isSamePlace(area, city))) {
    return truncateLabel(area);
  }

  const formatted = normalizePart(input.formattedAddress);
  if (formatted) return truncateLabel(formatted);

  return placeholder;
}

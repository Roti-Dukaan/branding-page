export const HYDERABAD_DEFAULT_CENTER = {
  lat: 17.385,
  lng: 78.4867,
} as const;

const PLACEHOLDER_EPSILON = 0.001;

export function isPlaceholderCoordinates(
  lat?: number | null,
  lng?: number | null,
): boolean {
  if (lat == null || lng == null) {
    return true;
  }

  return (
    Math.abs(lat - HYDERABAD_DEFAULT_CENTER.lat) < PLACEHOLDER_EPSILON &&
    Math.abs(lng - HYDERABAD_DEFAULT_CENTER.lng) < PLACEHOLDER_EPSILON
  );
}

export function buildAddressGeocodeQueries(parts: {
  house?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): string[] {
  const queries: string[] = [];
  const city = parts.city?.trim() || "Hyderabad";
  const state = parts.state?.trim() || "Telangana";
  const pincode = parts.pincode?.trim();

  const isMeaningful = (value?: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.length >= 3 && /[a-zA-Z0-9]/.test(trimmed);
  };

  const fullParts = [parts.house, parts.street, parts.area, city, state, pincode].filter(
    isMeaningful,
  );

  if (fullParts.length >= 3) {
    queries.push(`${fullParts.join(", ")}, India`);
  }

  if (isMeaningful(parts.area) && pincode) {
    queries.push(`${parts.area}, ${city}, ${state} ${pincode}, India`);
  }

  if (pincode?.length === 6) {
    queries.push(`${pincode}, ${city}, ${state}, India`);
  }

  return [...new Set(queries)];
}

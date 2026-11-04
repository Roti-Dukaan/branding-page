/** City key for `/app/home-page?location=` — must match admin target location names. */

const HYDERABAD_METRO_KEYS = [
  "hyderabad",
  "secunderabad",
  "cyberabad",
  "gachibowli",
  "hitech",
  "manikonda",
  "kondapur",
  "madhapur",
  "nanakramguda",
  "narsingi",
  "kokapet",
  "tellapur",
  "lingampally",
  "miyapur",
  "kukatpally",
  "attapur",
  "shamshabad",
] as const;

const SKIP_ADDRESS_PARTS = new Set([
  "india",
  "telangana",
  "andhra pradesh",
  "karnataka",
  "maharashtra",
  "tamil nadu",
  "kerala",
  "delhi",
  "uttar pradesh",
  "rajasthan",
  "gujarat",
  "west bengal",
  "punjab",
  "haryana",
  "madhya pradesh",
  "bihar",
  "odisha",
  "goa",
  "assam",
]);

function titleCaseCity(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function isHyderabadMetroLabel(lower: string): boolean {
  return HYDERABAD_METRO_KEYS.some((key) => lower.includes(key));
}

export function mapCityForCmsTargeting(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (isHyderabadMetroLabel(lower)) return "Hyderabad";
  return titleCaseCity(trimmed);
}

export function cityFromCommaSeparatedAddress(address?: string | null): string | null {
  if (!address?.trim()) return null;
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const part = parts[i];
    const lower = part.toLowerCase();
    if (SKIP_ADDRESS_PARTS.has(lower)) continue;
    if (/^\d{6}$/.test(part)) continue;
    return mapCityForCmsTargeting(part);
  }
  return null;
}

export function resolveCmsLocation(input: {
  city?: string | null;
  areaName?: string | null;
  formattedAddress?: string | null;
  branchName?: string | null;
  deliveryLabel?: string | null;
}): string | null {
  const candidates = [
    input.city,
    cityFromCommaSeparatedAddress(input.formattedAddress),
    cityFromCommaSeparatedAddress(input.deliveryLabel),
    mapCityForCmsTargeting(input.areaName),
  ];

  for (const raw of candidates) {
    const mapped = mapCityForCmsTargeting(raw);
    if (mapped) return mapped;
  }

  const label = (input.deliveryLabel ?? input.formattedAddress ?? "").toLowerCase();
  if (isHyderabadMetroLabel(label)) return "Hyderabad";

  const branch = (input.branchName ?? "").toLowerCase();
  if (branch.includes("hyderabad") || branch.includes("hyd")) return "Hyderabad";

  return null;
}

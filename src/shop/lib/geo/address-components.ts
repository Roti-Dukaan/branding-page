export interface GeocoderAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const AREA_TYPE_PRIORITY = [
  "sublocality_level_1",
  "sublocality_level_2",
  "sublocality",
  "neighborhood",
  "administrative_area_level_3",
  "administrative_area_level_2",
] as const;

export function extractAreaName(
  components: GeocoderAddressComponent[],
): string {
  for (const type of AREA_TYPE_PRIORITY) {
    const match = components.find((component) => component.types.includes(type));
    if (match?.long_name?.trim()) {
      return match.long_name.trim();
    }
  }
  return "";
}

export function extractCity(components: GeocoderAddressComponent[]): string {
  const locality = components.find((component) =>
    component.types.includes("locality"),
  );
  if (locality?.long_name?.trim()) {
    return locality.long_name.trim();
  }

  const district = components.find((component) =>
    component.types.includes("administrative_area_level_2"),
  );
  if (district?.long_name?.trim()) {
    return district.long_name.trim();
  }

  const state = components.find((component) =>
    component.types.includes("administrative_area_level_1"),
  );
  if (state?.long_name?.trim()) {
    return state.long_name.trim();
  }

  return "";
}

export function extractPincode(
  components: GeocoderAddressComponent[],
): string {
  const postal = components.find((component) =>
    component.types.includes("postal_code"),
  );
  return postal?.long_name?.trim() ?? "";
}

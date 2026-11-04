export function cartLineId(foodItemId: string, variantId?: string | null): string {
  const variant = variantId?.trim();
  return variant ? `${foodItemId}:${variant}` : foodItemId;
}

export function parseCartLineId(lineId: string): { foodItemId: string; variantId?: string } {
  const idx = lineId.indexOf(":");
  if (idx === -1) return { foodItemId: lineId };
  return { foodItemId: lineId.slice(0, idx), variantId: lineId.slice(idx + 1) };
}

export function remoteCartLineKey(foodItemId: string, variantId?: string | null): string {
  return `${foodItemId}|${variantId?.trim() || ""}`;
}

/** Coerce unknown persisted values back to arrays so `.map` / `.some` never crash. */
export function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

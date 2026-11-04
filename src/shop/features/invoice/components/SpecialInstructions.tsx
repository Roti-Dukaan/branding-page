const BRAND_PRIMARY = "#C96A2B";

interface SpecialInstructionsProps {
  instructions?: string[];
}

export function SpecialInstructions({ instructions }: SpecialInstructionsProps) {
  if (!instructions?.length) return null;

  return (
    <section className="py-4">
      <h2
        className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: BRAND_PRIMARY }}
      >
        Special Instructions
      </h2>

      <ul className="flex flex-wrap gap-2">
        {instructions.map((instruction) => (
          <li
            key={instruction}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
          >
            {instruction}
          </li>
        ))}
      </ul>
    </section>
  );
}

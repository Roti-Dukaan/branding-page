"use client";

type DietFilterValue = "All" | "Veg" | "NonVeg";

interface DietFilterProps {
  value: DietFilterValue;
  onChange: (value: DietFilterValue) => void;
  className?: string;
}

export function DietFilter({ value, onChange, className = "" }: DietFilterProps) {
  return (
    <div
      className={`inline-flex w-full sm:w-auto bg-cream-deep/50 p-1.5 rounded-xl border border-sand/60 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("All")}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
          value === "All"
            ? "bg-white text-primary-amber shadow-sm"
            : "text-gray-500 hover:text-charcoal"
        }`}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => onChange("Veg")}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
          value === "Veg"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-gray-500 hover:text-emerald-600"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block border border-white shrink-0" />
        Pure Veg
      </button>
      <button
        type="button"
        onClick={() => onChange("NonVeg")}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
          value === "NonVeg"
            ? "bg-rose-700 text-white shadow-sm"
            : "text-gray-500 hover:text-rose-700"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-rose-300 inline-block border border-white shrink-0" />
        Non Veg
      </button>
    </div>
  );
}

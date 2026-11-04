"use client";

interface InvoicePrintButtonProps {
  label?: string;
}

export function InvoicePrintButton({ label = "Print Invoice" }: InvoicePrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center justify-center rounded-xl border border-[#C96A2B] bg-[#C96A2B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b55f26]"
    >
      {label}
    </button>
  );
}

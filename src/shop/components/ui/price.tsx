import { cn, formatPriceAmount } from "@shop/lib/utils";

type PriceProps = {
  value: number;
  className?: string;
  symbolClassName?: string;
};

export function Price({ value, className, symbolClassName }: PriceProps) {
  return (
    <span className={className}>
      <span
        className={cn(
          "font-['Times_New_Roman',Times,serif]",
          symbolClassName,
        )}
      >
        ₹
      </span>
      {formatPriceAmount(value)}
    </span>
  );
}

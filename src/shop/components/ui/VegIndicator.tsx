import { cn } from "@shop/lib/utils";

export type FoodType = "VEG" | "NON_VEG" | "EGG";

const FOOD_TYPE_STYLES: Record<
  FoodType,
  { border: string; marker: "dot" | "triangle"; fill: string }
> = {
  VEG: { border: "border-green-600", marker: "dot", fill: "bg-green-600" },
  NON_VEG: { border: "border-red-700", marker: "triangle", fill: "border-b-red-700" },
  EGG: { border: "border-orange-500", marker: "triangle", fill: "border-b-orange-500" },
};

export function resolveFoodType(
  foodType?: FoodType | string | null,
  isVeg?: boolean
): FoodType {
  if (foodType === "VEG" || foodType === "NON_VEG" || foodType === "EGG") {
    return foodType;
  }
  return isVeg === false ? "NON_VEG" : "VEG";
}

interface VegIndicatorProps {
  foodType?: FoodType | string | null;
  isVeg?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function VegIndicator({
  foodType,
  isVeg,
  size = "sm",
  className,
}: VegIndicatorProps) {
  const type = resolveFoodType(foodType, isVeg);
  const styles = FOOD_TYPE_STYLES[type];
  const boxSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div
      className={cn(
        boxSize,
        "border-[1.5px] flex items-center justify-center bg-white rounded-sm",
        styles.border,
        className
      )}
      aria-label={type === "VEG" ? "Vegetarian" : type === "EGG" ? "Contains egg" : "Non-vegetarian"}
    >
      {styles.marker === "dot" ? (
        <div className={cn("rounded-full", size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5", styles.fill)} />
      ) : (
        <div
          className={cn(
            "w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent",
            styles.fill
          )}
        />
      )}
    </div>
  );
}

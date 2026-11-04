export type SubscriptionBillingCycle = "WEEKLY" | "MONTHLY";

export interface SubscriptionDurationOption {
  id: string;
  days: number;
  label: string;
  estimatedCalendarDays?: number;
  isDefault?: boolean;
  discountPercent?: number;
}

export interface PackageMealSlotSummary {
  id: string;
  name: string;
  basePrice?: number;
  mealType?: string;
  deliverySlotId?: string;
}

export interface PackageMenuItem {
  menuItemId?: string;
  imageUrl?: string | null;
  menuItem?: {
    id?: string;
    name?: string;
    image?: string | null;
    category?: string;
  };
}

export interface PackageCategory {
  id: string;
  category?: string;
  categoryName?: string;
  categoryPrice: number;
  active: boolean;
  includedQuantityPerDelivery?: number;
  maximumQuantityPerDelivery?: number;
  menuItems?: PackageMenuItem[];
}

export interface AllowedFoodItem {
  foodItemId: string;
  imageUrl?: string | null;
  foodItem?: {
    id?: string;
    name?: string;
    imageUrl?: string | null;
  };
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string | null;
  billingCycle?: SubscriptionBillingCycle | string;
  type?: SubscriptionBillingCycle | string;
  categories?: PackageCategory[];
  foodItemIds?: string[];
  allowedFoodItems?: AllowedFoodItem[];
  finalPrice?: number | string | null;
  originalPrice?: number | string | null;
  startingFromPrice?: number | string | null;
  priceLabel?: string | null;
  deliveriesPerCycle?: number;
  allowCustomerCategorySelection?: boolean;
  badge?: string | null;
  validityDays?: number;
  skipLimitDisplay?: string | null;
  skipEnabled?: boolean;
  planImageUrl?: string | null;
  hasMealSlotPricing?: boolean;
  durationOptions?: SubscriptionDurationOption[];
  mealSlots?: PackageMealSlotSummary[];
}

export interface PlanMealSlot {
  id: string;
  deliverySlotId: string;
  mealType: string;
  name: string;
  basePrice: number;
  deliveryWindow: string;
  customizationEnabled?: boolean;
  skipEnabled?: boolean;
}

export interface PlanMealBundle {
  id: string;
  name: string;
  price: number;
  mealSlotIds: string[];
  savingsLabel?: string | null;
  individualTotal?: number;
  savingsAmount?: number;
}

export interface MealSlotCatalogue {
  mealSlots: PlanMealSlot[];
  bundles: PlanMealBundle[];
}

export interface MealSlotQuote {
  finalPrice: number;
  originalPrice: number;
  priceLabel?: string;
  perDeliveryPrice?: number;
  deliveryCount?: number;
  savingsAmount?: number;
  selectedMealSlotIds?: string[];
  bundleId?: string | null;
  durationOption?: SubscriptionDurationOption | null;
}

export interface WeeklyScheduleItem {
  foodItemId: string;
  name: string;
  imageUrl?: string | null;
  isVeg?: boolean;
  groupName?: string | null;
  mealOption?: string | null;
  quantity?: number;
}

export interface WeeklyScheduleDay {
  day: string;
  dayLabel: string;
  deliveryEnabled: boolean;
  items: WeeklyScheduleItem[];
}

export interface WeeklySchedulePreview {
  planId: string;
  planName: string;
  source?: string;
  days: WeeklyScheduleDay[];
}

export interface WeeklyMenuSelectionItem {
  menuItemId: string;
  quantity: number;
  name?: string;
}

export interface WeeklyMenuOverride {
  day: string;
  mealSlotId: string;
  items: WeeklyMenuSelectionItem[];
}

export interface PackagePreviewMenuResponse {
  preview?: boolean;
  packageId: string;
  day: string;
  mealSlotId: string;
  mealSlotName?: string;
  mealType?: string;
  selectedItems: Array<{ menuItemId: string; quantity: number; menuItemNameSnapshot?: string }>;
  menuOptions: Array<{
    menuItemId: string;
    name: string;
    category: string;
    categoryLabel?: string;
    includedQuantityPerDelivery: number;
    maximumQuantityPerDelivery: number;
    allowsMultipleItemSelection?: boolean;
    maximumChoicesPerDelivery?: number | null;
  }>;
}

export interface SubscriptionCheckoutDraft {
  packageId: string;
  mealSlotIds: string[];
  deliverySlotIds: string[];
  categoryIds: string[];
  bundleId?: string | null;
  durationOptionId?: string | null;
  quotedPrice?: number | null;
  weeklyMenuOverrides?: WeeklyMenuOverride[];
}

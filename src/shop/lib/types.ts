export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  displayPrice?: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  tags?: string[];
  isSpecial?: boolean;
  rating?: number;
  preparationTime?: string;
  gstPercentage?: number;
  gstType?: string;
  variants?: MenuItemVariant[];
}

export interface CartItem {
  id: string;
  foodItemId: string;
  foodItemVariantId?: string;
  variantName?: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  quantity: number;
  category: string;
  gstPercentage?: number;
  gstType?: string;
}

export type AddressType = "home" | "work" | "other";

export interface DeliveryAddress {
  id: string;
  name?: string;
  phone: string;
  house: string;
  apartment?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface DeliverySlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
  quickDelivery?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  rotisPerDay: number;
  weeklyPrice: number;
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
}

export interface Review {
  id: string;
  name: string;
  role?: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface SpecialItem {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: "Chef Special" | "Popular" | "Best Seller";
  image: string;
  isVeg: boolean;
  rating: number;
}

export interface OrderDetails {
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  deliverySlot: DeliverySlot;
  paymentMethod: "online" | "cod";
  subtotal: number;
  deliveryCharge: number;
  platformFee: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface SubscriptionOrder {
  plan: SubscriptionPlan;
  billingCycle: "weekly" | "monthly";
  deliveryTime: "morning" | "afternoon" | "evening";
  address: DeliveryAddress;
  name: string;
  phone: string;
  specialInstructions?: string;
}

export type HealthTag =
  | "high-fiber"
  | "gluten-free"
  | "healthy"
  | "protein-rich"
  | "homemade"
  | "fresh-daily"
  | "no-preservatives";

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  servingSize: string;
}

export interface PairingItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  isVeg: boolean;
}

export interface ProductDetails extends MenuItem {
  slug: string;
  shortDescription: string;
  longDescription: string;
  ingredients: string[];
  nutrition: NutritionInfo;
  healthTags: HealthTag[];
  benefits: string[];
  availability: "available" | "unavailable" | "out-of-stock";
  preparationTime: string;
  servings: string;
  galleryImages: string[];
  pairings: PairingItem[];
  cookingPreferences: string[];
  mockOrders: string;
  rating: number;
  reviewCount: number;
}

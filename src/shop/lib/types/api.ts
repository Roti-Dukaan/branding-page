export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiHomepageBanner {
  id: string;
  title: string;
  subtitle: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  redirectType: 'NONE' | 'CATEGORY' | 'PRODUCT' | 'SUBSCRIPTION' | 'EXTERNAL_URL';
  redirectValue: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface ApiProductVariant {
  id: string;
  name: string;
  price: number;
  displayPrice?: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ApiProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  description: string | null;
  basePrice: number | string;
  price: number;
  discountPrice: number | null;
  listDisplayPrice?: number | null;
  displayPrice?: number | string;
  gstPercentage?: number;
  gstAmount?: number;
  currency?: string;
  gstType?: string;
  imageUrl: string | null;
  gallery: string[];
  isVeg: boolean;
  foodType?: FoodType;
  isFeatured: boolean;
  isAvailable: boolean;
  preparationTime: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
  servingSize: string | null;
  variants?: ApiProductVariant[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPricingBreakdown {
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  igstAmount: number;
  isInterState: boolean;
  deliveryCharge: number;
  packagingCharge: number;
  discount: number;
  freeDelivery: boolean;
  standardDeliveryCharge?: number;
  grandTotal: number;
  currency: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  veg?: 'veg' | 'non_veg';
  available?: boolean;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name' | 'sort_order';
}

import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

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

export const homepageBannerApi = {
  async getActiveBanners(): Promise<ApiResponse<ApiHomepageBanner[]>> {
    const { data } = await apiClient.get('/homepage/banners');
    return data;
  },
};
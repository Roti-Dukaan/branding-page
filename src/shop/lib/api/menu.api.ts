import { apiClient } from './client';
import type { ApiResponse, PaginatedData, ApiCategory, ApiProduct, ProductQueryParams } from '../types/api';

export const categoryApi = {
  async list(params?: { limit?: number; sort?: string; order?: string }): Promise<ApiResponse<PaginatedData<ApiCategory>>> {
    const { data } = await apiClient.get('/menu/categories', { params });
    return data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<ApiCategory>> {
    const { data } = await apiClient.get(`/menu/categories/${slug}`);
    return data;
  },
};

export const productApi = {
  async list(params?: ProductQueryParams): Promise<ApiResponse<PaginatedData<ApiProduct>>> {
    const { data } = await apiClient.get('/menu/items', { params });
    return data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<ApiProduct>> {
    const { data } = await apiClient.get(`/menu/items/${slug}`);
    return data;
  },

  async listByCategory(categorySlug: string, params?: ProductQueryParams): Promise<ApiResponse<PaginatedData<ApiProduct>>> {
    const { data } = await apiClient.get(`/menu/categories/${categorySlug}/items`, { params });
    return data;
  },
};

export const branchMenuApi = {
  async getMenu(branchId: string, params?: { categoryId?: string; search?: string }): Promise<ApiResponse<ApiProduct[]>> {
    const { data } = await apiClient.get('/branch/menu', { params: { branchId, ...params } });
    return data;
  },

  async getCategories(branchId: string): Promise<ApiResponse<{ id: string; name: string; slug: string }[]>> {
    const { data } = await apiClient.get('/branch/menu/categories', { params: { branchId } });
    return data;
  },
};

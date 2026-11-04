import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@shop/lib/types/api";
import { useAuthStore } from "@shop/lib/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function clearAuthSession() {
  if (typeof window === "undefined") return;
  try {
    useAuthStore.getState().logout();
  } catch {
    // ignore store errors
  }
  localStorage.removeItem("roti-dukaan-auth");
  window.dispatchEvent(new Event("auth:logout"));
}

/** Extract a user-facing message from axios / API errors. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: string[] } | undefined;
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (Array.isArray(data?.errors) && data.errors[0]) {
      return data.errors[0];
    }
    if (error.response?.status) {
      return `Request failed (${error.response.status})`;
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** Unwrap `{ success, data }` API responses; throw on malformed payloads. */
export function unwrapApiResponse<T>(
  response: { data: ApiResponse<T> },
  fallbackMessage = "Unexpected server response",
): T {
  const body = response.data;
  if (!body?.success || body.data === undefined || body.data === null) {
    throw new Error(body?.message || fallbackMessage);
  }
  return body.data;
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
});

const getStoredTokens = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("roti-dukaan-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (state?.isAuthenticated && state?.accessToken) {
      return {
        accessToken: state.accessToken as string,
        refreshToken: state.refreshToken as string | null,
      };
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
const refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers.length = 0;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/customer-auth/refresh"
    ) {
      const tokens = getStoredTokens();
      const refreshToken = tokens?.refreshToken;

      if (!refreshToken) {
        clearAuthSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newAccessToken: string) => {
            if (!newAccessToken) {
              reject(error);
              return;
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post("/customer-auth/refresh", { refreshToken });
        const newAccessToken = data.data.accessToken as string;
        const newRefreshToken = data.data.refreshToken as string;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        const raw = localStorage.getItem("roti-dukaan-auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state = {
            ...parsed.state,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          localStorage.setItem("roti-dukaan-auth", JSON.stringify(parsed));
        }

        onTokenRefreshed(newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        onTokenRefreshed("");
        clearAuthSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

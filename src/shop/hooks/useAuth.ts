import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@shop/lib/toast";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { userHasProfileName } from "@shop/lib/profile-utils";
import {
  sendOtp,
  verifyOtp as verifyOtpApi,
  logout as logoutApi,
  getCurrentUser,
  refreshToken as refreshTokenApi,
} from "@shop/services/auth.service";
import type { VerifyOtpResponse } from "@shop/services/auth.service";
import { locationService } from "@shop/services/location.service";

const RATE_LIMIT_DEFAULT_SECONDS = 60;

/** True once the persisted auth store has rehydrated from localStorage. */
export function useAuthHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}

function parseRetryAfter(message: string): number {
  // Backend sends: "Too many requests for this number. Please wait 56s before trying again."
  const match = /wait (\d+)s/i.exec(message);
  if (match) return parseInt(match[1], 10);
  return RATE_LIMIT_DEFAULT_SECONDS;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  useEffect(() => {
    if (!isRateLimited || rateLimitCountdown <= 0) return;
    const timer = setTimeout(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [isRateLimited, rateLimitCountdown]);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
    setRateLimitCountdown(0);
  }, []);

  const handleApiError = useCallback((err: any) => {
    const message = err?.response?.data?.message || "Something went wrong. Please try again.";
    setError(message);

    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("too many requests") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("maximum verification attempts exceeded")
    ) {
      toast.error(message, { duration: 4000 });
      setIsRateLimited(true);
      setRateLimitCountdown(parseRetryAfter(message));
    } else {
      toast.error(message);
    }
    throw err;
  }, []);

  const sendOtpAction = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);
    clearRateLimit();
    try {
      const result = await sendOtp(phone);
      return result;
    } catch (err: any) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearRateLimit, handleApiError]);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const result: VerifyOtpResponse = await verifyOtpApi(phone, otp);
      const backendCustomer = result.customer;

      const mappedUser = {
        id: backendCustomer.id,
        name: backendCustomer.fullName || backendCustomer.email || backendCustomer.phone || "User",
        phone: backendCustomer.phone || phone,
        email: backendCustomer.email,
        avatar: undefined,
      };

      useAuthStore.getState().login(mappedUser, result.accessToken, result.refreshToken, result.isNewUser);
      void locationService.hydrateFromServer();
      if (!userHasProfileName(mappedUser, backendCustomer.fullName)) {
        useAuthStore.getState().setProfileNameDialogOpen(true);
      }
      clearRateLimit();
      toast.success(result.isNewUser ? "Welcome to Roti Dukaan!" : "Welcome back!");
      return result;
    } catch (err: any) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearRateLimit, handleApiError]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { refreshToken: rt } = useAuthStore.getState();
      if (rt) {
        await logoutApi(rt);
      }
      useAuthStore.getState().logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      useAuthStore.getState().logout();
      toast.error("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const currentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      return user;
    } catch (err: any) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const refresh = useCallback(async () => {
    const { refreshToken: rt } = useAuthStore.getState();
    if (!rt) throw new Error("No refresh token");
    const result = await refreshTokenApi(rt);
    useAuthStore.getState().setTokens(result.accessToken, result.refreshToken);
    return result;
  }, []);

  return {
    sendOtp: sendOtpAction,
    verifyOtp,
    logout,
    currentUser,
    refresh,
    loading,
    error,
    isRateLimited,
    rateLimitCountdown,
    clearRateLimit,
  };
}

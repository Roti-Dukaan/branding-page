import { apiClient } from "@shop/lib/api/client";

export interface SendOtpResponse {
  otp?: string;
  message: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
  customer: {
    id: string;
    email?: string;
    phone?: string;
    fullName?: string;
  };
}

export interface CurrentUserResponse {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const { data } = await apiClient.post("/customer-auth/send-otp", { identifier: phone });
  return data.data;
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post("/customer-auth/login", { identifier: phone, otp });
  return data.data;
}

export async function getUserProfile(): Promise<CurrentUserResponse> {
  const { data } = await apiClient.get("/customers/me");
  return data.data;
}

export async function updateUserProfile(data: {
  fullName?: string;
  name?: string;
  email?: string;
  gender?: string;
}): Promise<CurrentUserResponse> {
  const { data: result } = await apiClient.patch("/customers/me", data);
  return result.data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const { data } = await apiClient.get("/customer-auth/me");
  return data.data;
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const { data } = await apiClient.post("/customer-auth/refresh", { refreshToken });
  return data.data;
}

export async function logout(refreshToken: string): Promise<LogoutResponse> {
  const { data } = await apiClient.post("/customer-auth/logout", { refreshToken });
  return data.data;
}

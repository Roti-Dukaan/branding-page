import { apiClient, getApiErrorMessage, unwrapApiResponse } from "@shop/lib/api/client";

export interface SubmitContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(payload: SubmitContactMessagePayload) {
  try {
    const response = await apiClient.post("/contact-messages", payload);
    return unwrapApiResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to send message"));
  }
}
